import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

import { DoorScene } from './components/DoorScene'
import { Interview } from './components/Interview'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { LoadingScreen } from './components/LoadingScreen'

type ViewKey = 'loading' | 'door' | 'interview'

const LOADING_TITLES = ['loading.', 'loading..', 'loading...']

export function App() {
  const prefersReducedMotion = useReducedMotion()
  const [view, setView] = useState<ViewKey>('loading')
  const [loadingTitleIndex, setLoadingTitleIndex] = useState(0)

  useEffect(() => {
    if (view === 'loading') {
      document.title = LOADING_TITLES[loadingTitleIndex]
      return
    }

    if (view === 'door') {
      document.title = 'Luis quiere entrar!'
      return
    }

    if (view === 'interview') {
      document.title = 'Entrevista con Luis Angel Da Silva'
    }
  }, [view, loadingTitleIndex])

  useEffect(() => {
    if (view !== 'loading') {
      setLoadingTitleIndex(0)
      return
    }

    const intervalId = window.setInterval(() => {
      setLoadingTitleIndex((prev) => (prev + 1) % LOADING_TITLES.length)
    }, 2000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [view])

  const handleStart = () => setView('door')
  const handleEnter = () => setView('interview')

  return (
    <div className="relative min-h-screen overflow-hidden">
      <LanguageSwitcher />
      <AnimatePresence mode="wait">
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
