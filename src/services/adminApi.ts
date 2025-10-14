import { request } from './http'
import type { MetricsSummary, Question } from '../types/api'

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
