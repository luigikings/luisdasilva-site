import { useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  GITHUB_URL,
  CV_URL,
  CV_DOWNLOAD_NAME,
  initialCoinsByGroup,
  questionCosts,
  questionGroupConfig,
  questionToGroupMap,
  questionEmojis,
} from '../data/interview'
import { track } from '../lib/analytics'
import { useT } from '../hooks/useT'
import { ConversationPanel } from './interview/ConversationPanel'
import { CoinBar } from './interview/CoinBar'
import { InterviewNav } from './interview/InterviewNav'
import { SuggestionPrompt } from './SuggestionPrompt'
import type { QuestionGroupKey, QuestionKey } from '../i18n/dict'

/**
 * The main interview component.
 *
 * Navigation flow:
 *   1. Visitor sees category (group) buttons
 *   2. Selects a group → question buttons for that group appear
 *   3. Selects a question → conversation begins (playerTyping → answerTyping → complete)
 *   4. Visitor clicks OK → returns to question list for the same group
 *
 * Coin system:
 *   Each group starts with a fixed coin budget. Selecting an unanswered question
 *   that costs > 0 deducts one coin from that group's pool. Already-answered
 *   questions and the `github` question (cost 0) are always re-askable for free.
 *   An "infinite coins" toggle bypasses the system entirely.
 *
 * Typing animation:
 *   Player line types at 32 ms/char; after a 280 ms pause the answer types at 26 ms/char.
 *   Under `prefers-reduced-motion` all text appears instantly.
 */
export function Interview() {
  const { t, lang } = useT()
  const prefersReducedMotion = useReducedMotion()
  const questions = t<Record<QuestionKey, { label: string; playerLine: string }>>('interview.questions')
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
  const coinsCopy = t<{
    remaining: string
    unavailable: string
    cost: string
    unlimited: string
    toggle: string
  }>('interview.coins')

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
  // Conversation stage machine: idle → playerTyping → answerTyping → complete
  const [stage, setStage] = useState<'idle' | 'playerTyping' | 'answerTyping' | 'complete'>('idle')
  const [playerLine, setPlayerLine] = useState('')
  const [answerLine, setAnswerLine] = useState('')
  const [showOk, setShowOk] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState<QuestionKey[]>([])
  // Controls the character sprite: alternates between still and talking frames
  const [isTalkingFrame, setIsTalkingFrame] = useState(false)
  const [groupCoins, setGroupCoins] = useState<Record<QuestionGroupKey, number>>(initialCoinsByGroup)
  const [coinWarningGroup, setCoinWarningGroup] = useState<QuestionGroupKey | null>(null)
  const [infiniteCoins, setInfiniteCoins] = useState(false)

  const typingInterval = useRef<number | null>(null)
  const typingTimeout = useRef<number | null>(null)
  const talkingInterval = useRef<number | null>(null)
  const coinWarningTimeout = useRef<number | null>(null)

  // A conversation is "active" whenever a question is selected (even if still typing)
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

  const clearCoinWarningTimer = useCallback(() => {
    if (coinWarningTimeout.current !== null) {
      window.clearTimeout(coinWarningTimeout.current)
      coinWarningTimeout.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearTimers()
      clearCoinWarningTimer()
    }
  }, [clearCoinWarningTimer, clearTimers])

  const handleGroupSelect = (group: QuestionGroupKey) => {
    if (isConversationActive) return
    setSelectedGroup(group)
    track('interview_group_selected', { group, lang })
  }

  const handleSelect = (key: QuestionKey) => {
    if (isConversationActive) return
    const groupKey = questionToGroupMap[key]
    const baseCost = questionCosts[key] ?? 1
    const isRepeat = answeredQuestions.includes(key)
    const currentCoins = groupKey ? groupCoins[groupKey] ?? 0 : 0
    // Only charge coins for first-time non-free questions when infinite mode is off
    const shouldCharge = !infiniteCoins && !isRepeat && baseCost > 0

    if (shouldCharge && currentCoins < baseCost) {
      // Flash a warning on the group badge instead of silently ignoring the click
      if (groupKey) {
        setCoinWarningGroup(groupKey)
        clearCoinWarningTimer()
        coinWarningTimeout.current = window.setTimeout(() => {
          setCoinWarningGroup(null)
        }, 2200)
      }
      return
    }

    if (shouldCharge && groupKey) {
      setGroupCoins((prev) => ({
        ...prev,
        [groupKey]: Math.max((prev[groupKey] ?? 0) - baseCost, 0),
      }))
    }

    setSelected(key)
    track('interview_question_selected', { key, lang })
  }

  const handleBackToGroups = () => {
    if (isConversationActive) return
    setSelectedGroup(null)
  }

  // Kicks off the player-typing animation when a question is selected
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

        // Brief pause between player line finishing and answer starting
        typingTimeout.current = window.setTimeout(() => {
          setStage('answerTyping')
        }, 280)
      }
    }, 32)

    return () => {
      clearTimers()
    }
  }, [answers, clearTimers, prefersReducedMotion, questions, selected])

  // Runs the answer-typing animation once the stage advances to answerTyping
  useEffect(() => {
    if (stage !== 'answerTyping' || !selected) return

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

  // Flips the character sprite between still/talking at 220 ms while answer is typing
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

  /** Marks the question as answered and resets conversation state back to idle. */
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
    if (typeof window !== 'undefined') {
      window.open(GITHUB_URL, '_blank', 'noopener,noreferrer')
    }
    handleOk()
  }

  /** Programmatically creates a hidden <a> to trigger the browser's download dialog. */
  const handleCvDownload = () => {
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
    () => selectedGroup ? groupEntries.find((group) => group.key === selectedGroup) ?? null : null,
    [groupEntries, selectedGroup],
  )

  const isShowingCategories = !isConversationActive && selectedGroup === null
  const isShowingQuestions = !isConversationActive && selectedGroupData !== null

  return (
    <section className="relative flex min-h-screen flex-col gap-8 px-4 py-10 md:px-12">
      <div className="flex flex-col items-center gap-6 text-center">
        <ConversationPanel
          stage={stage}
          isTalkingFrame={isTalkingFrame}
          prefersReducedMotion={prefersReducedMotion}
          avatarAlt={t('interview.avatarAlt')}
          answerLine={answerLine}
          playerLine={playerLine}
          showOk={showOk}
          selected={selected}
          conversation={conversation}
          onOk={handleOk}
          onGithub={handleGithubRedirect}
          onCv={handleCvDownload}
        />
        <div className="space-y-3">
          <h1 className="font-pixel text-lg uppercase tracking-[0.5em] text-highlight">
            {t('interview.title')}
          </h1>
          <p className="mx-auto max-w-xl text-sm text-slate-300">{t('interview.subtitle')}</p>
        </div>
        <CoinBar
          infiniteCoins={infiniteCoins}
          onToggle={() => setInfiniteCoins((prev) => !prev)}
          coinsCopy={coinsCopy}
        />
      </div>

      <InterviewNav
        isShowingCategories={isShowingCategories}
        isShowingQuestions={isShowingQuestions}
        selectedGroup={selectedGroup}
        selectedGroupData={selectedGroupData}
        groupEntries={groupEntries}
        questions={questions}
        answeredQuestions={answeredQuestions}
        selected={selected}
        groupCoins={groupCoins}
        infiniteCoins={infiniteCoins}
        coinWarningGroup={coinWarningGroup}
        prefersReducedMotion={prefersReducedMotion}
        coinsCopy={coinsCopy}
        repeatPrompt={repeatPrompt}
        groupPrompt={groupPrompt}
        selectPrompt={selectPrompt}
        backToCategories={backToCategories}
        onGroupSelect={handleGroupSelect}
        onBackToGroups={handleBackToGroups}
        onSelect={handleSelect}
      />

      <SuggestionPrompt />

      <footer className="mt-auto text-center text-xs text-slate-500">
        {t('footer.text')}
      </footer>
    </section>
  )
}
