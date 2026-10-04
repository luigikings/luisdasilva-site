import { useEffect, useRef } from 'react'

const SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

/** Fires `onUnlock` when the visitor types the Konami code (↑↑↓↓←→←→BA) */
export function useKonami(onUnlock: () => void) {
  const callback = useRef(onUnlock)
  callback.current = onUnlock

  useEffect(() => {
    let position = 0
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      if (key === SEQUENCE[position]) {
        position += 1
        if (position === SEQUENCE.length) {
          position = 0
          callback.current()
        }
      } else {
        position = key === SEQUENCE[0] ? 1 : 0
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
