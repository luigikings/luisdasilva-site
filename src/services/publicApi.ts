import { request } from './http'
import type { Question, Suggestion } from '../types/api'

export type SuggestionPayload = {
  text: string
  category?: string | null
}

export async function submitSuggestion(payload: SuggestionPayload) {
  return request<Suggestion>('/suggestions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export type QuestionTrackPayload = {
  key: string
  text: string
  category: string
}

export async function trackQuestionClick(payload: QuestionTrackPayload) {
  return request<Question>('/questions/track', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export type AnalyticsEventType = 'cv_download' | 'github_visit'

export async function trackAnalyticsEvent(type: AnalyticsEventType) {
  return request<{ type: AnalyticsEventType; total: number }>('/analytics/events', {
    method: 'POST',
    body: JSON.stringify({ type }),
  })
}
