export class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

function buildUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`
  }
  return `${API_BASE_URL}/${path}`
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { headers, ...rest } = init
  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(headers ?? {}),
    },
  })

  const contentType = response.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message = isJson && payload?.error ? payload.error : response.statusText
    throw new ApiError(message || 'Request failed', response.status, payload)
  }

  if (isJson && typeof payload === 'object' && payload !== null && 'data' in payload) {
    return payload.data as T
  }

  return payload as T
}
