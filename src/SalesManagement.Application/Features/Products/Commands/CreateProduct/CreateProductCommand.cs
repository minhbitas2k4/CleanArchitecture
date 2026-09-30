using MediatR;
using SalesManagement.Application.Features.Products.DTOs;

namespace SalesManagement.Application.Features.Products.Commands.CreateProduct;

public sealed record CreateProductCommand(
    string Name,
    string Sku,
    decimal Price,
    int StockQuantity,
    string? Description,
    bool IsActive = true) : IRequest<ProductDto>;
