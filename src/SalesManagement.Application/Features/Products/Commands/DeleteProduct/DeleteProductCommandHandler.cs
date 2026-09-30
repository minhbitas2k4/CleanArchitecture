using MediatR;
using SalesManagement.Application.Common.Exceptions;
using SalesManagement.Application.Common.Interfaces;

namespace SalesManagement.Application.Features.Products.Commands.DeleteProduct;

public sealed class DeleteProductCommandHandler(
    IProductRepository productRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteProductCommand>
{
    public async Task Handle(
        DeleteProductCommand request,
        CancellationToken cancellationToken)
    {
        var product = await productRepository
            .GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"Không tìm thấy sản phẩm với Id '{request.Id}'.");

        productRepository.Remove(product);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
