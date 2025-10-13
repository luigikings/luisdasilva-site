import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

import { DoorScene } from './components/DoorScene'
import { Interview } from './components/Interview'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { LanguageIntroScreen } from './components/LanguageIntroScreen'
import { LoadingScreen } from './components/LoadingScreen'
import { dict } from './i18n/dict'
import { useT } from './hooks/useT'

type ViewKey = 'language' | 'loading' | 'door' | 'interview'

export function App() {
  const prefersReducedMotion = useReducedMotion()
  const { lang } = useT()
  const [view, setView] = useState<ViewKey>('language')
  const [loadingTitleIndex, setLoadingTitleIndex] = useState(0)

  const loadingTitles = useMemo(() => dict[lang].meta.loadingTitles, [lang])

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
  const handleEnter = () => setView('interview')

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
            className="min-h-screen"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <Interview />
          </motion.main>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
export default App
