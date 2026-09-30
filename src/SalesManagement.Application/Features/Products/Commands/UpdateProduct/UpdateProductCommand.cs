using MediatR;
using SalesManagement.Application.Features.Products.DTOs;

namespace SalesManagement.Application.Features.Products.Commands.UpdateProduct;

public sealed record UpdateProductCommand(
    Guid Id,
    string Name,
    string Sku,
    decimal Price,
    int StockQuantity,
    string? Description,
    bool IsActive) : IRequest<ProductDto>;
