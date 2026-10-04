import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Global visual-effects layer.
 *
 * A single full-screen <canvas> runs a small particle engine (pixel bursts,
 * confetti, coin rain, coins flying along a curve). Floating "+1"-style labels
 * are rendered as DOM nodes so they can use the pixel font. Everything is
 * driven imperatively through the `useFx()` hook so any component can fire an
 * effect at a screen coordinate without re-rendering the tree.
 */

type Point = { x: number; y: number }

type Shape = 'pixel' | 'coin' | 'spark' | 'star'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
  maxLife: number
  gravity: number
  drag: number
  rotation: number
  spin: number
  shape: Shape
  /** When set, the particle travels along a quadratic curve instead of using physics */
  path?: { from: Point; ctrl: Point; to: Point; t: number; speed: number; onArrive?: () => void }
}

type BurstOptions = {
  count?: number
  colors?: string[]
  speed?: number
  gravity?: number
  size?: number
  shape?: Shape
  life?: number
}

type FloatingText = { id: number; x: number; y: number; text: string; color: string }

type FxApi = {
  burst: (point: Point, options?: BurstOptions) => void
  confetti: () => void
  coinRain: (count?: number) => void
  flyCoin: (from: Point, to: Point, onArrive?: () => void) => void
  floatText: (point: Point, text: string, color?: string) => void
  shake: () => void
  flash: (color?: string) => void
}

export const NEON_COLORS = ['#22e4ff', '#ff3ea5', '#ffd23f', '#7cff6b', '#9b5cff', '#ff8a3d']
const COIN_COLORS = ['#ffd23f', '#ffb800', '#fff1a8']

const noop = () => undefined
const FxContext = createContext<FxApi>({
  burst: noop,
  confetti: noop,
  coinRain: noop,
  flyCoin: noop,
  floatText: noop,
  shake: noop,
  flash: noop,
})

export const useFx = () => useContext(FxContext)

/** Center of a DOM element in viewport coordinates — handy for anchoring effects */
export function centerOf(element: Element | null | undefined): Point {
  if (!element) {
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  }
  const rect = element.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  const alpha = Math.max(0, Math.min(1, p.life / Math.min(p.maxLife, 30)))
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rotation)

  switch (p.shape) {
    case 'coin': {
      // Squash horizontally over time to fake a 3D spin
      const squash = Math.abs(Math.cos(p.rotation * 2))
      ctx.rotate(-p.rotation)
      ctx.scale(Math.max(0.2, squash), 1)
      ctx.fillStyle = '#c98a00'
      ctx.beginPath()
      ctx.arc(0, 0, p.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(0, -1, p.size * 0.8, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.fillRect(-p.size * 0.15, -p.size * 0.5, p.size * 0.3, p.size * 0.9)
      break
    }
    case 'spark': {
      ctx.strokeStyle = p.color
      ctx.lineWidth = 2
      ctx.shadowColor = p.color
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.moveTo(-p.size, 0)
      ctx.lineTo(p.size, 0)
      ctx.stroke()
      break
    }
    case 'star': {
      ctx.fillStyle = p.color
      ctx.shadowColor = p.color
      ctx.shadowBlur = 10
      const s = p.size
      ctx.fillRect(-s / 2, -s * 1.5, s, s * 3)
      ctx.fillRect(-s * 1.5, -s / 2, s * 3, s)
      break
    }
    default: {
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
    }
  }
  ctx.restore()
}

export function FxProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const frame = useRef<number | null>(null)
  const textId = useRef(0)
  const [texts, setTexts] = useState<FloatingText[]>([])
  const [flashColor, setFlashColor] = useState<string | null>(null)
  const reducedRef = useRef(prefersReducedMotion)
  reducedRef.current = prefersReducedMotion

  // Keep canvas resolution in sync with the viewport (and crisp on HiDPI screens)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const tick = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    const alive: Particle[] = []

    for (const p of particles.current) {
      if (p.path) {
        const path = p.path
        path.t = Math.min(1, path.t + path.speed)
        // Ease-in-out along a quadratic Bézier
        const e = path.t < 0.5 ? 2 * path.t * path.t : 1 - (-2 * path.t + 2) ** 2 / 2
        const inv = 1 - e
        p.x = inv * inv * path.from.x + 2 * inv * e * path.ctrl.x + e * e * path.to.x
        p.y = inv * inv * path.from.y + 2 * inv * e * path.ctrl.y + e * e * path.to.y
        p.rotation += p.spin
        if (path.t >= 1) {
          path.onArrive?.()
          continue
        }
      } else {
        p.vx *= p.drag
        p.vy = p.vy * p.drag + p.gravity
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.spin
        p.life -= 1
        if (p.life <= 0 || p.y > window.innerHeight + 40) continue
      }
      drawParticle(ctx, p)
      alive.push(p)
    }

    particles.current = alive
    if (alive.length > 0) {
      frame.current = requestAnimationFrame(tick)
    } else {
      frame.current = null
    }
  }, [])

  const ensureRunning = useCallback(() => {
    if (frame.current === null) {
      frame.current = requestAnimationFrame(tick)
    }
  }, [tick])

  useEffect(() => {
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    }
  }, [])

  const api = useMemo<FxApi>(() => {
    const add = (list: Particle[]) => {
      if (reducedRef.current) return
      particles.current.push(...list)
      // Hard cap so a spam-clicker can't melt a low-end phone
      if (particles.current.length > 900) {
        particles.current.splice(0, particles.current.length - 900)
      }
      ensureRunning()
    }

    const burst: FxApi['burst'] = (point, options = {}) => {
      const {
        count = 24,
        colors = NEON_COLORS,
        speed = 6,
        gravity = 0.22,
        size = 6,
        shape = 'pixel',
        life = 60,
      } = options
      const list: Particle[] = []
      for (let i = 0; i < count; i += 1) {
        const angle = rand(0, Math.PI * 2)
        const velocity = rand(speed * 0.35, speed)
        list.push({
          x: point.x,
          y: point.y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - speed * 0.25,
          size: rand(size * 0.5, size),
          color: pick(colors),
          life: rand(life * 0.6, life),
          maxLife: life,
          gravity,
          drag: 0.97,
          rotation: rand(0, Math.PI),
          spin: rand(-0.2, 0.2),
          shape,
        })
      }
      add(list)
    }

    const confetti: FxApi['confetti'] = () => {
      const width = window.innerWidth
      const list: Particle[] = []
      for (let i = 0; i < 160; i += 1) {
        list.push({
          x: rand(0, width),
          y: rand(-200, -10),
          vx: rand(-2, 2),
          vy: rand(2, 6),
          size: rand(5, 10),
          color: pick(NEON_COLORS),
          life: 260,
          maxLife: 260,
          gravity: 0.06,
          drag: 0.995,
          rotation: rand(0, Math.PI),
          spin: rand(-0.25, 0.25),
          shape: Math.random() > 0.85 ? 'star' : 'pixel',
        })
      }
      // Side cannons
      ;[
        { x: 0, dir: 1 },
        { x: width, dir: -1 },
      ].forEach(({ x, dir }) => {
        for (let i = 0; i < 50; i += 1) {
          list.push({
            x,
            y: window.innerHeight * 0.8,
            vx: dir * rand(6, 15),
            vy: rand(-16, -8),
            size: rand(5, 9),
            color: pick(NEON_COLORS),
            life: 200,
            maxLife: 200,
            gravity: 0.3,
            drag: 0.985,
            rotation: rand(0, Math.PI),
            spin: rand(-0.3, 0.3),
            shape: 'pixel',
          })
        }
      })
      add(list)
    }

    const coinRain: FxApi['coinRain'] = (count = 60) => {
      const list: Particle[] = []
      for (let i = 0; i < count; i += 1) {
        list.push({
          x: rand(0, window.innerWidth),
          y: rand(-400, -20),
          vx: rand(-0.6, 0.6),
          vy: rand(3, 7),
          size: rand(7, 12),
          color: pick(COIN_COLORS),
          life: 320,
          maxLife: 320,
          gravity: 0.12,
          drag: 0.995,
          rotation: rand(0, Math.PI),
          spin: rand(0.05, 0.15),
          shape: 'coin',
        })
      }
      add(list)
    }

    const flyCoin: FxApi['flyCoin'] = (from, to, onArrive) => {
      if (reducedRef.current) {
        onArrive?.()
        return
      }
      const ctrl = {
        x: (from.x + to.x) / 2 + rand(-120, 120),
        y: Math.min(from.y, to.y) - rand(120, 220),
      }
      add([
        {
          x: from.x,
          y: from.y,
          vx: 0,
          vy: 0,
          size: 12,
          color: '#ffd23f',
          life: 999,
          maxLife: 999,
          gravity: 0,
          drag: 1,
          rotation: 0,
          spin: 0.18,
          shape: 'coin',
          path: { from, ctrl, to, t: 0, speed: 0.022, onArrive },
        },
      ])
    }

    const floatText: FxApi['floatText'] = (point, text, color = '#ffd23f') => {
      const id = (textId.current += 1)
      setTexts((prev) => [...prev, { id, x: point.x, y: point.y, text, color }])
      window.setTimeout(() => {
        setTexts((prev) => prev.filter((item) => item.id !== id))
      }, 1100)
    }

    const shake: FxApi['shake'] = () => {
      if (reducedRef.current) return
      const root = document.getElementById('app-shell')
      if (!root) return
      root.classList.remove('fx-shake')
      // Force reflow so the animation restarts even on rapid repeats
      void root.offsetWidth
      root.classList.add('fx-shake')
      // Drop the class afterwards so the root doesn't keep a transform/stacking context
      root.addEventListener('animationend', () => root.classList.remove('fx-shake'), { once: true })
    }

    const flash: FxApi['flash'] = (color = 'rgba(255,255,255,0.6)') => {
      if (reducedRef.current) return
      setFlashColor(color)
      window.setTimeout(() => setFlashColor(null), 120)
    }

    return { burst, confetti, coinRain, flyCoin, floatText, shake, flash }
  }, [ensureRunning])

  return (
    <FxContext.Provider value={api}>
      {children}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[90]"
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[91]">
        <AnimatePresence>
          {texts.map((item) => (
            <motion.span
              key={item.id}
              className="absolute -translate-x-1/2 font-pixel text-sm"
              style={{ left: item.x, top: item.y, color: item.color, textShadow: `0 0 10px ${item.color}, 2px 2px 0 #000` }}
              initial={{ opacity: 0, y: 0, scale: 0.6 }}
              animate={{ opacity: 1, y: -60, scale: 1.2 }}
              exit={{ opacity: 0, y: -90 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {item.text}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {flashColor ? (
          <motion.div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[92]"
            style={{ background: flashColor }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
          />
        ) : null}
      </AnimatePresence>
    </FxContext.Provider>
  )
}
