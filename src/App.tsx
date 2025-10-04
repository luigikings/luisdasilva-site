import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'

import { DoorScene } from './components/DoorScene'
import { Interview } from './components/Interview'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { LoadingScreen } from './components/LoadingScreen'

type ViewKey = 'loading' | 'door' | 'interview'

export function App() {
  const prefersReducedMotion = useReducedMotion()
  const [view, setView] = useState<ViewKey>('loading')

  const handleStart = () => setView('door')
  const handleEnter = () => setView('interview')
  const handleBack = () => setView('door')

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
            <Interview onBack={handleBack} />
          </motion.main>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
export default App
