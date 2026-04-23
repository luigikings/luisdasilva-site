// Analytics helper — swap the console.log body for a real Plausible/Umami call when ready.
// Kept as a no-op in production until an API key is configured.
type Payload = Record<string, unknown> | undefined

export function track(eventName: string, payload?: Payload) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('[analytics]', eventName, payload ?? {})
  }
}