export class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

const rawApiUrl = import.meta.env.VITE_API_URL

if (!rawApiUrl) {
  throw new Error(
    'VITE_API_URL environment variable is required to make API requests.',
  )
}

const API_BASE_URL = `${rawApiUrl.replace(/\/+$/, '')}/api`

function buildUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`
  }
  return `${API_BASE_URL}/${path}`
}

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) {
    return {}
  }
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries())
  }
  if (Array.isArray(headers)) {
    return headers.reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {})
  }
  return { ...headers }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const { headers, ...rest } = init
  const normalizedHeaders = normalizeHeaders(headers)
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...normalizedHeaders,
  }

  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: requestHeaders,
  })

  const contentType = response.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')
  const hasBody = ![204, 205].includes(response.status)
  const payload = hasBody
    ? isJson
      ? await response.json()
      : await response.text()
    : null

  if (!response.ok) {
    const message =
      isJson && payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error?: string }).error)
        : response.statusText
    throw new ApiError(message || 'Request failed', response.status, payload)
  }

  if (!hasBody) {
    return undefined as T
  }

  if (isJson && payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: unknown }).data as T
  }

  return payload as T
}

type SuggestionPayload = {
  text: string
  category?: string | null
  lang?: string
}

export async function submitSuggestion(payload: SuggestionPayload) {
  return apiFetch<{ ok: boolean }>('/suggestions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
