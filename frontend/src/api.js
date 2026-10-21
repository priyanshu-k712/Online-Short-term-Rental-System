const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export async function apiRequest(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const token = localStorage.getItem('rental_token')
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    })
  } catch {
    throw new Error('Could not connect to the backend. Check that FastAPI is running.')
  }

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    let message = data?.detail || `Request failed with status ${response.status}.`
    if (Array.isArray(message)) {
      message = message.map((item) => item.msg || 'Invalid input').join(' ')
    }
    throw new Error(message)
  }

  return data
}
