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

    if (messageIndex >= 0 && messageIndex !== previousMessageIndex.current) {
      setDoorImpact(true)
      const timer = window.setTimeout(() => {
        setDoorImpact(false)
      }, 360)
      timers.current.push(timer)
    }

    previousMessageIndex.current = messageIndex
  }, [messageIndex, prefersReducedMotion])

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
          className="relative mx-auto h-52 w-44 rounded-pixel border-4 border-slate-600 bg-slate-800/85 shadow-[0_18px_0_0_rgba(8,12,22,0.75)] before:absolute before:-inset-6 before:-z-10 before:rounded-[28px] before:bg-highlight/15 before:blur-[32px] before:content-[''] before:transition-opacity before:duration-500 before:ease-out"
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
          <div
            className="absolute inset-x-6 -bottom-4 h-4 rounded-b-[18px] bg-slate-900/70 blur-[2px]"
            aria-hidden
          />
          <div
            className="absolute -inset-3 rounded-[22px] border-4 border-slate-950/70 bg-slate-900/80"
            aria-hidden
          />
          <div className="relative h-full w-full overflow-hidden rounded-[18px] border-[3px] border-slate-900/80 bg-gradient-to-b from-[#e7ecff]/95 via-[#9aa6d6]/95 to-[#394365]/95 shadow-[inset_0_12px_18px_rgba(15,23,42,0.45)]">
            <div className="absolute inset-x-8 top-6 h-6 rounded-[12px] border-2 border-slate-900/70 bg-slate-100/80 shadow-[inset_0_-2px_6px_rgba(51,65,85,0.35)]" />
            <div className="absolute inset-x-10 top-[38%] h-2 rounded-full bg-slate-900/35" />
            <div className="absolute inset-x-8 top-[44%] h-[38%] rounded-[14px] border-[3px] border-slate-900/60 bg-gradient-to-b from-[#465470]/85 via-[#374152]/90 to-[#111827] shadow-[inset_0_6px_8px_rgba(15,23,42,0.45)]" />
            <div className="absolute inset-x-10 bottom-8 h-12 rounded-[10px] border-[3px] border-slate-900/60 bg-gradient-to-b from-[#71809f]/85 via-[#55617d]/90 to-[#1f2637] shadow-[inset_0_6px_10px_rgba(15,23,42,0.5)]" />
            <motion.div
              className="absolute right-8 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-highlight shadow-[0_0_0_3px_rgba(17,17,26,0.55)]"
              animate={
                prefersReducedMotion
                  ? undefined
                  : stage === 'knocking'
                    ? { scale: [1, 0.85, 1.1, 1] }
                    : { scale: 1 }
              }
              transition={{ duration: 0.6, ease: 'easeInOut', repeat: stage === 'knocking' ? 2 : 0, repeatDelay: 0.15 }}
            />
            <div className="absolute right-8 top-[54%] h-1 w-6 rounded-full bg-highlight/35" aria-hidden />
            <motion.div
              className="absolute inset-0"
              animate={
                prefersReducedMotion
                  ? undefined
                  : stage === 'knocking'
                    ? { boxShadow: ['0 0 0 rgba(148, 163, 184, 0)', '0 0 32px rgba(148, 163, 184, 0.3)', '0 0 0 rgba(148, 163, 184, 0)'] }
                    : { boxShadow: '0 0 0 rgba(148, 163, 184, 0)' }
              }
              transition={{ duration: 0.9, ease: 'easeInOut', repeat: stage === 'knocking' ? 2 : 0, repeatDelay: 0.2 }}
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
