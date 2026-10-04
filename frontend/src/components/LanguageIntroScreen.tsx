import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { dict, type Language } from '../i18n/dict'
import { useSound } from '../hooks/useSound'
import { useT } from '../hooks/useT'
import { centerOf, useFx } from './fx/FxProvider'
import { TiltCard } from './fx/TiltCard'

const languageOrder: Language[] = ['en', 'es']

/**
 * Arcade "title screen" — the first thing a visitor sees.
 *
 * Shows the glitchy logo, the floating character and two holographic flag
 * cards. The selection is previewed locally until confirmed so the copy
 * updates reactively. Arrow keys switch language and Enter confirms.
 */
export function LanguageIntroScreen({ onConfirm }: { onConfirm: () => void }) {
  const prefersReducedMotion = useReducedMotion()
  const { lang, setLang } = useT()
  const { sfx } = useSound()
  const fx = useFx()
  const [selected, setSelected] = useState<Language>(lang)
  const [leaving, setLeaving] = useState(false)
  const confirmRef = useRef<HTMLButtonElement>(null)

  // Read copy directly from the dict for the previewed language, not the context language
  const copy = useMemo(() => dict[selected].languageIntro, [selected])

  const choose = useCallback(
    (code: Language) => {
      setSelected((prev) => {
        if (prev !== code) sfx.select()
        return code
      })
    },
    [sfx],
  )

  const handleConfirm = useCallback(() => {
    if (leaving) return
    setLeaving(true)
    sfx.start()
    fx.burst(centerOf(confirmRef.current), { count: 60, speed: 10, size: 8 })
    fx.flash('rgba(34,228,255,0.35)')
    setLang(selected)
    window.setTimeout(onConfirm, prefersReducedMotion ? 0 : 450)
  }, [fx, leaving, onConfirm, prefersReducedMotion, selected, setLang, sfx])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        const index = languageOrder.indexOf(selected)
        const next = languageOrder[(index + (event.key === 'ArrowRight' ? 1 : -1) + languageOrder.length) % languageOrder.length]
        choose(next)
      }
      if (event.key === 'Enter' && document.activeElement?.tagName !== 'BUTTON') {
        handleConfirm()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [choose, handleConfirm, selected])

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      {/* Logo */}
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.6, y: -30 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 14 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <motion.img
            src="/imgs/main_caracter/LK_defrente.png"
            alt=""
            className="pixelated h-28 w-28 drop-shadow-[0_0_24px_rgba(155,92,255,0.8)] sm:h-36 sm:w-36"
            animate={prefersReducedMotion ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="absolute inset-x-0 -bottom-2 mx-auto h-3 w-20 rounded-full bg-neonPurple/50 blur-md"
            animate={prefersReducedMotion ? undefined : { scaleX: [1, 0.7, 1], opacity: [0.8, 0.4, 0.8] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <h1
          className="glitch font-pixel text-2xl leading-tight text-ink sm:text-4xl"
          data-text="LUIS DA SILVA"
        >
          LUIS DA SILVA
        </h1>
        <p className="text-gradient font-pixel text-[10px] tracking-[0.4em] sm:text-xs">THE INTERVIEW</p>
      </motion.div>

      {/* Player label + question */}
      <div className="space-y-2">
        <p className="font-pixel text-[10px] text-neonPink text-neon animate-blink motion-reduce:animate-none">
          ▶ {copy.subtitle}
        </p>
        <AnimatePresence mode="wait">
          <motion.h2
            key={selected}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8, filter: 'blur(4px)' }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.25 }}
            className="font-pixel text-xs text-muted sm:text-sm"
          >
            {copy.title}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* Flag cards */}
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
        {languageOrder.map((code, index) => {
          const isActive = selected === code
          return (
            <motion.div
              key={code}
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 40, rotate: index === 0 ? -8 : 8 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 15, delay: 0.25 + index * 0.12 }}
              className="relative"
            >
              {isActive ? (
                <motion.span
                  layoutId="flag-cursor"
                  aria-hidden
                  className="absolute inset-x-0 -top-8 text-center font-pixel text-lg text-coin text-neon"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <motion.span
                    className="block"
                    animate={prefersReducedMotion ? undefined : { y: [0, 6, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    ▼
                  </motion.span>
                </motion.span>
              ) : null}
              <TiltCard
                onClick={() => choose(code)}
                onDoubleClick={handleConfirm}
                onPointerEnter={() => sfx.hover()}
                aria-pressed={isActive}
                aria-label={dict[code].common.languageName}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
                className={`overflow-hidden rounded-3xl p-[3px] transition-[filter,opacity] duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-60 saturate-50 hover:opacity-90 hover:saturate-100'
                }`}
              >
                {/* Rotating conic border on the active card */}
                <span
                  aria-hidden
                  className={`absolute inset-[-60%] ${isActive ? 'animate-[spin_3s_linear_infinite] motion-reduce:animate-none' : ''}`}
                  style={{
                    background: isActive
                      ? 'conic-gradient(from 0deg, #22e4ff, #9b5cff, #ff3ea5, #ffd23f, #22e4ff)'
                      : '#3a2a78',
                  }}
                />
                <span className="relative flex flex-col items-center gap-3 rounded-[22px] bg-panel px-6 py-5 sm:px-8 sm:py-6">
                  <img
                    src={`/imgs/languages/lang_${code}.png`}
                    alt=""
                    className="h-20 w-20 drop-shadow-[0_6px_0_rgba(0,0,0,0.5)] sm:h-24 sm:w-24"
                  />
                  <span className={`font-pixel text-xs ${isActive ? 'text-ink' : 'text-muted'}`}>
                    {dict[code].common.languageName}
                  </span>
                </span>
              </TiltCard>
            </motion.div>
          )
        })}
      </div>

      <motion.button
        ref={confirmRef}
        type="button"
        onClick={handleConfirm}
        onPointerEnter={() => sfx.hover()}
        className="btn-arcade bg-coin px-10 py-4 text-xs"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
        animate={
          prefersReducedMotion
            ? undefined
            : { opacity: 1, y: 0, boxShadow: ['0 6px 0 0 rgba(0,0,0,0.55), 0 0 0px rgba(255,210,63,0)', '0 6px 0 0 rgba(0,0,0,0.55), 0 0 30px rgba(255,210,63,0.8)', '0 6px 0 0 rgba(0,0,0,0.55), 0 0 0px rgba(255,210,63,0)'] }
        }
        transition={{ opacity: { delay: 0.6 }, y: { delay: 0.6 }, boxShadow: { duration: 1.8, repeat: Infinity } }}
      >
        {copy.confirm} ▶
      </motion.button>

      <p className="hidden font-mono text-lg text-muted/70 sm:block">{copy.keyboardHint}</p>
    </div>
  )
}
