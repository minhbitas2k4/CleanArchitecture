using MediatR;
using SalesManagement.Application.Common.Exceptions;
using SalesManagement.Application.Common.Interfaces;
using SalesManagement.Application.Features.Products.DTOs;

namespace SalesManagement.Application.Features.Products.Commands.UpdateProduct;

public sealed class UpdateProductCommandHandler(
    IProductRepository productRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateProductCommand, ProductDto>
{
    public async Task<ProductDto> Handle(
        UpdateProductCommand request,
        CancellationToken cancellationToken)
    {
        var product = await productRepository
            .GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"Không tìm thấy sản phẩm với Id '{request.Id}'.");

        var normalizedSku = request.Sku.Trim().ToUpperInvariant();
        var skuExists = await productRepository.ExistsBySkuAsync(
            normalizedSku,
            request.Id,
            cancellationToken);

        if (skuExists)
        {
            throw new ConflictException($"Mã SKU '{request.Sku}' đã tồn tại.");
        }

        product.Update(
            request.Name,
            request.Sku,
            request.Price,
            request.StockQuantity,
            request.Description,
            request.IsActive);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return product.ToDto();
    }
}
