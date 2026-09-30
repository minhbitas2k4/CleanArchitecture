import EmptyState from '../../../components/feedback/EmptyState'
import LoadingState from '../../../components/feedback/LoadingState'

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
})

function ProductTable({ products, loading, onEdit, onDelete }) {
  return (
    <div className="table-wrapper">
      {loading ? (
        <LoadingState />
      ) : products.length === 0 ? (
        <EmptyState message="Không tìm thấy sản phẩm phù hợp." />
      ) : (
        <table className="products-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>SKU</th>
              <th>Giá bán</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th aria-label="Thao tác" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="product-name">{product.name}</div>
                  {product.description && (
                    <div className="product-description" title={product.description}>
                      {product.description}
                    </div>
                  )}
                </td>
                <td>
                  <span className="sku">{product.sku}</span>
                </td>
                <td>
                  <span className="price">{currencyFormatter.format(product.price)}</span>
                </td>
                <td>
                  <span className="stock">{product.stockQuantity}</span>
                </td>
                <td>
                  <span className={`badge ${product.isActive ? 'badge-active' : 'badge-inactive'}`}>
                    {product.isActive ? 'Đang bán' : 'Ngừng bán'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button
                      className="button button-secondary button-small"
                      type="button"
                      onClick={() => onEdit(product)}
                    >
                      Sửa
                    </button>
                    <button
                      className="button button-danger button-small"
                      type="button"
                      onClick={() => onDelete(product)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default ProductTable
