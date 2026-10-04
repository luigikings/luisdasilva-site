import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { DoorScene } from '../components/DoorScene'
import { Interview } from '../components/Interview'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { LanguageIntroScreen } from '../components/LanguageIntroScreen'
import { LoadingScreen } from '../components/LoadingScreen'
import { ArcadeBackground } from '../components/fx/ArcadeBackground'
import { CursorFx } from '../components/fx/CursorFx'
import { centerOf, useFx } from '../components/fx/FxProvider'
import { dict } from '../i18n/dict'
import { useSound } from '../hooks/useSound'
import { useT } from '../hooks/useT'
import { notifyDoorEntry } from '../lib/api'

/**
 * Top-level view controller for the entire interview experience.
 *
 * View state machine:
 *   language → loading → door → interview
 *
 * Each view fills the full viewport and transitions via AnimatePresence (mode="wait"),
 * so only one view is mounted at a time. Every view change is revealed by a
 * colored pixel-bar wipe. The language flags are hidden on the language-selection
 * screen because there the user hasn't committed to a language yet (the sound
 * toggle is always visible).
 */
type ViewKey = 'language' | 'loading' | 'door' | 'interview'

const WIPE_COLORS = [
  '#22e4ff',
  '#9b5cff',
  '#ff3ea5',
  '#ff8a3d',
  '#ffd23f',
  '#7cff6b',
  '#22e4ff',
  '#9b5cff',
  '#ff3ea5',
  '#ff8a3d',
]

/** Vertical neon bars that retract one after another to reveal the new view */
function PixelWipe() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[75] flex">
      {WIPE_COLORS.map((color, index) => (
        <motion.span
          key={index}
          className="h-full flex-1 origin-top"
          style={{ background: color }}
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.45, ease: [0.7, 0, 0.3, 1], delay: index * 0.035 }}
        />
      ))}
    </div>
  )
}

export function InterviewExperience() {
  const prefersReducedMotion = useReducedMotion()
  const { lang, t } = useT()
  const { sfx } = useSound()
  const fx = useFx()
  const [view, setView] = useState<ViewKey>('language')
  const [loadingTitleIndex, setLoadingTitleIndex] = useState(0)
  const [showTutorial, setShowTutorial] = useState(false)
  const tutorialButtonRef = useRef<HTMLButtonElement>(null)

  const loadingTitles = useMemo(() => dict[lang].meta.loadingTitles, [lang])
  const tutorial = t<{
    title: string
    steps: { icon: string; text: string }[]
    close: string
  }>('interview.tutorial')

  // Rotate document.title during loading to entertain visitors while they wait
  useEffect(() => {
    if (view === 'language') {
      document.title = dict[lang].meta.languageTitle
      return
    }

    if (view === 'loading') {
      document.title = loadingTitles[loadingTitleIndex % loadingTitles.length]
      return
    }

    if (view === 'door') {
      document.title = dict[lang].meta.doorTitle
      return
    }

    if (view === 'interview') {
      document.title = dict[lang].meta.interviewTitle
    }
  }, [lang, loadingTitleIndex, loadingTitles, view])

  // Cycle the loading title every 2 s; clean up when leaving the loading view
  useEffect(() => {
    if (view !== 'loading') {
      setLoadingTitleIndex(0)
      return
    }

    const intervalId = window.setInterval(() => {
      setLoadingTitleIndex((prev) => (prev + 1) % loadingTitles.length)
    }, 2000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [loadingTitles, view])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [view])

  const handleConfirmLanguage = () => setView('loading')
  const handleStart = () => setView('door')
  const handleEnter = () => {
    // Fire-and-forget: a failed notification should never block the user from entering
    void notifyDoorEntry({ lang }).catch((error) => {
      console.warn('Failed to notify door entry.', error)
    })
    setView('interview')
    setShowTutorial(true)
  }

  const closeTutorial = () => {
    sfx.start()
    fx.burst(centerOf(tutorialButtonRef.current), { count: 50, speed: 9 })
    setShowTutorial(false)
  }

  const viewMotion = {
    initial: prefersReducedMotion ? undefined : { opacity: 0, scale: 1.04 },
    animate: prefersReducedMotion ? undefined : { opacity: 1, scale: 1 },
    exit: prefersReducedMotion
      ? undefined
      : { opacity: 0, scale: 0.96, filter: 'blur(6px)' },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  return (
    <div id="app-shell" className="relative min-h-screen overflow-hidden">
      <ArcadeBackground showGrid={view !== 'interview'} />
      <CursorFx />
      <LanguageSwitcher showLanguages={view !== 'language'} />

      <AnimatePresence mode="wait">
        <motion.main key={view} className="relative min-h-screen" {...viewMotion}>
          {view === 'language' ? (
            <LanguageIntroScreen onConfirm={handleConfirmLanguage} />
          ) : null}
          {view === 'loading' ? <LoadingScreen onStart={handleStart} /> : null}
          {view === 'door' ? <DoorScene onEnter={handleEnter} /> : null}
          {view === 'interview' ? <Interview /> : null}
          {!prefersReducedMotion && view !== 'language' ? <PixelWipe /> : null}
        </motion.main>
      </AnimatePresence>

      {/* Tutorial overlay shown once on first entry; dismissed by the visitor.
          Portaled to <body> so screen shake / view transforms never affect it. */}
      {createPortal(
        <AnimatePresence>
          {view === 'interview' && showTutorial ? (
            <motion.div
              key="tutorial-modal"
              className="fixed inset-0 z-[80] flex items-center justify-center bg-abyss/80 px-4 backdrop-blur-md"
              initial={prefersReducedMotion ? undefined : { opacity: 0 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="tutorial-title"
                className="relative w-full max-w-2xl overflow-hidden rounded-3xl border-2 border-neonCyan bg-panel p-6 text-center shadow-neon md:p-8"
                initial={
                  prefersReducedMotion ? undefined : { opacity: 0, scale: 0.7, y: 40 }
                }
                animate={
                  prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }
                }
                exit={
                  prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9, y: 20 }
                }
                transition={{
                  type: 'spring',
                  stiffness: 240,
                  damping: 20,
                  delay: prefersReducedMotion ? 0 : 0.6,
                }}
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1.5 animate-shimmer bg-[linear-gradient(90deg,#22e4ff,#9b5cff,#ff3ea5,#ffd23f,#22e4ff)] bg-[length:200%_100%] motion-reduce:animate-none"
                />
                <h2
                  id="tutorial-title"
                  className="text-gradient font-pixel text-base sm:text-lg"
                >
                  {tutorial.title}
                </h2>

                <ol className="mt-8 grid gap-4 sm:grid-cols-3">
                  {tutorial.steps.map((step, index) => (
                    <motion.li
                      key={step.text}
                      className="relative flex flex-col items-center gap-3 rounded-2xl border-2 border-line bg-abyss/70 px-4 py-6"
                      initial={
                        prefersReducedMotion
                          ? undefined
                          : {
                              opacity: 0,
                              y: 30,
                              rotate: index === 1 ? 0 : index === 0 ? -6 : 6,
                            }
                      }
                      animate={
                        prefersReducedMotion ? undefined : { opacity: 1, y: 0, rotate: 0 }
                      }
                      transition={{
                        type: 'spring',
                        stiffness: 260,
                        damping: 16,
                        delay: prefersReducedMotion ? 0 : 0.8 + index * 0.15,
                      }}
                    >
                      <span className="absolute -left-2 -top-3 flex h-7 w-7 items-center justify-center rounded-lg bg-neonPink font-pixel text-[10px] text-ink shadow-pixel-sm">
                        {index + 1}
                      </span>
                      <motion.span
                        className="text-5xl"
                        aria-hidden
                        animate={prefersReducedMotion ? undefined : { y: [0, -8, 0] }}
                        transition={{
                          duration: 1.6,
                          repeat: Infinity,
                          delay: index * 0.25,
                        }}
                      >
                        {step.icon}
                      </motion.span>
                      <span className="text-base font-semibold text-ink">
                        {step.text}
                      </span>
                    </motion.li>
                  ))}
                </ol>

                <button
                  ref={tutorialButtonRef}
                  type="button"
                  onClick={closeTutorial}
                  className="btn-arcade mt-8 bg-coin px-10 py-4 text-xs"
                >
                  {tutorial.close} ▶
                </button>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}

export default InterviewExperience
