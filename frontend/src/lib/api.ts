/** Typed error carrying the HTTP status and raw response body for callers to inspect */
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

// Validate at module load time so a missing env var surfaces immediately, not on first request
if (!rawApiUrl) {
  throw new Error(
    'VITE_API_URL environment variable is required to make API requests.',
  )
}

// Strip trailing slashes and append /api so callers only pass path segments
const API_BASE_URL = `${rawApiUrl.replace(/\/+$/, '')}/api`

/** Builds an absolute URL from a path segment, passing through full URLs unchanged */
function buildUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`
  }
  return `${API_BASE_URL}/${path}`
}

/** Normalises the three valid HeadersInit shapes into a plain object */
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

/**
 * Generic fetch wrapper that:
 * - Defaults Content-Type to application/json
 * - Skips body parsing for 204/205 responses
 * - Unwraps a top-level `data` envelope when present
 * - Throws ApiError on non-2xx responses so callers get typed error info
 */
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

  // Unwrap `{ data: ... }` envelope used by some backend responses
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

type DoorEntryPayload = {
  lang?: string
}

export async function submitSuggestion(payload: SuggestionPayload) {
  return apiFetch<{ ok: boolean }>('/suggestions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function notifyDoorEntry(payload: DoorEntryPayload) {
  return apiFetch<{ ok: boolean }>('/door-entry', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}