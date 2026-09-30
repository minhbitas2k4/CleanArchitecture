using FluentValidation;

namespace SalesManagement.Application.Features.Products.Queries.GetProductById;

public sealed class GetProductByIdQueryValidator : AbstractValidator<GetProductByIdQuery>
{
    public GetProductByIdQueryValidator()
    {
        RuleFor(query => query.Id).NotEmpty().WithMessage("Id sản phẩm là bắt buộc.");
    }
}
