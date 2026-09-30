using FluentValidation;

namespace SalesManagement.Application.Features.Products.Commands.UpdateProduct;

public sealed class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
{
    public UpdateProductCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty().WithMessage("Id sản phẩm là bắt buộc.");
        RuleFor(command => command.Name)
            .NotEmpty().WithMessage("Tên sản phẩm là bắt buộc.")
            .MaximumLength(200).WithMessage("Tên sản phẩm tối đa 200 ký tự.");
        RuleFor(command => command.Sku)
            .NotEmpty().WithMessage("Mã SKU là bắt buộc.")
            .MaximumLength(50).WithMessage("Mã SKU tối đa 50 ký tự.");
        RuleFor(command => command.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Giá sản phẩm phải lớn hơn hoặc bằng 0.");
        RuleFor(command => command.StockQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("Số lượng tồn kho phải lớn hơn hoặc bằng 0.");
        RuleFor(command => command.Description)
            .MaximumLength(1000).WithMessage("Mô tả tối đa 1000 ký tự.");
    }
}
