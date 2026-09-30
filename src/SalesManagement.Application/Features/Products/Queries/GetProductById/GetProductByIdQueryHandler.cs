using MediatR;
using SalesManagement.Application.Common.Exceptions;
using SalesManagement.Application.Common.Interfaces;
using SalesManagement.Application.Features.Products.DTOs;

namespace SalesManagement.Application.Features.Products.Queries.GetProductById;

public sealed class GetProductByIdQueryHandler(IProductRepository productRepository)
    : IRequestHandler<GetProductByIdQuery, ProductDto>
{
    public async Task<ProductDto> Handle(
        GetProductByIdQuery request,
        CancellationToken cancellationToken)
    {
        var product = await productRepository
            .GetByIdReadOnlyAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"Không tìm thấy sản phẩm với Id '{request.Id}'.");

        return product.ToDto();
    }
}
