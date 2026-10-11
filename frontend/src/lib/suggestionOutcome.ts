/**
 * Pure suggestion-outcome resolution (plan 005, RF-1/RF-2/RF-3/RF-5).
 *
 * Decides which branch the suggestion form shows (`success` / `degraded` /
 * `error`) from the `{emailSent, error}` contract and the shape of the HTTP
 * response. `emailSent` alone decides between success and degraded: any
 * accompanying `error` detail is accepted but never used for the decision
 * and never returned to the view (RF-3, RF-4).
 *
 * Pure: no DOM, network or date in here — the response descriptors are
 * injected as parameters. The UI only renders according to the outcome.
 */
export type SuggestionOutcome = 'success' | 'degraded' | 'error'

export type SuggestionResponseShape = {
  /** The `emailSent` flag from the contract; non-boolean means unusable. */
  emailSent: boolean | undefined
  /** False for 204/205 or otherwise bodiless responses. */
  hasBody: boolean
  /** False when the body is not JSON and therefore not interpretable. */
  isJson: boolean
  /**
   * The technical `error` detail from the contract. Intentionally ignored:
   * it never decides the branch and never reaches the view.
   */
  error?: string | null
}

/**
 * Resolves the visible outcome for a 2xx suggestion response.
 * Non-2xx responses never reach here: `apiFetch` throws `ApiError` for them
 * and the caller maps thrown errors to `'error'`.
 */
export function resolveSuggestionOutcome(
  input: SuggestionResponseShape,
): SuggestionOutcome {
  if (!input.hasBody || !input.isJson || typeof input.emailSent !== 'boolean') {
    return 'error'
  }
  if (input.emailSent === true) {
    return 'success'
  }
  return 'degraded'
}
