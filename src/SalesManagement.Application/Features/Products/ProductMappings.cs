using SalesManagement.Domain.Entities;
using SalesManagement.Application.Features.Products.DTOs;

namespace SalesManagement.Application.Features.Products;

public static class ProductMappings
{
    public static ProductDto ToDto(this Product product) => new(
        product.Id,
        product.Name,
        product.Sku,
        product.Price,
        product.StockQuantity,
        product.Description,
        product.IsActive,
        product.CreatedAtUtc,
        product.UpdatedAtUtc);
}
