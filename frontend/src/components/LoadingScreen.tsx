import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

import { useT } from '../hooks/useT'

// Total duration of the fake loading bar in milliseconds
const PROGRESS_DURATION = 3200

/**
 * Displays an animated progress bar that runs for PROGRESS_DURATION ms.
 * The start button is disabled until the bar completes, giving the experience
 * a deliberate pacing before the door scene begins.
 */
export function LoadingScreen({ onStart }: { onStart: () => void }) {
  const { t } = useT()
  const prefersReducedMotion = useReducedMotion()
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const start = performance.now()
    let frame: number

    // rAF-driven progress so the bar stays in sync with actual elapsed time
    const step = (now: number) => {
      const elapsed = now - start
      const pct = Math.min(100, (elapsed / PROGRESS_DURATION) * 100)
      setProgress(pct)
      if (pct >= 100) {
        setDone(true)
        return
      }
      frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [])

  // Under reduced motion: skip Framer variants and drive width via inline style
  const barVariants = prefersReducedMotion
    ? undefined
    : {
        initial: { width: '0%' },
        animate: { width: `${progress}%` },
      }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-xl space-y-4"
      >
        <h1 className="text-2xl font-bold tracking-wide text-charcoal drop-shadow-sm">
          {t('loading.title')}
        </h1>
        <p className="text-sm text-charcoal/70">{t('loading.description')}</p>
      </motion.div>

      <div className="w-full max-w-md space-y-4">
        <div
          role="progressbar"
          aria-label={t('loading.progressLabel')}
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="relative h-4 overflow-hidden rounded-full border border-[#d8c39a] bg-creamPanel/70"
        >
          <motion.div
            className="h-full bg-highlight"
            style={prefersReducedMotion ? { width: `${progress}%` } : undefined}
            variants={barVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <span className="block text-xs font-mono text-charcoal/60">
          {Math.round(progress)}%
        </span>
      </div>

      <motion.button
        type="button"
        onClick={onStart}
        disabled={!done}
        aria-disabled={!done}
        className="rounded-pixel bg-highlight px-6 py-3 font-sans text-sm font-bold tracking-wide text-charcoal shadow-pixel transition-all duration-200 enabled:hover:-translate-y-1 enabled:hover:bg-highlight/90 enabled:hover:shadow-[0_0_18px_rgba(207,154,74,0.45)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
        animate={
          done
            ? prefersReducedMotion
              ? undefined
              : { opacity: 1, scale: 1 }
            : { opacity: 0.6 }
        }
        whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
      >
        {t('common.start')}
      </motion.button>
    </div>
  )
}
