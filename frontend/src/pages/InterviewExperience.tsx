import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

import { DoorScene } from '../components/DoorScene'
import { Interview } from '../components/Interview'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { LanguageIntroScreen } from '../components/LanguageIntroScreen'
import { LoadingScreen } from '../components/LoadingScreen'
import { dict } from '../i18n/dict'
import { useT } from '../hooks/useT'
import { notifyDoorEntry } from '../lib/api'

/**
 * Top-level view controller for the entire interview experience.
 *
 * View state machine:
 *   language → loading → door → interview
 *
 * Each view fills the full viewport and transitions via AnimatePresence (mode="wait"),
 * so only one view is mounted at a time. The LanguageSwitcher is hidden on the
 * language-selection screen because there the user hasn't committed to a language yet.
 */
type ViewKey = 'language' | 'loading' | 'door' | 'interview'

export function InterviewExperience() {
  const prefersReducedMotion = useReducedMotion()
  const { lang, t } = useT()
  const [view, setView] = useState<ViewKey>('language')
  const [loadingTitleIndex, setLoadingTitleIndex] = useState(0)
  const [showTutorial, setShowTutorial] = useState(false)

  const loadingTitles = useMemo(() => dict[lang].meta.loadingTitles, [lang])
  const tutorial = t<{
    title: string
    body: string
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

  return (
    <div className="relative min-h-screen overflow-hidden">
      {view !== 'language' ? <LanguageSwitcher /> : null}
      <AnimatePresence mode="wait">
        {view === 'language' ? (
          <motion.main
            key="language"
            className="min-h-screen"
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <LanguageIntroScreen onConfirm={handleConfirmLanguage} />
          </motion.main>
        ) : null}
        {view === 'loading' ? (
          <motion.main
            key="loading"
            className="min-h-screen"
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <LoadingScreen onStart={handleStart} />
          </motion.main>
        ) : null}
        {view === 'door' ? (
          <motion.main
            key="door"
            className="min-h-screen"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <DoorScene onEnter={handleEnter} />
          </motion.main>
        ) : null}
        {view === 'interview' ? (
          <motion.main
            key="interview"
            className="relative min-h-screen"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Interview />
            {/* Tutorial overlay shown once on first entry; dismissed by the visitor */}
            <AnimatePresence>
              {showTutorial ? (
                <motion.div
                  key="tutorial-modal"
                  className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a160a]/50 px-4 backdrop-blur"
                  initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <motion.div
                    className="w-full max-w-2xl rounded-3xl border border-[#d8c39a] bg-cream p-6 text-left shadow-2xl md:p-8"
                    initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    <div className="flex flex-col gap-4">
                      <h2 className="font-sans text-lg font-bold tracking-wide text-charcoal">
                        {tutorial.title}
                      </h2>
                      <p className="text-sm leading-relaxed text-charcoal/80">{tutorial.body}</p>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowTutorial(false)}
                          className="rounded-full bg-highlight px-5 py-2 font-sans text-[10px] font-semibold uppercase tracking-wide text-charcoal shadow-sm transition-colors hover:bg-highlight/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                        >
                          {tutorial.close}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.main>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default InterviewExperience
