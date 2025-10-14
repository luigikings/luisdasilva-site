import { request } from './http'
import type { MetricsSummary, Question, Suggestion } from '../types/api'

export type LoginPayload = {
  email: string
  password: string
}

export async function login(payload: LoginPayload) {
  return request<{ token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getAdminQuestions(token: string) {
  return request<Question[]>('/admin/questions', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function getMetrics() {
  return request<MetricsSummary>('/metrics')
}

export async function getAdminSuggestions(
  token: string,
  status?: Suggestion['status'],
) {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return request<Suggestion[]>(`/admin/suggestions${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function deleteAdminSuggestion(token: string, id: number) {
  return request<void>(`/admin/suggestions/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
