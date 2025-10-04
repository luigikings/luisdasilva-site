import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'

import { track } from '../lib/analytics'
import { ContactForm } from './ContactForm'
import { useT } from '../hooks/useT'
import type { QuestionKey } from '../i18n/dict'

type InterviewProps = {
  onBack: () => void
}

export function Interview({ onBack }: InterviewProps) {
  const { t, lang } = useT()
  const prefersReducedMotion = useReducedMotion()
  const questions = t<
    Record<QuestionKey, { label: string; playerLine: string }>
  >('interview.questions')
  const answers = t<Record<QuestionKey, string>>('interview.answers')
  const conversation = t<{
    youLabel: string
    characterLabel: string
    okButton: string
  }>('interview.conversation')
  const questionEntries = useMemo(
    () => Object.entries(questions) as [QuestionKey, { label: string; playerLine: string }][],
    [questions],
  )
  const [selected, setSelected] = useState<QuestionKey | null>(null)
  const [stage, setStage] = useState<'idle' | 'playerTyping' | 'answerTyping' | 'complete'>(
    'idle',
  )
  const [playerLine, setPlayerLine] = useState('')
  const [answerLine, setAnswerLine] = useState('')
  const [showOk, setShowOk] = useState(false)
  const typingInterval = useRef<number | null>(null)
  const typingTimeout = useRef<number | null>(null)

  const clearTimers = () => {
    if (typingInterval.current !== null) {
      window.clearInterval(typingInterval.current)
      typingInterval.current = null
    }
    if (typingTimeout.current !== null) {
      window.clearTimeout(typingTimeout.current)
      typingTimeout.current = null
    }
  }

  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [])

  const handleSelect = (key: QuestionKey) => {
    setSelected(key)
    track('interview_question_selected', { key, lang })
  }

  useEffect(() => {
    if (!selected) {
      clearTimers()
      setStage('idle')
      setPlayerLine('')
      setAnswerLine('')
      setShowOk(false)
      return
    }

    const playerMessage = questions[selected].playerLine
    const answerMessage = answers[selected]

    clearTimers()
    setStage('playerTyping')
    setPlayerLine('')
    setAnswerLine('')
    setShowOk(false)

    if (prefersReducedMotion) {
      setPlayerLine(playerMessage)
      setAnswerLine(answerMessage)
      setStage('complete')
      setShowOk(true)
      return
    }

    let playerIndex = 0
    typingInterval.current = window.setInterval(() => {
      playerIndex += 1
      setPlayerLine(playerMessage.slice(0, playerIndex))

      if (playerIndex >= playerMessage.length && typingInterval.current !== null) {
        window.clearInterval(typingInterval.current)
        typingInterval.current = null

        typingTimeout.current = window.setTimeout(() => {
          setStage('answerTyping')
        }, 280)
      }
    }, 32)

    return () => {
      clearTimers()
    }
  }, [answers, prefersReducedMotion, questions, selected])

  useEffect(() => {
    if (stage !== 'answerTyping' || !selected) {
      return
    }

    const answerMessage = answers[selected]
    let answerIndex = 0

    typingInterval.current = window.setInterval(() => {
      answerIndex += 1
      setAnswerLine(answerMessage.slice(0, answerIndex))

      if (answerIndex >= answerMessage.length && typingInterval.current !== null) {
        window.clearInterval(typingInterval.current)
        typingInterval.current = null

        typingTimeout.current = window.setTimeout(() => {
          setStage('complete')
          setShowOk(true)
        }, 180)
      }
    }, 26)

    return () => {
      clearTimers()
    }
  }, [answers, selected, stage])

  const handleOk = () => {
    clearTimers()
    setSelected(null)
    setStage('idle')
    setPlayerLine('')
    setAnswerLine('')
    setShowOk(false)
  }

  const isConversationActive = selected !== null

  return (
    <section className="relative flex min-h-screen flex-col gap-8 px-4 py-10 md:px-12">
      <button
        type="button"
        onClick={onBack}
        className="self-start rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs uppercase tracking-wide text-slate-200 hover:bg-slate-800"
      >
        {t('common.back')}
      </button>

      <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
        <motion.div
          role="img"
          aria-label={t('interview.avatarAlt')}
          className="relative h-48 w-48 rounded-pixel border-4 border-slate-700 bg-slate-900 shadow-pixel"
          initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        >
          <div className="absolute inset-[10%] rounded-[22px] border-4 border-slate-800 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="h-12 w-12 rounded-lg border-4 border-slate-900 bg-highlight" />
            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full bg-slate-200" />
              <span className="h-3 w-3 rounded-full bg-slate-200" />
            </div>
            <div className="h-1.5 w-16 rounded-full bg-slate-300" />
          </div>
        </motion.div>
        <div className="space-y-3 text-center md:text-left">
          <h1 className="font-pixel text-lg uppercase tracking-[0.5em] text-highlight">
            {t('interview.title')}
          </h1>
          <p className="max-w-xl text-sm text-slate-300">{t('interview.subtitle')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected ?? 'idle'}
            className="relative min-h-[260px] rounded-3xl border border-slate-700/70 bg-slate-900/70 p-6 shadow-inner"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 15 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {!isConversationActive ? (
              <p className="text-center text-sm text-slate-300">{t('interview.selectPrompt')}</p>
            ) : (
              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {playerLine ? (
                    <motion.div
                      key={`player-${playerLine}`}
                      initial={prefersReducedMotion ? undefined : { opacity: 0, x: 20 }}
                      animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="ml-auto max-w-xs rounded-2xl border border-highlight/60 bg-highlight/15 p-4 text-left text-sm text-highlight shadow-pixel"
                    >
                      <p className="mb-1 text-[11px] uppercase tracking-[0.3em] text-highlight/70">
                        {conversation.youLabel}
                      </p>
                      <p>{playerLine}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <AnimatePresence mode="popLayout">
                  {answerLine || stage === 'answerTyping' || stage === 'complete' ? (
                    <motion.div
                      key={`answer-${answerLine}`}
                      initial={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
                      animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="max-w-xl rounded-2xl border border-slate-700/70 bg-slate-800/80 p-4 text-left text-sm text-slate-100 shadow-inner"
                    >
                      <p className="mb-1 text-[11px] uppercase tracking-[0.3em] text-slate-400">
                        {conversation.characterLabel}
                      </p>
                      <p>{answerLine}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {showOk ? (
                  <motion.button
                    type="button"
                    onClick={handleOk}
                    className="mx-auto mt-2 rounded-pixel border border-highlight bg-highlight/10 px-6 py-2 font-pixel text-xs uppercase tracking-[0.4em] text-highlight shadow-pixel hover:bg-highlight/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                    initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                  >
                    {conversation.okButton}
                  </motion.button>
                ) : null}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {questionEntries.map(([key, value], index) => (
            <motion.button
              key={key}
              type="button"
              onClick={() => handleSelect(key)}
              className={`rounded-pixel border px-4 py-4 text-left text-sm uppercase tracking-[0.2em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal ${
                selected === key
                  ? 'border-highlight bg-highlight/25 text-highlight'
                  : isConversationActive
                    ? 'cursor-not-allowed border-slate-700/60 bg-slate-900/40 text-slate-500'
                    : 'border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800/70'
              }`}
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 15 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : 0.05 * index }}
              aria-pressed={selected === key}
              disabled={isConversationActive}
            >
              {value.label}
            </motion.button>
          ))}
        </div>
      </div>

      <ContactForm />

      <footer className="mt-auto text-center text-xs text-slate-500">
        {t('footer.text')}
      </footer>
    </section>
  )
}
