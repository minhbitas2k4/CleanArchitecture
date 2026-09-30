using SalesManagement.Application.Common.Models;
using SalesManagement.Domain.Entities;

namespace SalesManagement.Application.Common.Interfaces;

public interface IProductRepository : IRepository<Product>
{
    Task<Product?> GetByIdReadOnlyAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsBySkuAsync(
        string sku,
        Guid? excludingProductId = null,
        CancellationToken cancellationToken = default);

    Task<PagedResult<Product>> GetPagedAsync(
        string? search,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);
}
