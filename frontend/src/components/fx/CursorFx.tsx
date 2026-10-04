import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

import { useFx } from './FxProvider'

/**
 * Pointer candy for mouse users:
 *  - a soft neon glow that lags behind the cursor (spring-driven)
 *  - a pixel trail while moving fast
 *  - a tiny pixel burst on every click anywhere on the page
 * Disabled entirely on touch devices and with reduced motion.
 */
export function CursorFx() {
  const prefersReducedMotion = useReducedMotion()
  const { burst } = useFx()
  const [enabled, setEnabled] = useState(false)
  const x = useMotionValue(-200)
  const y = useMotionValue(-200)
  const springX = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 })
  const springY = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 })

  useEffect(() => {
    const query = window.matchMedia('(pointer: fine)')
    setEnabled(query.matches && !prefersReducedMotion)
  }, [prefersReducedMotion])

  useEffect(() => {
    if (!enabled) return

    let lastX = 0
    let lastY = 0
    let lastTrail = 0

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX)
      y.set(event.clientY)
      const now = performance.now()
      const distance = Math.hypot(event.clientX - lastX, event.clientY - lastY)
      // Only drop trail pixels on fast movement, throttled to ~30fps
      if (distance > 18 && now - lastTrail > 32) {
        burst(
          { x: event.clientX, y: event.clientY },
          { count: 2, speed: 1.2, gravity: 0.05, size: 4, life: 28 },
        )
        lastTrail = now
      }
      lastX = event.clientX
      lastY = event.clientY
    }

    const onDown = (event: PointerEvent) => {
      burst({ x: event.clientX, y: event.clientY }, { count: 10, speed: 4, size: 5, life: 34 })
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [burst, enabled, x, y])

  if (!enabled) return null

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] -ml-32 -mt-32 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(34,228,255,0.16)_0%,rgba(155,92,255,0.08)_40%,transparent_70%)] mix-blend-screen"
      style={{ x: springX, y: springY }}
    />
  )
}
