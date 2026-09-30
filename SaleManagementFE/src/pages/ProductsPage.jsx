import { useCallback, useEffect, useState } from 'react'
import Alert from '../components/feedback/Alert'
import Pagination from '../components/navigation/Pagination'
import ProductFilters from '../features/products/components/ProductFilters'
import ProductForm from '../features/products/components/ProductForm'
import ProductTable from '../features/products/components/ProductTable'
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../features/products/productApi'

const initialResult = {
  items: [],
  pageNumber: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
}

function getErrorMessage(error) {
  if (!error) return ''
  if (error.status === 0) return 'Không thể kết nối tới API. Hãy kiểm tra API đang chạy.'
  return error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.'
}

function getValidationErrors(error) {
  const errors = error?.data?.errors
  if (!errors || typeof errors !== 'object') return {}

  return Object.fromEntries(
    Object.entries(errors).map(([key, messages]) => [
      key.charAt(0).toLowerCase() + key.slice(1),
      Array.isArray(messages) ? messages[0] : messages,
    ]),
  )
}

function ProductsPage() {
  const [filters, setFilters] = useState({ search: '', pageNumber: 1, pageSize: 10 })
  const [result, setResult] = useState(initialResult)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState('')
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    getProducts(filters)
      .then((data) => {
        if (!cancelled) {
          setResult(data)
          setError(null)
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [filters])

  const refreshProducts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getProducts(filters)
      setResult(data)
    } catch (requestError) {
      setError(requestError)
    } finally {
      setLoading(false)
    }
  }, [filters])

  function handleSearch(search) {
    setLoading(true)
    setFilters((current) => ({ ...current, search, pageNumber: 1 }))
  }

  function handlePageSizeChange(pageSize) {
    setLoading(true)
    setFilters((current) => ({ ...current, pageSize, pageNumber: 1 }))
  }

  function handlePageChange(pageNumber) {
    setLoading(true)
    setFilters((current) => ({ ...current, pageNumber }))
  }

  function openCreateModal() {
    setError(null)
    setModal({ mode: 'create', product: null })
  }

  function openEditModal(product) {
    setError(null)
    setModal({ mode: 'edit', product })
  }

  async function handleSave(product) {
    setSaving(true)
    setError(null)

    try {
      if (modal.mode === 'create') {
        await createProduct(product)
        setNotice('Đã tạo sản phẩm thành công.')
      } else {
        await updateProduct(modal.product.id, product)
        setNotice('Đã cập nhật sản phẩm thành công.')
      }

      setModal(null)
      await refreshProducts()
    } catch (requestError) {
      setError(requestError)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}" không?`)
    if (!confirmed) return

    setError(null)

    try {
      await deleteProduct(product.id)
      setNotice('Đã xóa sản phẩm thành công.')

      if (result.items.length === 1 && filters.pageNumber > 1) {
        setLoading(true)
        setFilters((current) => ({ ...current, pageNumber: current.pageNumber - 1 }))
      } else {
        await refreshProducts()
      }
    } catch (requestError) {
      setError(requestError)
    }
  }

  const modalErrors = error?.status === 400 ? getValidationErrors(error) : {}

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Sales catalog</p>
          <h1>Quản lý sản phẩm</h1>
          <p>
            Quản lý danh mục sản phẩm, giá bán, tồn kho và trạng thái kinh doanh trên hệ thống.
          </p>
        </div>
      </div>

      {error && !modal && (
        <Alert onClose={() => setError(null)}>{getErrorMessage(error)}</Alert>
      )}
      {notice && (
        <Alert type="success" onClose={() => setNotice('')}>
          {notice}
        </Alert>
      )}

      <div className="summary-grid">
        <div className="summary-card">
          <span className="summary-label">Tổng sản phẩm</span>
          <strong className="summary-value">{result.totalCount}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label">Đang hiển thị</span>
          <strong className="summary-value">{result.items.length}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label">Trang hiện tại</span>
          <strong className="summary-value">
            {result.totalPages ? `${result.pageNumber}/${result.totalPages}` : '0'}
          </strong>
        </div>
      </div>

      <section className="products-card" aria-label="Danh sách sản phẩm">
        <ProductFilters
          initialSearch={filters.search}
          onSearch={handleSearch}
          onCreate={openCreateModal}
        />
        <ProductTable
          products={result.items}
          loading={loading}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
        <Pagination
          pageNumber={result.pageNumber}
          pageSize={result.pageSize}
          totalCount={result.totalCount}
          totalPages={result.totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </section>

      {modal && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-header">
              <div>
                <h2 id="modal-title">
                  {modal.mode === 'create' ? 'Thêm sản phẩm' : 'Chỉnh sửa sản phẩm'}
                </h2>
                <p>
                  {modal.mode === 'create'
                    ? 'Nhập thông tin cho sản phẩm mới.'
                    : 'Cập nhật thông tin sản phẩm đang chọn.'}
                </p>
              </div>
              <button
                className="modal-close"
                type="button"
                onClick={() => setModal(null)}
                aria-label="Đóng biểu mẫu"
              >
                ×
              </button>
            </div>

            {error && <Alert>{getErrorMessage(error)}</Alert>}
            <ProductForm
              key={`${modal.mode}-${modal.product?.id || 'new'}`}
              product={modal.product}
              mode={modal.mode}
              submitting={saving}
              serverErrors={modalErrors}
              onSubmit={handleSave}
              onCancel={() => setModal(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsPage
