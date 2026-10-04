import { useCallback, useSyncExternalStore } from 'react'

import { isMuted, setMuted, sfx, subscribeMuted } from '../lib/sound'

/** React binding for the global sound engine: exposes sfx + a synced mute toggle */
export function useSound() {
  const muted = useSyncExternalStore(subscribeMuted, isMuted, () => false)
  const toggleMuted = useCallback(() => setMuted(!isMuted()), [])
  return { sfx, muted, toggleMuted }
}
