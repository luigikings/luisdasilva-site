import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

import { useT } from '../hooks/useT'

const PROGRESS_DURATION = 3200

export function LoadingScreen({ onStart }: { onStart: () => void }) {
  const { t } = useT()
  const prefersReducedMotion = useReducedMotion()
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const start = performance.now()
    let frame: number

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
        <h1 className="text-2xl font-bold uppercase tracking-[0.4em] text-highlight drop-shadow">
          {t('loading.title')}
        </h1>
        <p className="text-sm text-slate-200/80">{t('loading.description')}</p>
      </motion.div>

      <div className="w-full max-w-md space-y-4">
        <div
          role="progressbar"
          aria-label={t('loading.progressLabel')}
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="relative h-4 overflow-hidden rounded-full border border-slate-700 bg-slate-900/70"
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
        <span className="block text-xs font-mono text-slate-300">
          {Math.round(progress)}%
        </span>
      </div>

      <motion.button
        type="button"
        onClick={onStart}
        disabled={!done}
        aria-disabled={!done}
        className="rounded-pixel bg-highlight px-6 py-3 font-pixel text-sm uppercase tracking-widest text-charcoal shadow-pixel transition-all duration-200 enabled:hover:-translate-y-1 enabled:hover:bg-highlight/90 enabled:hover:shadow-[0_0_18px_rgba(255,241,208,0.35)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
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
