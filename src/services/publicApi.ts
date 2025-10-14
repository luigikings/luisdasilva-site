import { request } from './http'
import type { Suggestion } from '../types/api'

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
