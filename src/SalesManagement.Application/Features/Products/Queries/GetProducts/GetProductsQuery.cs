using MediatR;
using SalesManagement.Application.Common.Models;
using SalesManagement.Application.Features.Products.DTOs;

namespace SalesManagement.Application.Features.Products.Queries.GetProducts;

public sealed record GetProductsQuery(
    string? Search,
    int PageNumber = 1,
    int PageSize = 20) : IRequest<PagedResult<ProductDto>>;
