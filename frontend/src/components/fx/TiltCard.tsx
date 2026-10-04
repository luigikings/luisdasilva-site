import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import type { PointerEvent, ReactNode } from 'react'

type TiltCardProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  children: ReactNode
  /** Max rotation in degrees */
  max?: number
  /** Color of the moving glare highlight */
  glare?: string
}

/**
 * A button that tilts in 3D towards the pointer and shows a moving glare,
 * like a holographic trading card. Falls back to a flat button with reduced motion.
 */
export function TiltCard({ children, max = 12, glare = 'rgba(255,255,255,0.35)', className = '', style, ...rest }: TiltCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 220, damping: 18 })
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 220, damping: 18 })
  const glareX = useTransform(px, (v) => `${v * 100}%`)
  const glareY = useTransform(py, (v) => `${v * 100}%`)
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, ${glare} 0%, transparent 55%)`

  const handleMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion || event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    px.set((event.clientX - rect.left) / rect.width)
    py.set((event.clientY - rect.top) / rect.height)
  }

  const handleLeave = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <motion.button
      type="button"
      {...rest}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`group relative [transform-style:preserve-3d] ${className}`}
      style={prefersReducedMotion ? style : { ...style, rotateX, rotateY, transformPerspective: 800 }}
    >
      {children}
      {!prefersReducedMotion ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glareBg }}
        />
      ) : null}
    </motion.button>
  )
}
