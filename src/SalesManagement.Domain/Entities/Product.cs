using SalesManagement.Domain.Common;
using SalesManagement.Domain.Exceptions;

namespace SalesManagement.Domain.Entities;

public sealed class Product : BaseEntity
{
    private Product()
    {
    }

    private Product(
        string name,
        string sku,
        decimal price,
        int stockQuantity,
        string? description,
        bool isActive)
    {
        Name = name;
        Sku = sku;
        Price = price;
        StockQuantity = stockQuantity;
        Description = description;
        IsActive = isActive;
    }

    public string Name { get; private set; } = string.Empty;
    public string Sku { get; private set; } = string.Empty;
    public decimal Price { get; private set; }
    public int StockQuantity { get; private set; }
    public string? Description { get; private set; }
    public bool IsActive { get; private set; }

    public static Product Create(
        string name,
        string sku,
        decimal price,
        int stockQuantity,
        string? description,
        bool isActive = true)
    {
        Validate(name, sku, price, stockQuantity);

        return new Product(
            name.Trim(),
            sku.Trim().ToUpperInvariant(),
            price,
            stockQuantity,
            NormalizeDescription(description),
            isActive);
    }

    public void Update(
        string name,
        string sku,
        decimal price,
        int stockQuantity,
        string? description,
        bool isActive)
    {
        Validate(name, sku, price, stockQuantity);

        Name = name.Trim();
        Sku = sku.Trim().ToUpperInvariant();
        Price = price;
        StockQuantity = stockQuantity;
        Description = NormalizeDescription(description);
        IsActive = isActive;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    private static void Validate(string name, string sku, decimal price, int stockQuantity)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new DomainException("Tên sản phẩm không được để trống.");
        }

        if (string.IsNullOrWhiteSpace(sku))
        {
            throw new DomainException("Mã SKU không được để trống.");
        }

        if (price < 0)
        {
            throw new DomainException("Giá sản phẩm không được âm.");
        }

        if (stockQuantity < 0)
        {
            throw new DomainException("Số lượng tồn kho không được âm.");
        }
    }

    private static string? NormalizeDescription(string? description) =>
        string.IsNullOrWhiteSpace(description) ? null : description.Trim();
}
