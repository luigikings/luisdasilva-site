import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

import { DoorScene } from '../components/DoorScene'
import { Interview } from '../components/Interview'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { LanguageIntroScreen } from '../components/LanguageIntroScreen'
import { LoadingScreen } from '../components/LoadingScreen'
import { dict } from '../i18n/dict'
import { useT } from '../hooks/useT'

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
          >
            <LoadingScreen onStart={handleStart} />
          </motion.main>
        ) : null}
        {view === 'door' ? (
          <motion.main
            key="door"
            className="min-h-screen"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <DoorScene onEnter={handleEnter} />
          </motion.main>
        ) : null}
        {view === 'interview' ? (
          <motion.main
            key="interview"
            className="relative min-h-screen"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <Interview />
            <AnimatePresence>
              {showTutorial ? (
                <motion.div
                  key="tutorial-modal"
                  className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur"
                  initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                >
                  <motion.div
                    className="w-full max-w-2xl rounded-3xl border border-slate-700/70 bg-slate-900/90 p-6 text-left shadow-2xl md:p-8"
                    initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <div className="flex flex-col gap-4">
                      <h2 className="font-pixel text-lg uppercase tracking-[0.4em] text-highlight">
                        {tutorial.title}
                      </h2>
                      <p className="text-sm leading-relaxed text-slate-200">{tutorial.body}</p>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowTutorial(false)}
                          className="rounded-full bg-highlight px-5 py-2 font-pixel text-[10px] uppercase tracking-[0.35em] text-charcoal shadow-sm transition-colors hover:bg-highlight/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
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
