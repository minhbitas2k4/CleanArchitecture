using Microsoft.EntityFrameworkCore;
using SalesManagement.Application.Common.Interfaces;
using SalesManagement.Application.Common.Models;
using SalesManagement.Domain.Entities;
using SalesManagement.Infrastructure.Persistence;

namespace SalesManagement.Infrastructure.Repositories;

public sealed class ProductRepository(ApplicationDbContext context)
    : Repository<Product>(context), IProductRepository
{
    public Task<Product?> GetByIdReadOnlyAsync(
        Guid id,
        CancellationToken cancellationToken = default) =>
        Entities
            .AsNoTracking()
            .FirstOrDefaultAsync(product => product.Id == id, cancellationToken);

    public Task<bool> ExistsBySkuAsync(
        string sku,
        Guid? excludingProductId = null,
        CancellationToken cancellationToken = default)
    {
        var normalizedSku = sku.Trim().ToUpperInvariant();
        var query = Entities.Where(product => product.Sku == normalizedSku);

        if (excludingProductId.HasValue)
        {
            query = query.Where(product => product.Id != excludingProductId.Value);
        }

        return query.AnyAsync(cancellationToken);
    }

    public async Task<PagedResult<Product>> GetPagedAsync(
        string? search,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = Entities.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim();
            query = query.Where(product =>
                product.Name.Contains(normalizedSearch) ||
                product.Sku.Contains(normalizedSearch));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var products = await query
            .OrderBy(product => product.Name)
            .ThenBy(product => product.Sku)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Product>(
            products,
            pageNumber,
            pageSize,
            totalCount);
    }
}
