import type { QuestionKey } from '../i18n/dict'

/**
 * Pure coin-exemption rule (plan D1, RF-13).
 *
 * The 4 essential questions (CV, projects, GitHub, contact) are always
 * free and never blocked by the coin budget, so a recruiter reaches them
 * in <= 2 interactions without enabling infinite mode. Costs in
 * `data/interview.ts` stay untouched — the exemption lives only here, so
 * saved budgets and the coin system keep working as before.
 *
 * Pure: no DOM, timers or sound in here. The UI only applies the decision.
 */
export const ESSENTIAL_QUESTION_KEYS: readonly QuestionKey[] = ['cv', 'projects', 'github', 'contact']

/** True for the closed list of always-accessible questions (RF-13). */
export function isEssentialQuestion(key: QuestionKey): boolean {
  return ESSENTIAL_QUESTION_KEYS.includes(key)
}

export type AskInput = {
  key: QuestionKey
  cost: number
  coinsInGroup: number
  answered: boolean
  infinite: boolean
}

export type AskDecision = {
  /** True when the question cannot be asked right now (out of coins). */
  blocked: boolean
  /** True when asking deducts coins from the group pool. */
  charge: boolean
}

/**
 * Decides whether a question can be asked and whether it costs coins.
 * Essentials, repeats, free questions and infinite mode never charge and
 * never block; anything else is blocked only when the group pool is short.
 * The infinite-mode hint stays contextual help for blocked questions only.
 */
export function resolveAsk(input: AskInput): AskDecision {
  if (input.infinite || input.answered || input.cost <= 0 || isEssentialQuestion(input.key)) {
    return { blocked: false, charge: false }
  }
  if (input.coinsInGroup < input.cost) {
    return { blocked: true, charge: false }
  }
  return { blocked: false, charge: true }
}
