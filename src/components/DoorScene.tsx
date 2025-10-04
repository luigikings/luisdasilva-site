import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'

import { doorDialogs } from '../data/dialogs'
import { useT } from '../hooks/useT'

type DoorSceneProps = {
  onEnter: () => void
}

export function DoorScene({ onEnter }: DoorSceneProps) {
  const { t, lang } = useT()
  const prefersReducedMotion = useReducedMotion()
  const [stage, setStage] = useState<'idle' | 'knocking' | 'dialog'>('idle')
  const [messageIndex, setMessageIndex] = useState(-1)
  const [typedMessage, setTypedMessage] = useState('')
  const [doorImpact, setDoorImpact] = useState(false)
  const timers = useRef<number[]>([])
  const typeInterval = useRef<number | null>(null)
  const previousMessageIndex = useRef(-1)

  const dialogs = useMemo<string[]>(
    () => doorDialogs.map((item) => (lang === 'es' ? item.es : item.en)),
    [lang],
  )

  const introMessage = t<string>('door.intro')

  const sequence = useMemo<string[]>(
    () => [introMessage, ...dialogs],
    [dialogs, introMessage],
  )

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
    if (typeInterval.current !== null) {
      window.clearInterval(typeInterval.current)
      typeInterval.current = null
    }
  }

  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [])

  useEffect(() => {
    clearTimers()
    setStage(prefersReducedMotion ? 'dialog' : 'idle')
    setMessageIndex(prefersReducedMotion ? 0 : -1)
    setTypedMessage(prefersReducedMotion ? sequence[0] ?? '' : '')

    if (prefersReducedMotion) {
      return
    }

    const idleTimer = window.setTimeout(() => {
      setStage('knocking')
    }, 1600)
    timers.current.push(idleTimer)
  }, [lang, prefersReducedMotion, sequence])

  useEffect(() => {
    if (stage !== 'knocking') {
      return
    }

    const timer = window.setTimeout(() => {
      setStage('dialog')
      setMessageIndex(0)
    }, 900)

    timers.current.push(timer)
  }, [stage])

  useEffect(() => {
    if (messageIndex < 0 || messageIndex >= sequence.length) {
      setTypedMessage('')
      return
    }

    const message = sequence[messageIndex]

    if (typeof message !== 'string') {
      setTypedMessage('')
      return
    }

    if (prefersReducedMotion) {
      setTypedMessage(message)

      if (messageIndex < sequence.length - 1) {
        const timer = window.setTimeout(() => {
          setMessageIndex((prev) => Math.min(prev + 1, sequence.length - 1))
        }, 5000)
        timers.current.push(timer)
      }

      return
    }

    if (typeInterval.current !== null) {
      window.clearInterval(typeInterval.current)
      typeInterval.current = null
    }

    setTypedMessage('')
    let index = 0

    typeInterval.current = window.setInterval(() => {
      index += 1
      setTypedMessage(message.slice(0, index))

      if (index >= message.length && typeInterval.current !== null) {
        window.clearInterval(typeInterval.current)
        typeInterval.current = null

        if (messageIndex < sequence.length - 1) {
          const timer = window.setTimeout(() => {
            setMessageIndex((prev) => Math.min(prev + 1, sequence.length - 1))
          }, 5000)
          timers.current.push(timer)
        }
      }
    }, 35)

    return () => {
      if (typeInterval.current !== null) {
        window.clearInterval(typeInterval.current)
        typeInterval.current = null
      }
    }
  }, [messageIndex, prefersReducedMotion, sequence])

  useEffect(() => {
    if (prefersReducedMotion) {
      previousMessageIndex.current = messageIndex
      return
    }

    if (
      previousMessageIndex.current === 0 &&
      messageIndex > 0 &&
      !doorImpact
    ) {
      setDoorImpact(true)
      const timer = window.setTimeout(() => {
        setDoorImpact(false)
      }, 360)
      timers.current.push(timer)
    }
    previousMessageIndex.current = messageIndex
  }, [doorImpact, messageIndex, prefersReducedMotion])

  const doorVariants: Variants = {
    rest: { rotate: 0, x: 0, boxShadow: '0 14px 0 0 rgba(8, 12, 22, 0.65)' },
    knock: {
      rotate: [0, -1.2, 1.5, -1, 0.6, 0],
      x: [0, -4, 4, -3, 2, 0],
      transition: {
        duration: 0.7,
        ease: 'easeInOut',
        repeat: 2,
        repeatDelay: 0.1,
      },
      boxShadow: '0 18px 0 0 rgba(8, 12, 22, 0.85)',
    },
    impact: {
      rotate: 0,
      x: [0, -2, 2, -1, 0],
      scale: [1, 1.06, 0.97, 1],
      boxShadow: [
        '0 14px 0 0 rgba(8, 12, 22, 0.65)',
        '0 22px 0 0 rgba(8, 12, 22, 0.75)',
        '0 12px 0 0 rgba(8, 12, 22, 0.6)',
        '0 14px 0 0 rgba(8, 12, 22, 0.65)',
      ],
      transition: { duration: 0.42, ease: 'easeOut' },
    },
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-12 text-center">
      <motion.div
        className="space-y-7"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div
          role="img"
          aria-label={t('door.intro')}
          className="relative mx-auto h-52 w-44 rounded-pixel border-4 border-slate-700 bg-slate-900 shadow-pixel"
          initial={prefersReducedMotion ? undefined : { scale: 0.85, opacity: 0 }}
          animate={
            prefersReducedMotion
              ? undefined
              : stage === 'knocking'
                ? 'knock'
                : doorImpact
                  ? 'impact'
                  : 'rest'
          }
          variants={prefersReducedMotion ? undefined : doorVariants}
          transition={{ type: 'spring', stiffness: 130, damping: 14 }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[18px] border-4 border-slate-800 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-900">
            <div className="absolute inset-x-6 top-5 h-4 rounded-full border-2 border-slate-900 bg-slate-200/80" />
            <div className="absolute inset-x-6 top-12 h-[60%] rounded-lg border-4 border-slate-800 bg-slate-900/70" />
            <motion.div
              className="absolute inset-0"
              animate={
                prefersReducedMotion
                  ? undefined
                  : stage === 'knocking'
                    ? { boxShadow: ['0 0 0 rgba(148, 163, 184, 0)', '0 0 30px rgba(148, 163, 184, 0.25)', '0 0 0 rgba(148, 163, 184, 0)'] }
                    : { boxShadow: '0 0 0 rgba(148, 163, 184, 0)' }
              }
              transition={{ duration: 0.9, ease: 'easeInOut', repeat: stage === 'knocking' ? 2 : 0, repeatDelay: 0.2 }}
            />
            <motion.div
              className="absolute right-6 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-highlight shadow-[0_0_0_2px_rgba(17,17,26,0.7)]"
              animate={
                prefersReducedMotion
                  ? undefined
                  : stage === 'knocking'
                    ? { scale: [1, 0.85, 1.1, 1] }
                    : { scale: 1 }
              }
              transition={{ duration: 0.6, ease: 'easeInOut', repeat: stage === 'knocking' ? 2 : 0, repeatDelay: 0.15 }}
            />
          </div>
        </motion.div>

        <motion.div
          className="mx-auto max-w-xl rounded-3xl border border-slate-700/70 bg-slate-900/70 p-6 shadow-lg"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
          animate={stage === 'dialog' ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          aria-live="polite"
        >
          <motion.p
            key={messageIndex}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="font-pixel text-lg uppercase tracking-[0.5em] text-highlight"
          >
            {typedMessage}
          </motion.p>
        </motion.div>
      </motion.div>

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
