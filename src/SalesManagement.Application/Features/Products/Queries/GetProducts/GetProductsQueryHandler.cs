using MediatR;
using SalesManagement.Application.Common.Interfaces;
using SalesManagement.Application.Common.Models;
using SalesManagement.Application.Features.Products.DTOs;

namespace SalesManagement.Application.Features.Products.Queries.GetProducts;

public sealed class GetProductsQueryHandler(IProductRepository productRepository)
    : IRequestHandler<GetProductsQuery, PagedResult<ProductDto>>
{
    public async Task<PagedResult<ProductDto>> Handle(
        GetProductsQuery request,
        CancellationToken cancellationToken)
    {
        var pagedProducts = await productRepository.GetPagedAsync(
            request.Search,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        return new PagedResult<ProductDto>(
            pagedProducts.Items.Select(product => product.ToDto()).ToList(),
            request.PageNumber,
            request.PageSize,
            pagedProducts.TotalCount);
    }
}
