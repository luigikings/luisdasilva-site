import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'

import { useSound } from '../hooks/useSound'
import { useT } from '../hooks/useT'
import { centerOf, useFx } from './fx/FxProvider'

// Base duration of the fake loading run, in milliseconds
const PROGRESS_DURATION = 4200
const SEGMENTS = 20
const SEGMENT_COLORS = ['#22e4ff', '#9b5cff', '#ff3ea5', '#ff8a3d', '#ffd23f', '#7cff6b']

/**
 * Arcade boot sequence.
 *
 * - A fake terminal prints boot lines as the progress crosses thresholds
 * - A segmented bar fills up while the character runs on top of it
 * - Clicking anywhere boosts the progress (+ particles and a blip)
 * - When finished, the START button unlocks (Enter / Space work too)
 */
export function LoadingScreen({ onStart }: { onStart: () => void }) {
  const { t } = useT()
  const { sfx } = useSound()
  const fx = useFx()
  const prefersReducedMotion = useReducedMotion()
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [tipIndex, setTipIndex] = useState(0)
  const progressRef = useRef(0)
  const startRef = useRef<HTMLButtonElement>(null)

  const bootLines = t<string[]>('loading.bootLines')
  const tips = t<string[]>('loading.tips')

  useEffect(() => {
    let frame: number
    let last = performance.now()

    // rAF-driven progress so the bar stays in sync with actual elapsed time.
    // A little wobble makes it feel like real work is happening.
    const step = (now: number) => {
      const delta = now - last
      last = now
      const wobble = 0.6 + Math.sin(now / 180) * 0.5 + Math.random() * 0.4
      progressRef.current = Math.min(100, progressRef.current + (delta / PROGRESS_DURATION) * 100 * wobble)
      setProgress(progressRef.current)
      if (progressRef.current >= 100) {
        setDone(true)
        return
      }
      frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!done) return
    sfx.powerUp()
    fx.burst(centerOf(startRef.current), { count: 40, speed: 8 })
    startRef.current?.focus({ preventScroll: true })
  }, [done, fx, sfx])

  useEffect(() => {
    const id = window.setInterval(() => setTipIndex((prev) => (prev + 1) % tips.length), 2200)
    return () => window.clearInterval(id)
  }, [tips.length])

  const handleStart = useCallback(() => {
    if (!done) return
    sfx.start()
    fx.flash('rgba(255,62,165,0.35)')
    onStart()
  }, [done, fx, onStart, sfx])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.key === 'Enter' || event.key === ' ') && document.activeElement !== startRef.current) {
        event.preventDefault()
        handleStart()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleStart])

  // Every click while loading gives the bar a kick
  const handleBoost = (event: MouseEvent<HTMLDivElement>) => {
    if (done) return
    progressRef.current = Math.min(100, progressRef.current + 6)
    sfx.blip(1 + progressRef.current / 60)
    fx.floatText({ x: event.clientX, y: event.clientY - 10 }, '+6%', '#7cff6b')
  }

  const visibleLines = bootLines.filter((_, index) => progress >= (index / bootLines.length) * 100)
  const litSegments = Math.floor((progress / 100) * SEGMENTS)

  return (
    <div
      className="relative z-10 flex min-h-screen cursor-pointer select-none flex-col items-center justify-center gap-8 px-4 py-16"
      onClick={handleBoost}
    >
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-2"
      >
        <p className="font-pixel text-[10px] uppercase tracking-[0.3em] text-neonCyan text-neon">
          {done ? t('loading.ready') : t('loading.title')}
          {!done ? <span className="animate-blink motion-reduce:animate-none">_</span> : null}
        </p>
        <motion.p
          className="text-gradient font-pixel text-5xl tabular-nums sm:text-7xl"
          animate={done && !prefersReducedMotion ? { scale: [1, 1.15, 1] } : undefined}
          transition={{ duration: 0.4 }}
        >
          {Math.floor(progress)}%
        </motion.p>
      </motion.div>

      {/* Terminal */}
      <div className="panel-neon w-full max-w-lg overflow-hidden text-left">
        <div className="flex items-center gap-2 border-b-2 border-line bg-abyss/60 px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-danger" />
          <span className="h-3 w-3 rounded-full bg-coin" />
          <span className="h-3 w-3 rounded-full bg-neonLime" />
          <span className="ml-2 font-mono text-base text-muted">lk@arcade:~</span>
        </div>
        <div className="min-h-[13.5rem] space-y-0.5 px-4 py-3 font-mono text-lg leading-tight text-neonLime sm:min-h-[15rem] sm:text-xl">
          <AnimatePresence initial={false}>
            {visibleLines.map((line) => (
              <motion.p
                key={line}
                initial={prefersReducedMotion ? undefined : { opacity: 0, x: -10 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                className="whitespace-pre-wrap"
              >
                <span className="text-neonPink">&gt;</span> {line}
              </motion.p>
            ))}
          </AnimatePresence>
          {!done ? <span className="inline-block h-4 w-2.5 animate-blink bg-neonLime motion-reduce:animate-none" /> : null}
        </div>
      </div>

      {/* Segmented bar with the running character */}
      <div className="w-full max-w-lg">
        <div className="relative h-20">
          <div
            className="absolute bottom-0 -translate-x-1/2"
            style={{ left: `${Math.max(4, Math.min(96, progress))}%` }}
          >
            <motion.img
              src="/imgs/main_caracter/LK_defrente.png"
              alt=""
              aria-hidden
              className="pixelated h-20 w-20 drop-shadow-[0_0_10px_rgba(34,228,255,0.6)]"
              animate={prefersReducedMotion || done ? undefined : { y: [0, -8, 0], rotate: [-4, 4, -4] }}
              transition={{ duration: 0.35, repeat: Infinity }}
            />
          </div>
        </div>
        <div
          role="progressbar"
          aria-label={t('loading.progressLabel')}
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="flex gap-1 rounded-xl border-2 border-line bg-abyss/80 p-1.5"
        >
          {Array.from({ length: SEGMENTS }, (_, index) => {
            const lit = index < litSegments
            const color = SEGMENT_COLORS[Math.floor((index / SEGMENTS) * SEGMENT_COLORS.length)]
            return (
              <motion.span
                key={index}
                className="h-5 flex-1 rounded-[3px]"
                style={{
                  background: lit ? color : 'rgba(58,42,120,0.45)',
                  boxShadow: lit ? `0 0 10px ${color}` : 'none',
                }}
                animate={lit && !prefersReducedMotion ? { scaleY: [0.4, 1.25, 1] } : undefined}
                transition={{ duration: 0.25 }}
              />
            )
          })}
        </div>
      </div>

      <div className="h-6 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={done ? 'boost-done' : tipIndex}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 6 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
            className="font-mono text-xl text-muted [text-shadow:0_2px_6px_#000]"
          >
            {done ? tips[0] : tipIndex % 2 === 0 ? t('loading.boostHint') : tips[tipIndex % tips.length]}
          </motion.p>
        </AnimatePresence>
      </div>

      <motion.button
        ref={startRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          handleStart()
        }}
        disabled={!done}
        aria-disabled={!done}
        className="btn-arcade bg-neonPink px-10 py-4 text-xs text-ink"
        animate={
          done && !prefersReducedMotion
            ? { scale: [1, 1.07, 1], boxShadow: ['0 6px 0 0 rgba(0,0,0,0.55)', '0 6px 0 0 rgba(0,0,0,0.55), 0 0 34px rgba(255,62,165,0.9)', '0 6px 0 0 rgba(0,0,0,0.55)'] }
            : undefined
        }
        transition={{ duration: 1.1, repeat: Infinity }}
      >
        ▶ {t<string>('common.start')}
      </motion.button>
    </div>
  )
}
