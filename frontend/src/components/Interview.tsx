import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { track } from '../lib/analytics'
import { useT } from '../hooks/useT'
import { SuggestionPrompt } from './SuggestionPrompt'
import type { QuestionGroupKey, QuestionKey } from '../i18n/dict'
import { dict } from '../i18n/dict'
import { trackAnalyticsEvent, trackQuestionClick } from '../services/publicApi'

const questionGroupConfig: Record<QuestionGroupKey, { emoji: string; questions: QuestionKey[] }> = {
  aboutYou: {
    emoji: '🧑',
    questions: ['introduction', 'languageIdentity', 'videogame'],
  },
  motivations: {
    emoji: '🎉',
    questions: ['motivation', 'hobbies', 'superpower', 'dailyMotivation', 'advicePast'],
  },
  experience: {
    emoji: '🛠️',
    questions: ['learning', 'projects', 'futureProjects', 'aiWork'],
  },
  workStyle: {
    emoji: '🤝',
    questions: ['teamwork', 'workValues', 'problemSolving'],
  },
  contactPortfolio: {
    emoji: '📬',
    questions: ['contact', 'github', 'cv'],
  },
}

const questionEmojis: Record<QuestionKey, string> = {
  introduction: '🙋‍♂️',
  motivation: '💡',
  learning: '📚',
  projects: '🛠️',
  contact: '📬',
  hobbies: '🎨',
  superpower: '🦸‍♂️',
  languageIdentity: '💻',
  aiWork: '🤖',
  futureProjects: '🚀',
  teamwork: '🤝',
  workValues: '🎯',
  problemSolving: '🧩',
  dailyMotivation: '🌅',
  videogame: '🎮',
  advicePast: '🕰️',
  github: '🐙',
  cv: '📄',
}

const questionToGroupMap = Object.entries(questionGroupConfig).reduce(
  (acc, [groupKey, value]) => {
    value.questions.forEach((questionKey) => {
      acc[questionKey] = groupKey as QuestionGroupKey
    })
    return acc
  },
  {} as Record<QuestionKey, QuestionGroupKey>,
)

const GITHUB_URL = 'https://github.com/luigikings'
const CV_URL = '/CV%20Luis%20Angel%20Da%20Silva%20English.pdf'
const CV_DOWNLOAD_NAME = 'CV Luis Angel Da Silva English.pdf'

export function Interview() {
  const { t, lang } = useT()
  const prefersReducedMotion = useReducedMotion()
  const questions = t<
    Record<QuestionKey, { label: string; playerLine: string }>
  >('interview.questions')
  const categories = t<Record<QuestionGroupKey, string>>('interview.categories')
  const answers = t<Record<QuestionKey, string>>('interview.answers')
  const repeatPrompt = t<string>('interview.repeatPrompt')
  const conversation = t<{
    youLabel: string
    characterLabel: string
    okButton: string
    githubButton: string
    cvButton: string
  }>('interview.conversation')
  const groupPrompt = t<string>('interview.groupPrompt')
  const selectPrompt = t<string>('interview.selectPrompt')
  const backToCategories = t<string>('interview.backToCategories')
  const groupEntries = useMemo(
    () =>
      (Object.entries(questionGroupConfig) as [
        QuestionGroupKey,
        { emoji: string; questions: QuestionKey[] },
      ][]).map(([key, value]) => ({
        key,
        emoji: value.emoji,
        label: categories[key],
        questionKeys: value.questions,
      })),
    [categories],
  )
  const [selectedGroup, setSelectedGroup] = useState<QuestionGroupKey | null>(null)
  const [selected, setSelected] = useState<QuestionKey | null>(null)
  const [stage, setStage] = useState<'idle' | 'playerTyping' | 'answerTyping' | 'complete'>(
    'idle',
  )
  const [playerLine, setPlayerLine] = useState('')
  const [answerLine, setAnswerLine] = useState('')
  const [showOk, setShowOk] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState<QuestionKey[]>([])
  const [isTalkingFrame, setIsTalkingFrame] = useState(false)
  const typingInterval = useRef<number | null>(null)
  const typingTimeout = useRef<number | null>(null)
  const talkingInterval = useRef<number | null>(null)
  const isConversationActive = selected !== null

  const clearTalkingInterval = useCallback(() => {
    if (talkingInterval.current !== null) {
      window.clearInterval(talkingInterval.current)
      talkingInterval.current = null
    }
  }, [])

  const clearTimers = useCallback(() => {
    if (typingInterval.current !== null) {
      window.clearInterval(typingInterval.current)
      typingInterval.current = null
    }
    if (typingTimeout.current !== null) {
      window.clearTimeout(typingTimeout.current)
      typingTimeout.current = null
    }
    clearTalkingInterval()
  }, [clearTalkingInterval])

  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [clearTimers])

  const handleGroupSelect = (group: QuestionGroupKey) => {
    if (isConversationActive) {
      return
    }
    setSelectedGroup(group)
    track('interview_group_selected', { group, lang })
  }

  const handleSelect = (key: QuestionKey) => {
    if (isConversationActive) {
      return
    }
    setSelected(key)
    track('interview_question_selected', { key, lang })

    const groupKey = questionToGroupMap[key]
    const canonicalText = dict.es.interview.questions[key]?.label ?? questions[key].label
    const canonicalCategory = groupKey
      ? dict.es.interview.categories[groupKey]
      : 'general'

    void trackQuestionClick({
      key,
      text: canonicalText,
      category: canonicalCategory,
    }).catch((error) => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('Failed to track question click', error)
      }
    })
  }

  const handleBackToGroups = () => {
    if (isConversationActive) {
      return
    }
    setSelectedGroup(null)
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
    const emoji = questionEmojis[selected]
    const playerMessageWithEmoji = emoji ? `${emoji} ${playerMessage}` : playerMessage
    const answerMessage = answers[selected]

    clearTimers()
    setStage('playerTyping')
    setPlayerLine('')
    setAnswerLine('')
    setShowOk(false)

    if (prefersReducedMotion) {
      setPlayerLine(playerMessageWithEmoji)
      setAnswerLine(answerMessage)
      setStage('complete')
      setShowOk(true)
      return
    }

    let playerIndex = 0
    const messageToType = playerMessageWithEmoji
    typingInterval.current = window.setInterval(() => {
      playerIndex += 1
      setPlayerLine(messageToType.slice(0, playerIndex))

      if (playerIndex >= messageToType.length && typingInterval.current !== null) {
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
  }, [answers, clearTimers, prefersReducedMotion, questions, selected])

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
  }, [answers, clearTimers, selected, stage])

  useEffect(() => {
    if (prefersReducedMotion) {
      clearTalkingInterval()
      setIsTalkingFrame(false)
      return
    }

    if (stage === 'answerTyping') {
      clearTalkingInterval()
      setIsTalkingFrame(true)
      talkingInterval.current = window.setInterval(() => {
        setIsTalkingFrame((prev) => !prev)
      }, 220)
    } else {
      clearTalkingInterval()
      setIsTalkingFrame(false)
    }

    return () => {
      clearTalkingInterval()
    }
  }, [clearTalkingInterval, prefersReducedMotion, stage])

  const handleOk = () => {
    if (selected) {
      setAnsweredQuestions((prev) =>
        prev.includes(selected) ? prev : [...prev, selected],
      )
    }
    clearTimers()
    setSelected(null)
    setStage('idle')
    setPlayerLine('')
    setAnswerLine('')
    setShowOk(false)
  }

  const handleGithubRedirect = () => {
    void trackAnalyticsEvent('github_visit').catch((error) => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('Failed to track analytics event', error)
      }
    })
    if (typeof window !== 'undefined') {
      window.open(GITHUB_URL, '_blank', 'noopener,noreferrer')
    }
    handleOk()
  }

  const handleCvDownload = () => {
    void trackAnalyticsEvent('cv_download').catch((error) => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('Failed to track analytics event', error)
      }
    })
    if (typeof document !== 'undefined') {
      const link = document.createElement('a')
      link.href = CV_URL
      link.download = CV_DOWNLOAD_NAME
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    handleOk()
  }

  const selectedGroupData = useMemo(
    () =>
      selectedGroup
        ? groupEntries.find((group) => group.key === selectedGroup) ?? null
        : null,
    [groupEntries, selectedGroup],
  )

  const isShowingCategories = !isConversationActive && selectedGroup === null
  const isShowingQuestions = !isConversationActive && selectedGroupData !== null

  return (
    <section className="relative flex min-h-screen flex-col gap-8 px-4 py-10 md:px-12">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative flex flex-col items-center">
          <motion.div
            className="relative flex h-56 w-56 items-center justify-center rounded-pixel border-4 border-slate-700 bg-slate-900 shadow-pixel md:h-64 md:w-64"
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          >
            <div className="absolute inset-[8%] flex items-center justify-center overflow-hidden rounded-[22px] border-4 border-slate-800 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950">
              <img
                src={
                  stage === 'answerTyping' && !prefersReducedMotion && isTalkingFrame
                    ? '/imgs/main_caracter/LK_hablando1.png'
                    : '/imgs/main_caracter/LK_defrente.png'
                }
                alt={t('interview.avatarAlt')}
                className="h-full w-full object-contain"
              />
            </div>
          </motion.div>

          <AnimatePresence mode="popLayout">
            {answerLine || stage === 'answerTyping' || stage === 'complete' ? (
              <motion.div
                key="answer-line"
                initial={
                  prefersReducedMotion
                    ? undefined
                    : { opacity: 0 }
                }
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { opacity: 1 }
                }
                exit={
                  prefersReducedMotion
                    ? undefined
                    : { opacity: 0 }
                }
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="mt-4 flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-slate-700/70 bg-slate-800/90 p-4 text-left text-sm text-slate-100 shadow-inner md:absolute md:left-full md:top-1/2 md:mt-0 md:ml-6 md:w-72 md:-translate-y-1/2 md:transform md:text-left md:shadow-xl"
              >
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                  {conversation.characterLabel}
                </p>
                <p className="leading-relaxed">{answerLine}</p>
                <AnimatePresence>
                  {showOk ? (
                    <motion.div
                      key="answer-actions"
                      initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
                      animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
                      className="flex flex-wrap justify-end gap-2"
                    >
                      {selected === 'github' ? (
                        <motion.button
                          type="button"
                          onClick={handleGithubRedirect}
                          className="rounded-full bg-highlight px-4 py-1 font-pixel text-[10px] uppercase tracking-[0.35em] text-charcoal shadow-sm transition-colors hover:bg-highlight/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
                          whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                        >
                          {conversation.githubButton}
                        </motion.button>
                      ) : null}
                      {selected === 'cv' ? (
                        <motion.button
                          type="button"
                          onClick={handleCvDownload}
                          className="rounded-full bg-highlight px-4 py-1 font-pixel text-[10px] uppercase tracking-[0.35em] text-charcoal shadow-sm transition-colors hover:bg-highlight/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
                          whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                        >
                          {conversation.cvButton}
                        </motion.button>
                      ) : null}
                      <motion.button
                        type="button"
                        onClick={handleOk}
                        className="rounded-full bg-white px-4 py-1 font-pixel text-[10px] uppercase tracking-[0.35em] text-slate-900 shadow-sm transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
                        whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                      >
                        {conversation.okButton}
                      </motion.button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            {playerLine ? (
              <motion.div
                key="player-line"
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="mt-6 w-full max-w-md rounded-2xl border border-highlight/60 bg-highlight/15 px-6 py-4 text-center text-sm text-highlight shadow-pixel"
              >
                <p className="mb-1 text-[11px] uppercase tracking-[0.3em] text-highlight/70">
                  {conversation.youLabel}
                </p>
                <p>{playerLine}</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
        <div className="space-y-3">
          <h1 className="font-pixel text-lg uppercase tracking-[0.5em] text-highlight">
            {t('interview.title')}
          </h1>
          <p className="mx-auto max-w-xl text-sm text-slate-300">{t('interview.subtitle')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <AnimatePresence mode="wait">
          {isShowingCategories ? (
            <motion.div
              key="group-prompt"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 15 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <p className="text-center text-sm text-slate-300">{groupPrompt}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isShowingQuestions ? (
            <motion.div
              key="question-prompt"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 15 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <p className="text-sm text-slate-300">{selectPrompt}</p>
              {selectedGroupData ? (
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span className="rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1 font-pixel text-[10px] text-slate-300">
                    {`${selectedGroupData.emoji} ${selectedGroupData.label}`}
                  </span>
                  <button
                    type="button"
                    onClick={handleBackToGroups}
                    className="rounded-full border border-slate-700/60 bg-slate-900/40 px-3 py-1 font-pixel text-[10px] uppercase tracking-[0.3em] text-slate-400 transition-colors hover:border-highlight/40 hover:text-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                  >
                    {backToCategories}
                  </button>
                </div>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {isShowingCategories ? (
            <motion.div
              key="groups"
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:flex lg:flex-wrap lg:justify-center"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 15 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {groupEntries.map((group, index) => {
                const groupQuestions = group.questionKeys
                const answeredCount = groupQuestions.filter((key) =>
                  answeredQuestions.includes(key),
                ).length
                const allAnswered = answeredCount === groupQuestions.length
                const baseClasses =
                  'group relative flex flex-col gap-3 overflow-hidden rounded-pixel border px-5 py-5 text-left text-sm uppercase tracking-[0.2em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal'
                const stateClasses = allAnswered
                  ? 'border-slate-800 bg-slate-900/40 text-slate-500 opacity-80 hover:border-highlight/40 hover:text-highlight'
                  : 'border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800/70'

                return (
                  <motion.button
                    key={group.key}
                    type="button"
                    onClick={() => handleGroupSelect(group.key)}
                    className={`${baseClasses} ${stateClasses} lg:basis-[calc(33.333%_-_12px)] lg:max-w-[calc(33.333%_-_12px)] lg:flex-none`}
                    initial={prefersReducedMotion ? undefined : { opacity: 0, y: 15 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : 0.05 * index }}
                    aria-pressed={selectedGroup === group.key}
                  >
                    <span className="text-lg text-highlight">{`${group.emoji} ${group.label}`}</span>
                    <span className="text-[10px] font-pixel uppercase tracking-[0.35em] text-slate-400">
                      {`${answeredCount}/${groupQuestions.length}`}
                    </span>
                  </motion.button>
                )
              })}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {isShowingQuestions && selectedGroupData ? (
            <motion.div
              key="questions"
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 15 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {selectedGroupData.questionKeys.map((key, index) => {
                const question = questions[key]
                const isAnswered = answeredQuestions.includes(key)
                const isActive = selected === key
                const emoji = questionEmojis[key]
                const labelWithEmoji = emoji ? `${emoji} ${question.label}` : question.label
                const baseClasses =
                  'group relative overflow-hidden rounded-pixel border px-4 py-4 text-left text-sm uppercase tracking-[0.2em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal'
                const stateClasses = isActive
                  ? 'border-highlight bg-highlight/25 text-highlight shadow-pixel'
                  : isAnswered
                    ? 'border-slate-800 bg-slate-900/40 text-slate-500 opacity-60 hover:border-highlight/40 hover:bg-slate-800/60 hover:text-slate-300 hover:opacity-90'
                    : 'border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800/70'

                return (
                  <motion.button
                    key={key}
                    type="button"
                    onClick={() => handleSelect(key)}
                    className={`${baseClasses} ${stateClasses}`}
                    initial={prefersReducedMotion ? undefined : { opacity: 0, y: 15 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : 0.05 * index }}
                    aria-pressed={isActive}
                  >
                    <span
                      className={`block transition-opacity duration-200 ${
                        isAnswered ? 'group-hover:opacity-0' : ''
                      }`}
                    >
                      {labelWithEmoji}
                    </span>
                    {isAnswered ? (
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-pixel text-[10px] uppercase tracking-[0.3em] text-slate-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        {repeatPrompt}
                      </span>
                    ) : null}
                  </motion.button>
                )
              })}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <SuggestionPrompt />

      <footer className="mt-auto text-center text-xs text-slate-500">
        {t('footer.text')}
      </footer>
    </section>
  )
}
