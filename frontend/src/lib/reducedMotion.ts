/**
 * Pure final-state resolvers for `prefers-reduced-motion` (plan D3, RF-7/RF-8).
 *
 * Rule: while reduced motion is on, every animation resolves to its final
 * state immediately (RF-7 shows content directly; RF-8 reaches the final
 * state within 0.5 s when the setting flips mid-animation). The UI only
 * applies these values — no DOM, timers or media queries in here.
 */

/** A typing animation resolves to its final state: the complete text at once. */
export function instantText(fullText: string): string {
  return fullText
}

/** The fake loading run resolves to its final state: 100 % with every line visible. */
export const INSTANT_PROGRESS = 100
