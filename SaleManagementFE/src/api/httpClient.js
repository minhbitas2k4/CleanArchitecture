const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

export async function request(path, options = {}) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch (error) {
    throw new ApiError('Không thể kết nối tới API. Hãy kiểm tra API đang chạy.', 0, error)
  }

  const data = await parseResponse(response)

  if (!response.ok) {
    const message =
      data?.detail || data?.title || data?.message || 'Không thể thực hiện yêu cầu.'

    throw new ApiError(message, response.status, data)
  }

  return data
}
