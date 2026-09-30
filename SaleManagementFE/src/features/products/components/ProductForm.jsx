import { useState } from 'react'

function getInitialForm(product) {
  return {
    name: product?.name || '',
    sku: product?.sku || '',
    price: product?.price === undefined ? '' : String(product.price),
    stockQuantity:
      product?.stockQuantity === undefined ? '' : String(product.stockQuantity),
    description: product?.description || '',
    isActive: product?.isActive ?? true,
  }
}

function validate(form) {
  const errors = {}
  const price = Number(form.price)
  const stockQuantity = Number(form.stockQuantity)

  if (!form.name.trim()) errors.name = 'Tên sản phẩm là bắt buộc.'
  if (form.name.length > 200) errors.name = 'Tên sản phẩm tối đa 200 ký tự.'
  if (!form.sku.trim()) errors.sku = 'Mã SKU là bắt buộc.'
  if (form.sku.length > 50) errors.sku = 'Mã SKU tối đa 50 ký tự.'
  if (form.price === '' || Number.isNaN(price) || price < 0) {
    errors.price = 'Giá phải lớn hơn hoặc bằng 0.'
  }
  if (
    form.stockQuantity === '' ||
    Number.isNaN(stockQuantity) ||
    stockQuantity < 0 ||
    !Number.isInteger(stockQuantity)
  ) {
    errors.stockQuantity = 'Số lượng tồn kho phải là số nguyên không âm.'
  }
  if (form.description.length > 1000) {
    errors.description = 'Mô tả tối đa 1000 ký tự.'
  }

  return errors
}

function ProductForm({ product, mode, submitting, serverErrors, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => getInitialForm(product))
  const [errors, setErrors] = useState({})

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    onSubmit({
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      stockQuantity: Number(form.stockQuantity),
      description: form.description.trim() || null,
      isActive: form.isActive,
    })
  }

  const allErrors = { ...serverErrors, ...errors }

  return (
    <form className="product-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="form-field form-field-full">
          <label className="form-label" htmlFor="product-name">
            Tên sản phẩm <span className="required">*</span>
          </label>
          <input
            id="product-name"
            className={`form-control ${allErrors.name ? 'has-error' : ''}`}
            value={form.name}
            maxLength={200}
            onChange={(event) => updateField('name', event.target.value)}
            autoFocus
          />
          {allErrors.name && <p className="field-error">{allErrors.name}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="product-sku">
            SKU <span className="required">*</span>
          </label>
          <input
            id="product-sku"
            className={`form-control ${allErrors.sku ? 'has-error' : ''}`}
            value={form.sku}
            maxLength={50}
            onChange={(event) => updateField('sku', event.target.value)}
          />
          {allErrors.sku && <p className="field-error">{allErrors.sku}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="product-price">
            Giá bán <span className="required">*</span>
          </label>
          <input
            id="product-price"
            className={`form-control ${allErrors.price ? 'has-error' : ''}`}
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) => updateField('price', event.target.value)}
          />
          {allErrors.price && <p className="field-error">{allErrors.price}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="product-stock">
            Số lượng tồn kho <span className="required">*</span>
          </label>
          <input
            id="product-stock"
            className={`form-control ${allErrors.stockQuantity ? 'has-error' : ''}`}
            type="number"
            min="0"
            step="1"
            value={form.stockQuantity}
            onChange={(event) => updateField('stockQuantity', event.target.value)}
          />
          {allErrors.stockQuantity && (
            <p className="field-error">{allErrors.stockQuantity}</p>
          )}
        </div>

        <div className="form-field form-field-full">
          <label className="form-label" htmlFor="product-description">
            Mô tả
          </label>
          <textarea
            id="product-description"
            className={`form-control textarea ${allErrors.description ? 'has-error' : ''}`}
            value={form.description}
            maxLength={1000}
            onChange={(event) => updateField('description', event.target.value)}
          />
          {allErrors.description && (
            <p className="field-error">{allErrors.description}</p>
          )}
        </div>

        <label className="checkbox-field form-field-full" htmlFor="product-active">
          <input
            id="product-active"
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => updateField('isActive', event.target.checked)}
          />
          Sản phẩm đang được kinh doanh
        </label>
      </div>

      <div className="form-actions">
        <button className="button button-secondary" type="button" onClick={onCancel}>
          Hủy
        </button>
        <button className="button button-primary" type="submit" disabled={submitting}>
          {submitting ? 'Đang lưu...' : mode === 'create' ? 'Tạo sản phẩm' : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  )
}

export default ProductForm
