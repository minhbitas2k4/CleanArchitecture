using MediatR;
using SalesManagement.Application.Common.Exceptions;
using SalesManagement.Application.Common.Interfaces;
using SalesManagement.Application.Features.Products.DTOs;
using SalesManagement.Domain.Entities;

namespace SalesManagement.Application.Features.Products.Commands.CreateProduct;

public sealed class CreateProductCommandHandler(
    IProductRepository productRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<CreateProductCommand, ProductDto>
{
    public async Task<ProductDto> Handle(
        CreateProductCommand request,
        CancellationToken cancellationToken)
    {
        var normalizedSku = request.Sku.Trim().ToUpperInvariant();
        var skuExists = await productRepository.ExistsBySkuAsync(
            normalizedSku,
            cancellationToken: cancellationToken);

        if (skuExists)
        {
            throw new ConflictException($"Mã SKU '{request.Sku}' đã tồn tại.");
        }

        var product = Product.Create(
            request.Name,
            request.Sku,
            request.Price,
            request.StockQuantity,
            request.Description,
            request.IsActive);

        await productRepository.AddAsync(product, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return product.ToDto();
    }
}
