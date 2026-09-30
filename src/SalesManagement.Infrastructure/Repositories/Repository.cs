using Microsoft.EntityFrameworkCore;
using SalesManagement.Application.Common.Interfaces;
using SalesManagement.Domain.Common;
using SalesManagement.Infrastructure.Persistence;

namespace SalesManagement.Infrastructure.Repositories;

public class Repository<TEntity>(ApplicationDbContext context) : IRepository<TEntity>
    where TEntity : BaseEntity
{
    protected DbSet<TEntity> Entities => context.Set<TEntity>();

    public Task<TEntity?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default) =>
        Entities.FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);

    public async Task AddAsync(
        TEntity entity,
        CancellationToken cancellationToken = default)
    {
        await Entities.AddAsync(entity, cancellationToken);
    }

    public void Remove(TEntity entity) => Entities.Remove(entity);
}
