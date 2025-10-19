import type { MetricsSummary, Question, Suggestion } from '../types/api'

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

type LoginResponse = { token: string }

export async function login(email: string, password: string) {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function getMetrics() {
  return apiFetch<MetricsSummary>('/metrics')
}

export async function getAdminQuestions(token: string) {
  return apiFetch<Question[]>('/admin/questions', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function getAdminSuggestions(
  token: string,
  status?: Suggestion['status'],
) {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return apiFetch<Suggestion[]>(`/admin/suggestions${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function deleteAdminSuggestion(token: string, id: number) {
  await apiFetch<void>(`/admin/suggestions/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function getClicks(token: string) {
  return apiFetch<number>('/clicks', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

type AdminStats = {
  totalUsers: number
  totalSuggestions: number
  totalQuestions: number
}

export async function getStats(token: string) {
  return apiFetch<AdminStats>('/admin/stats', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

type SuggestionPayload = {
  text: string
  category?: string | null
}

export async function submitSuggestion(payload: SuggestionPayload) {
  return apiFetch<Suggestion>('/suggestions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

type QuestionTrackPayload = {
  key: string
  text: string
  category: string
}

export async function trackQuestionClick(payload: QuestionTrackPayload) {
  return apiFetch<Question>('/questions/track', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export type AnalyticsEventType = 'cv_download' | 'github_visit'

type AnalyticsEventResponse = {
  type: AnalyticsEventType
  total: number
}

export async function trackAnalyticsEvent(type: AnalyticsEventType) {
  return apiFetch<AnalyticsEventResponse>('/analytics/events', {
    method: 'POST',
    body: JSON.stringify({ type }),
  })
}
