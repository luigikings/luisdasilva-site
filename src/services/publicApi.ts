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
