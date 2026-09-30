using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using SalesManagement.Application.Common.Exceptions;
using System.Net;
using System.Text.Json;

namespace SalesManagement.Api.Middleware;

public sealed class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Unhandled exception while processing {Path}", context.Request.Path);
            await HandleExceptionAsync(context, exception);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title, detail) = exception switch
        {
            ValidationException validationException =>
                ((int)HttpStatusCode.BadRequest, "Validation failed", validationException.Message),
            NotFoundException notFoundException =>
                ((int)HttpStatusCode.NotFound, "Resource not found", notFoundException.Message),
            ConflictException conflictException =>
                ((int)HttpStatusCode.Conflict, "Conflict", conflictException.Message),
            _ => ((int)HttpStatusCode.InternalServerError, "An unexpected error occurred", null)
        };

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        };

        if (exception is ValidationException validation)
        {
            problemDetails.Extensions["errors"] = validation.Errors
                .GroupBy(error => error.PropertyName)
                .ToDictionary(
                    group => group.Key,
                    group => group.Select(error => error.ErrorMessage).ToArray());
        }

        await context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails));
    }
}
