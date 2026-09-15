import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'

import { doorDialogs } from '../data/dialogs'
import { useT } from '../hooks/useT'

type DoorSceneProps = {
  onEnter: () => void
}

/**
 * Animated door-knocking scene that plays before the interview begins.
 *
 * Stage machine: idle → knocking → dialog
 * - idle: door is shown, no animation yet (1.6 s pause)
 * - knocking: door shakes with a knock animation (0.9 s)
 * - dialog: typed messages appear one by one; "Enter" button shows after the first
 *
 * Under `prefers-reduced-motion` the stage jumps straight to dialog and all
 * messages appear instantly without typing or transitions.
 */
export function DoorScene({ onEnter }: DoorSceneProps) {
  const { t, lang } = useT()
  const prefersReducedMotion = useReducedMotion()
  const [stage, setStage] = useState<'idle' | 'knocking' | 'dialog'>('idle')
  const [messageIndex, setMessageIndex] = useState(-1)
  const [typedMessage, setTypedMessage] = useState('')
  const [doorImpact, setDoorImpact] = useState(false)
  const [showEnterButton, setShowEnterButton] = useState(false)
  // Refs hold timer IDs so they can all be cleared on unmount or language change
  const timers = useRef<number[]>([])
  const typeInterval = useRef<number | null>(null)
  const previousMessageIndex = useRef(-1)

  const dialogs = useMemo<string[]>(
    () => doorDialogs.map((item) => (lang === 'es' ? item.es : item.en)),
    [lang],
  )

  const introMessage = t<string>('door.intro')

  // Full message sequence: intro line followed by the three knock dialogs
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

  // Restart the whole sequence when the language changes
  useEffect(() => {
    clearTimers()
    setStage(prefersReducedMotion ? 'dialog' : 'idle')
    setMessageIndex(prefersReducedMotion ? 0 : -1)
    setTypedMessage(prefersReducedMotion ? sequence[0] ?? '' : '')
    setShowEnterButton(false)

    if (prefersReducedMotion) {
      return
    }

    const idleTimer = window.setTimeout(() => {
      setStage('knocking')
    }, 1600)
    timers.current.push(idleTimer)
  }, [lang, prefersReducedMotion, sequence])

  // Advance from knocking to dialog after the door animation plays
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

  // Type out each message character by character at 35 ms/char, then queue the next
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

      if (messageIndex === 0) {
        const buttonTimer = window.setTimeout(() => {
          setShowEnterButton(true)
        }, 1000)
        timers.current.push(buttonTimer)
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

        // Show the Enter button 1 s after the first message finishes typing
        if (messageIndex === 0) {
          const buttonTimer = window.setTimeout(() => {
            setShowEnterButton(true)
          }, 1000)
          timers.current.push(buttonTimer)
        }

        // Auto-advance to the next message after 5 s
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

  // Trigger a brief door-impact animation whenever the message index advances
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

  // The door itself barely moves (real doors don't rock on their hinges) —
  // a tiny jitter sells the physical hit, while the panel compression and
  // the knuckle/impact-ring effects below carry the "someone is knocking
  // from the other side" read.
  const doorVariants: Variants = {
    rest: { x: 0, scale: 1, opacity: 1, boxShadow: '0 10px 0 0 rgba(60, 36, 19, 0.35)' },
    knock: {
      x: [0, -1.5, 1.5, -1, 1, 0],
      scale: 1,
      opacity: 1,
      boxShadow: '0 12px 0 0 rgba(60, 36, 19, 0.45)',
      transition: { duration: 0.5, ease: 'easeInOut', repeat: 1, repeatDelay: 0.25 },
    },
  }

  const knockRingTransition = {
    duration: 0.45,
    ease: 'easeOut' as const,
    repeat: 2,
    repeatDelay: 0.2,
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
          className="relative mx-auto h-52 w-44"
          initial={prefersReducedMotion ? undefined : { scale: 0.85, opacity: 0 }}
          animate={prefersReducedMotion ? undefined : stage === 'knocking' ? 'knock' : 'rest'}
          variants={prefersReducedMotion ? undefined : doorVariants}
          transition={{ type: 'spring', stiffness: 130, damping: 14 }}
        >
          {/* floor shadow */}
          <div
            className="absolute inset-x-6 -bottom-3 h-4 rounded-b-[18px] bg-[#3c2413]/30 blur-[2px]"
            aria-hidden
          />
          {/* dark wood frame */}
          <div className="absolute inset-0 rounded-t-[20px] rounded-b-[10px] bg-[#3c2413]" aria-hidden />
          <div className="absolute left-0 top-9 h-4 w-1.5 rounded-sm bg-[#2a160a]" aria-hidden />
          <div className="absolute bottom-9 left-0 h-4 w-1.5 rounded-sm bg-[#2a160a]" aria-hidden />

          {/* door face — this is what visibly takes the hit */}
          <motion.div
            className="absolute inset-2 overflow-hidden rounded-t-[16px] rounded-b-[8px] bg-gradient-to-b from-[#c99a5b] to-[#b3854a] shadow-[inset_0_10px_16px_rgba(60,36,19,0.35)]"
            animate={
              prefersReducedMotion
                ? undefined
                : stage === 'knocking'
                  ? { scaleY: [1, 0.985, 1, 0.985, 1] }
                  : doorImpact
                    ? { scaleY: [1, 0.99, 1] }
                    : { scaleY: 1 }
            }
            transition={stage === 'knocking' ? { duration: 0.5, ease: 'easeInOut' } : { duration: 0.3, ease: 'easeOut' }}
          >
            <div className="absolute inset-x-7 top-7 h-20 rounded-[10px] bg-gradient-to-b from-[#a9713f] to-[#8a5a30] shadow-[inset_0_2px_0_rgba(255,240,210,0.4),inset_0_-3px_4px_rgba(60,36,19,0.5)]" />
            <div className="absolute inset-x-8 bottom-6 h-16 rounded-[10px] bg-gradient-to-b from-[#a9713f] to-[#8a5a30] shadow-[inset_0_2px_0_rgba(255,240,210,0.4),inset_0_-3px_4px_rgba(60,36,19,0.5)]" />

            {/* brass knob at real knob height, not moving — a fixed door doesn't rattle */}
            <div className="absolute right-3 top-[104px] h-9 w-2.5 rounded bg-[#7a5230]" />
            <div className="absolute right-2 top-[107px] h-4 w-4 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fbe3ab,#cf9a4a_55%,#a9743a)] shadow-[0_1px_2px_rgba(60,36,19,0.5)]" />

            {/* knuckle contact points, right where the knocking happens */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-16 h-1.5 w-1.5 -translate-x-3 -translate-y-1/2 rounded-full bg-[#3c2413]/70"
              animate={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : stage === 'knocking'
                    ? { opacity: [0, 1, 0], scale: [0.6, 1, 0.6] }
                    : { opacity: 0 }
              }
              transition={knockRingTransition}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-16 h-1.5 w-1.5 translate-x-1.5 -translate-y-1/2 rounded-full bg-[#3c2413]/70"
              animate={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : stage === 'knocking'
                    ? { opacity: [0, 1, 0], scale: [0.6, 1, 0.6] }
                    : { opacity: 0 }
              }
              transition={{ ...knockRingTransition, delay: 0.08 }}
            />

            {/* impact ring: energy rippling out from behind the panel */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-16 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-highlight"
              animate={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : stage === 'knocking'
                    ? { scale: [0.4, 1.5], opacity: [0.6, 0] }
                    : doorImpact
                      ? { scale: [0.5, 1.2], opacity: [0.4, 0] }
                      : { scale: 0.4, opacity: 0 }
              }
              transition={stage === 'knocking' ? knockRingTransition : { duration: 0.5, ease: 'easeOut' }}
            />
          </motion.div>
        </motion.div>

        {/* aria-live so screen readers announce each new typed message */}
        <motion.div
          className="mx-auto max-w-xl rounded-3xl border-2 border-[#d8c39a] bg-[#fffaf0] p-6 shadow-lg"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
          animate={stage === 'dialog' ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          aria-live="polite"
        >
          <motion.p
            key={messageIndex}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="font-sans text-lg font-semibold tracking-wide text-charcoal"
          >
            {typedMessage}
          </motion.p>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showEnterButton ? (
          <motion.button
            key="enter-door-button"
            type="button"
            onClick={onEnter}
            className="rounded-pixel bg-highlight px-8 py-3 font-sans text-base font-bold tracking-wide text-charcoal shadow-pixel transition-all duration-200 hover:-translate-y-1 hover:bg-highlight/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    opacity: 1,
                    scale: [1, 1.03, 1],
                    boxShadow: [
                      '0 4px 0 0 rgba(60,36,19,0.35)',
                      '0 4px 0 0 rgba(60,36,19,0.35), 0 0 16px rgba(207,154,74,0.45)',
                      '0 4px 0 0 rgba(60,36,19,0.35)',
                    ],
                  }
            }
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
            transition={prefersReducedMotion ? undefined : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
            aria-label={t('door.button')}
          >
            {t('door.button')}
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
