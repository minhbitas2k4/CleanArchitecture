import { request } from '../../api/httpClient'

export function getProducts({ search = '', pageNumber = 1, pageSize = 10 }) {
  const params = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  })

  if (search.trim()) {
    params.set('search', search.trim())
  }

  return request(`/products?${params.toString()}`)
}

export function createProduct(product) {
  return request('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  })
}

export function updateProduct(id, product) {
  return request(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  })
}

export function deleteProduct(id) {
  return request(`/products/${id}`, {
    method: 'DELETE',
  })
}
