import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'

import { doorDialogs } from '../data/dialogs'
import { useSound } from '../hooks/useSound'
import { useT } from '../hooks/useT'
import { centerOf, useFx } from './fx/FxProvider'

type DoorSceneProps = {
  onEnter: () => void
}

type KnockPop = { id: number; x: number; y: number; rotate: number }

/**
 * Animated night-time door scene that plays before the interview begins.
 *
 * Stage machine: idle → knocking → dialog → opening
 * - idle: the street is shown, no animation yet (1.4 s pause)
 * - knocking: the door takes three hits — screen shake, sound and comic "KNOCK" pops
 * - dialog: RPG-style dialog box types each message; the open button appears after the first
 * - opening: the door swings open in 3D, light floods out and Luis is revealed
 *
 * Under `prefers-reduced-motion` the stage jumps straight to dialog and all
 * messages appear instantly without typing or transitions.
 */
export function DoorScene({ onEnter }: DoorSceneProps) {
  const { t, lang } = useT()
  const { sfx } = useSound()
  const fx = useFx()
  const prefersReducedMotion = useReducedMotion()
  const [stage, setStage] = useState<'idle' | 'knocking' | 'dialog' | 'opening'>('idle')
  const [messageIndex, setMessageIndex] = useState(-1)
  const [typedMessage, setTypedMessage] = useState('')
  const [doorImpact, setDoorImpact] = useState(0)
  const [showEnterButton, setShowEnterButton] = useState(false)
  const [pops, setPops] = useState<KnockPop[]>([])
  // Refs hold timer IDs so they can all be cleared on unmount or language change
  const timers = useRef<number[]>([])
  const typeInterval = useRef<number | null>(null)
  const popId = useRef(0)
  const doorRef = useRef<HTMLDivElement>(null)

  const dialogs = useMemo<string[]>(
    () => doorDialogs.map((item) => (lang === 'es' ? item.es : item.en)),
    [lang],
  )

  const introMessage = t<string>('door.intro')
  const knockLabel = t<string>('door.knock')

  // Full message sequence: intro line followed by the three knock dialogs
  const sequence = useMemo<string[]>(() => [introMessage, ...dialogs], [dialogs, introMessage])

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

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

  /** One physical knock: sound + door impact + shake + a comic pop near the door */
  const knock = () => {
    sfx.knock()
    setDoorImpact((prev) => prev + 1)
    fx.shake()
    const id = (popId.current += 1)
    setPops((prev) => [
      ...prev,
      { id, x: (Math.random() - 0.5) * 220, y: -40 - Math.random() * 120, rotate: (Math.random() - 0.5) * 40 },
    ])
    later(() => setPops((prev) => prev.filter((pop) => pop.id !== id)), 900)
  }

  // Restart the whole sequence when the language changes
  useEffect(() => {
    clearTimers()
    setStage(prefersReducedMotion ? 'dialog' : 'idle')
    setMessageIndex(prefersReducedMotion ? 0 : -1)
    setTypedMessage(prefersReducedMotion ? sequence[0] ?? '' : '')
    setShowEnterButton(Boolean(prefersReducedMotion))

    if (prefersReducedMotion) {
      return
    }

    later(() => setStage('knocking'), 1400)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, prefersReducedMotion, sequence])

  // Three knocks, then move on to the dialog
  useEffect(() => {
    if (stage !== 'knocking') {
      return
    }
    ;[0, 280, 560].forEach((delay) => later(knock, delay))
    later(() => {
      setStage('dialog')
      setMessageIndex(0)
    }, 1100)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  // Type out each message character by character at 35 ms/char, then queue the next
  useEffect(() => {
    if (stage === 'opening') return
    if (messageIndex < 0 || messageIndex >= sequence.length) {
      setTypedMessage('')
      return
    }

    const message = sequence[messageIndex]

    if (prefersReducedMotion) {
      setTypedMessage(message)
      if (messageIndex < sequence.length - 1) {
        later(() => setMessageIndex((prev) => Math.min(prev + 1, sequence.length - 1)), 5000)
      }
      return
    }

    // Every follow-up message starts with a couple of impatient knocks
    if (messageIndex > 0) {
      knock()
      later(knock, 220)
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
      if (index % 2 === 0 && message[index] !== ' ') sfx.blip(1.3)

      if (index >= message.length && typeInterval.current !== null) {
        window.clearInterval(typeInterval.current)
        typeInterval.current = null

        // Show the open button 0.6 s after the first message finishes typing
        if (messageIndex === 0) {
          later(() => setShowEnterButton(true), 600)
        }

        // Auto-advance to the next message after 5 s
        if (messageIndex < sequence.length - 1) {
          later(() => setMessageIndex((prev) => Math.min(prev + 1, sequence.length - 1)), 5000)
        }
      }
    }, 35)

    return () => {
      if (typeInterval.current !== null) {
        window.clearInterval(typeInterval.current)
        typeInterval.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageIndex, prefersReducedMotion, sequence])

  const handleOpen = () => {
    if (stage === 'opening') return
    clearTimers()
    setStage('opening')
    setShowEnterButton(false)
    sfx.door()
    if (prefersReducedMotion) {
      onEnter()
      return
    }
    later(() => {
      fx.burst(centerOf(doorRef.current), { count: 90, speed: 12, size: 8, colors: ['#ffffff', '#fff6c2', '#22e4ff', '#ffd23f'] })
      sfx.powerUp()
    }, 450)
    later(() => fx.flash('rgba(255,255,255,0.85)'), 1250)
    later(onEnter, 1400)
  }

  const isOpening = stage === 'opening'

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      {/* The building + door */}
      <motion.div
        className="relative"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
        animate={prefersReducedMotion ? undefined : isOpening ? { opacity: 1, y: 0, scale: 1.6 } : { opacity: 1, y: 0, scale: 1 }}
        transition={isOpening ? { duration: 1.4, ease: [0.7, 0, 0.84, 0] } : { duration: 0.7, ease: 'easeOut' }}
      >
        {/* Flickering neon sign */}
        <motion.div
          className="mx-auto mb-5 w-fit rounded-lg border-2 border-neonPink px-4 py-2 font-pixel text-xs text-neonPink text-neon shadow-neon-pink sm:text-sm"
          animate={prefersReducedMotion ? undefined : { opacity: [1, 1, 0.3, 1, 1, 0.6, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.4, 0.42, 0.44, 0.8, 0.82, 0.84] }}
        >
          LK <span className="font-sans text-base">★</span> STUDIO
        </motion.div>

        {/* Brick wall around the door */}
        <div className="relative rounded-t-3xl border-2 border-line bg-[#1a0f3a] px-10 pb-0 pt-8 shadow-[0_30px_80px_rgba(0,0,0,0.6)] [background-image:linear-gradient(#24164f_2px,transparent_2px),linear-gradient(90deg,#24164f_2px,transparent_2px)] [background-size:40px_20px] sm:px-16">
          {/* Wall lamp light cone */}
          <div aria-hidden className="absolute -top-2 left-1/2 h-40 w-64 -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(255,210,63,0.35),transparent_70%)]" />

          <div
            ref={doorRef}
            role="img"
            aria-label={t('door.intro')}
            className="relative mx-auto h-56 w-40 [perspective:900px] sm:h-64 sm:w-44"
          >
            {/* Doorway: what's behind the door (light + Luis) */}
            <div className="absolute inset-0 overflow-hidden rounded-t-[18px] bg-gradient-to-b from-[#fff6c2] via-[#ffd23f] to-[#ff8a3d]">
              <motion.div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#ffffff,transparent_70%)]"
                animate={prefersReducedMotion ? undefined : { opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <motion.img
                src="/imgs/main_caracter/LK_hablando1.png"
                alt=""
                className="pixelated absolute bottom-0 left-1/2 h-[85%] w-auto -translate-x-1/2"
                initial={{ opacity: 0 }}
                animate={isOpening ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.35, duration: 0.3 }}
              />
            </div>

            {/* Door panel — swings open on its left hinge */}
            <motion.div
              className="absolute inset-0 origin-left [transform-style:preserve-3d]"
              animate={
                isOpening
                  ? { rotateY: -105 }
                  : prefersReducedMotion
                    ? undefined
                    : { rotateY: 0, x: doorImpact % 2 === 0 ? [0, -2, 2, 0] : [0, 2, -2, 0] }
              }
              transition={isOpening ? { duration: 0.9, ease: [0.3, 1.4, 0.5, 1] } : { duration: 0.18 }}
            >
              <div className="absolute inset-0 overflow-hidden rounded-t-[18px] border-4 border-[#0d0726] bg-gradient-to-b from-[#6b3fd6] to-[#3b1f8f] shadow-[inset_0_10px_20px_rgba(0,0,0,0.35)]">
                {/* Panels */}
                <div className="absolute inset-x-5 top-6 h-[38%] rounded-lg border-2 border-[#2a1670] bg-gradient-to-b from-[#7d52e8] to-[#4a2aa8] shadow-[inset_0_2px_0_rgba(255,255,255,0.25)]" />
                <div className="absolute inset-x-5 bottom-6 h-[34%] rounded-lg border-2 border-[#2a1670] bg-gradient-to-b from-[#7d52e8] to-[#4a2aa8] shadow-[inset_0_2px_0_rgba(255,255,255,0.25)]" />
                {/* Peephole */}
                <div className="absolute left-1/2 top-3 h-2 w-2 -translate-x-1/2 rounded-full bg-coin shadow-[0_0_8px_#ffd23f]" />
                {/* Knob */}
                <div className="absolute right-3 top-1/2 h-4 w-4 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff6c2,#ffd23f_55%,#c98a00)] shadow-[0_0_10px_rgba(255,210,63,0.8)]" />
                {/* Impact ring on every knock */}
                <AnimatePresence>
                  {!prefersReducedMotion && doorImpact > 0 ? (
                    <motion.span
                      key={doorImpact}
                      aria-hidden
                      className="absolute left-[calc(50%-24px)] top-[22%] h-12 w-12 rounded-full border-4 border-neonCyan"
                      initial={{ scale: 0.3, opacity: 0.9 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Light leaking under the door */}
            <motion.div
              aria-hidden
              className="absolute -bottom-1 left-2 right-2 h-2 rounded-full bg-coin blur-[3px]"
              animate={prefersReducedMotion ? undefined : { opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Comic knock pops */}
            <AnimatePresence>
              {pops.map((pop) => (
                <motion.span
                  key={pop.id}
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/3 whitespace-nowrap font-pixel text-base text-coin [-webkit-text-stroke:1px_#0b0620] [text-shadow:3px_3px_0_#ff3ea5]"
                  initial={{ opacity: 0, scale: 0.3, x: pop.x * 0.3, y: 0, rotate: pop.rotate }}
                  animate={{ opacity: 1, scale: 1.3, x: pop.x, y: pop.y, rotate: pop.rotate }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  {knockLabel.split(' ')[0]}!
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
        {/* Sidewalk */}
        <div className="h-3 rounded-b-md bg-gradient-to-b from-line to-abyss" />
      </motion.div>

      {/* RPG dialog box */}
      <motion.div
        className="relative w-full max-w-xl"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
        animate={stage === 'dialog' ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        aria-live="polite"
      >
        <div className="flex items-stretch gap-3 rounded-2xl border-4 border-ink bg-abyss/95 p-3 text-left shadow-[0_0_0_4px_#0b0620,0_0_30px_rgba(155,92,255,0.5)]">
          <div className="relative flex w-20 shrink-0 flex-col items-center justify-end overflow-hidden rounded-lg border-2 border-line bg-gradient-to-b from-neonPurple/40 to-neonPink/30 sm:w-24">
            <img src="/imgs/main_caracter/LK_hablando1.png" alt="" className="pixelated h-20 w-20 object-cover object-top sm:h-24 sm:w-24" />
            <span className="absolute left-1 top-1 rounded bg-neonPink px-1.5 py-0.5 font-pixel text-[7px] text-ink">LK</span>
          </div>
          <div className="flex min-h-[5.5rem] flex-1 items-center">
            <p className="font-mono text-2xl leading-tight text-ink sm:text-3xl">
              {typedMessage}
              <span className="ml-1 inline-block animate-blink text-neonCyan motion-reduce:animate-none">▼</span>
            </p>
          </div>
        </div>
      </motion.div>

      <div className="h-16">
        <AnimatePresence>
          {showEnterButton ? (
            <motion.button
              key="enter-door-button"
              type="button"
              onClick={handleOpen}
              onPointerEnter={() => sfx.hover()}
              className="btn-arcade bg-neonCyan px-8 py-4 text-xs"
              initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.5, y: 20 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, scale: [1, 1.06, 1], y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.6 }}
              transition={{ scale: { duration: 1.4, repeat: Infinity }, default: { type: 'spring', stiffness: 300, damping: 18 } }}
            >
              🚪 {t<string>('door.button')}
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
