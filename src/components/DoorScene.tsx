import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

import { doorDialogs } from '../data/dialogs'
import { useT } from '../hooks/useT'

type DoorSceneProps = {
  onEnter: () => void
}

export function DoorScene({ onEnter }: DoorSceneProps) {
  const { t, lang } = useT()
  const prefersReducedMotion = useReducedMotion()
  const [index, setIndex] = useState(0)

  const dialogs = useMemo(
    () => doorDialogs.map((item) => (lang === 'es' ? item.es : item.en)),
    [lang],
  )

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % dialogs.length)
    }, 2500)
    return () => window.clearInterval(interval)
  }, [dialogs])

  useEffect(() => {
    setIndex(0)
  }, [lang])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-12 text-center">
      <motion.div
        className="space-y-6"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div
          role="img"
          aria-label={t('door.intro')}
          className="mx-auto h-48 w-40 rounded-pixel border-4 border-slate-700 bg-slate-900 shadow-pixel"
          initial={prefersReducedMotion ? undefined : { scale: 0.8, opacity: 0 }}
          animate={prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 12 }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[18px] border-4 border-slate-800 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-900">
            <div className="absolute inset-x-6 top-5 h-4 rounded-full border-2 border-slate-900 bg-slate-200/80" />
            <div className="absolute inset-x-6 top-12 h-[60%] rounded-lg border-4 border-slate-800 bg-slate-900/70" />
            <div className="absolute right-6 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-highlight shadow-[0_0_0_2px_rgba(17,17,26,0.7)]" />
          </div>
        </motion.div>
        <p className="font-pixel text-lg leading-relaxed text-highlight">{t('door.intro')}</p>
      </motion.div>

      <div className="max-w-lg space-y-2 rounded-3xl border border-slate-700/70 bg-slate-900/70 p-5 shadow-lg">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t('door.impatienceLabel')}</p>
        <motion.p
          key={dialogs[index]}
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="font-mono text-sm text-slate-100"
        >
          {dialogs[index]}
        </motion.p>
      </div>

      <motion.button
        type="button"
        onClick={onEnter}
        className="rounded-pixel bg-highlight px-8 py-3 font-pixel text-base uppercase tracking-[0.4em] text-charcoal shadow-pixel transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
        initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
        aria-label={t('door.button')}
      >
        {t('door.button')}
      </motion.button>
    </div>
  )
}
