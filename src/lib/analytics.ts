// Placeholder analytics helper.
// Integrate Plausible by replacing the track implementation with real API calls.
type Payload = Record<string, unknown> | undefined

export function track(eventName: string, payload?: Payload) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('[analytics]', eventName, payload ?? {})
  }
}
