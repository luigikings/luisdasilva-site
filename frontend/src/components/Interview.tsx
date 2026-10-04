import { useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  GITHUB_URL,
  CV_URL,
  CV_DOWNLOAD_NAME,
  groupTheme,
  initialCoinsByGroup,
  questionCosts,
  questionGroupConfig,
  questionToGroupMap,
  questionEmojis,
} from '../data/interview'
import { track } from '../lib/analytics'
import { useKonami } from '../hooks/useKonami'
import { useSound } from '../hooks/useSound'
import { useT } from '../hooks/useT'
import { centerOf, useFx } from './fx/FxProvider'
import { AchievementToasts, type Toast } from './interview/AchievementToasts'
import { ConversationPanel } from './interview/ConversationPanel'
import { HudBar } from './interview/HudBar'
import { InterviewNav } from './interview/InterviewNav'
import { SuggestionPrompt } from './SuggestionPrompt'
import type { AchievementKey, QuestionGroupKey, QuestionKey } from '../i18n/dict'

type Stage = 'idle' | 'playerTyping' | 'answerTyping' | 'complete'

const TOTAL_QUESTIONS = Object.values(questionGroupConfig).reduce((sum, group) => sum + group.questions.length, 0)
const DEFAULT_ACCENT = '#9b5cff'

/**
 * The main interview component.
 *
 * Navigation flow:
 *   1. Visitor sees the world (group) cards
 *   2. Selects a world → question cards for that world appear
 *   3. Selects a question → conversation begins (playerTyping → answerTyping → complete)
 *   4. Visitor clicks OK → returns to question list for the same world
 *
 * Coin system:
 *   Each world starts with a fixed coin budget. Selecting an unanswered question
 *   that costs > 0 deducts one coin from that world's pool (a coin flies from the
 *   HUD into the card). Already-answered questions and the `github` question
 *   (cost 0) are always re-askable for free. The "infinite coins" switch — or the
 *   Konami code — bypasses the system entirely.
 *
 * Typing animation:
 *   Player line types at 28 ms/char; after a 280 ms pause the answer types at 24 ms/char
 *   with 8-bit voice blips. Clicking the answer box (or Enter/Space) skips to the end.
 *   Under `prefers-reduced-motion` all text appears instantly.
 *
 * Achievements:
 *   Toasts + confetti for the first question, each cleared world, halfway, 100%,
 *   infinite mode and the Konami code.
 */
export function Interview() {
  const { t, lang } = useT()
  const { sfx } = useSound()
  const fx = useFx()
  const prefersReducedMotion = useReducedMotion()
  const questions = t<Record<QuestionKey, { label: string; playerLine: string }>>('interview.questions')
  const categories = t<Record<QuestionGroupKey, string>>('interview.categories')
  const answers = t<Record<QuestionKey, string>>('interview.answers')
  const achievementsCopy = t<Record<AchievementKey, { title: string; body: string }>>('interview.achievements')
  const conversation = t<{
    youLabel: string
    characterLabel: string
    okButton: string
    githubButton: string
    cvButton: string
    skipHint: string
  }>('interview.conversation')
  const coinsCopy = t<{
    remaining: string
    unavailable: string
    cost: string
    unlimited: string
    toggle: string
    noCoinsHint: string
    free: string
  }>('interview.coins')
  const hudCopy = t<{ player: string; progress: string; level: string; escHint: string }>('interview.hud')

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
  const [stage, setStage] = useState<Stage>('idle')
  const [playerLine, setPlayerLine] = useState('')
  const [answerLine, setAnswerLine] = useState('')
  const [showOk, setShowOk] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState<QuestionKey[]>([])
  // Controls the character sprite: alternates between still and talking frames
  const [isTalkingFrame, setIsTalkingFrame] = useState(false)
  const [groupCoins, setGroupCoins] = useState<Record<QuestionGroupKey, number>>(initialCoinsByGroup)
  const [coinWarningGroup, setCoinWarningGroup] = useState<QuestionGroupKey | null>(null)
  const [infiniteCoins, setInfiniteCoins] = useState(false)
  const [coinBump, setCoinBump] = useState(0)
  const [highlightToggle, setHighlightToggle] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const typingInterval = useRef<number | null>(null)
  const typingTimeout = useRef<number | null>(null)
  const talkingInterval = useRef<number | null>(null)
  const coinWarningTimeout = useRef<number | null>(null)
  const hudCoinRef = useRef<HTMLSpanElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const toastId = useRef(0)
  const unlocked = useRef(new Set<string>())
  // Guards against double-clicks while the coin animation plays before the conversation starts
  const pendingSelect = useRef(false)

  // A conversation is "active" whenever a question is selected (even if still typing)
  const isConversationActive = selected !== null
  const totalCoins = Object.values(groupCoins).reduce((sum, value) => sum + value, 0)
  const activeGroup = selected ? questionToGroupMap[selected] : selectedGroup
  const accent = activeGroup ? groupTheme[activeGroup].color : DEFAULT_ACCENT

  const pushToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = (toastId.current += 1)
    // Replace an identical toast instead of stacking duplicates (e.g. spamming a locked question)
    setToasts((prev) => [...prev.filter((item) => item.title !== toast.title).slice(-2), { ...toast, id }])
    window.setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 3400)
  }, [])

  /** Unlocks an achievement once; `instance` lets per-world achievements repeat per world */
  const unlock = useCallback(
    (key: AchievementKey, options: { icon: string; big?: boolean; instance?: string }) => {
      const id = options.instance ? `${key}:${options.instance}` : key
      if (unlocked.current.has(id)) return
      unlocked.current.add(id)
      sfx.achievement()
      pushToast({ ...achievementsCopy[key], icon: options.icon, tone: 'gold' })
      if (options.big) fx.confetti()
      track('interview_achievement', { key, lang })
    },
    [achievementsCopy, fx, lang, pushToast, sfx],
  )

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

  const enableInfinite = useCallback(() => {
    setInfiniteCoins(true)
    sfx.powerUp()
    fx.coinRain(70)
    unlock('infinite', { icon: '♾️' })
  }, [fx, sfx, unlock])

  const handleToggleInfinite = () => {
    if (infiniteCoins) {
      setInfiniteCoins(false)
      sfx.back()
      return
    }
    enableInfinite()
  }

  // Secret: ↑↑↓↓←→←→BA turns on infinite coins with a party
  useKonami(() => {
    setInfiniteCoins(true)
    sfx.achievement()
    fx.coinRain(120)
    fx.confetti()
    unlock('konami', { icon: '🕹️' })
  })

  const handleGroupSelect = (group: QuestionGroupKey) => {
    if (isConversationActive) return
    sfx.select()
    setSelectedGroup(group)
    track('interview_group_selected', { group, lang })
  }

  const handleSelect = (key: QuestionKey, origin: HTMLElement) => {
    if (isConversationActive || pendingSelect.current) return
    const groupKey = questionToGroupMap[key]
    const baseCost = questionCosts[key] ?? 1
    const isRepeat = answeredQuestions.includes(key)
    const currentCoins = groupKey ? groupCoins[groupKey] ?? 0 : 0
    // Only charge coins for first-time non-free questions when infinite mode is off
    const shouldCharge = !infiniteCoins && !isRepeat && baseCost > 0
    const originPoint = centerOf(origin)

    if (shouldCharge && currentCoins < baseCost) {
      // Loud "no coins" feedback instead of silently ignoring the click
      sfx.error()
      fx.shake()
      fx.flash('rgba(255,77,94,0.25)')
      fx.floatText(originPoint, '✕', '#ff4d5e')
      pushToast({ title: coinsCopy.unavailable, body: coinsCopy.noCoinsHint, icon: '🪙', tone: 'danger' })
      setHighlightToggle(true)
      window.setTimeout(() => setHighlightToggle(false), 2400)
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
      sfx.coin()
      const hudPoint = centerOf(hudCoinRef.current)
      fx.floatText(hudPoint, `-${baseCost}`, '#ffd23f')
      fx.flyCoin(hudPoint, originPoint, () => {
        fx.burst(originPoint, { count: 26, colors: ['#ffd23f', '#fff6c2', groupTheme[groupKey].color], speed: 7 })
      })
      setCoinBump((prev) => prev + 1)
      setGroupCoins((prev) => ({
        ...prev,
        [groupKey]: Math.max((prev[groupKey] ?? 0) - baseCost, 0),
      }))
    } else {
      sfx.select()
      fx.burst(originPoint, { count: 14, colors: groupKey ? [groupTheme[groupKey].color, '#ffffff'] : undefined, speed: 5 })
    }

    // Small delay so the coin can be seen leaving before the cards disappear
    pendingSelect.current = true
    window.setTimeout(() => {
      pendingSelect.current = false
      setSelected(key)
      stageRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })
    }, shouldCharge && !prefersReducedMotion ? 380 : 0)
    track('interview_question_selected', { key, lang })
  }

  const handleBackToGroups = useCallback(() => {
    if (isConversationActive) return
    sfx.back()
    setSelectedGroup(null)
  }, [isConversationActive, sfx])

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

    // Array.from keeps multi-codepoint emoji intact while slicing
    const chars = Array.from(playerMessageWithEmoji)
    let playerIndex = 0
    typingInterval.current = window.setInterval(() => {
      playerIndex += 1
      setPlayerLine(chars.slice(0, playerIndex).join(''))
      if (playerIndex % 3 === 0) sfx.blip(1.6)

      if (playerIndex >= chars.length && typingInterval.current !== null) {
        window.clearInterval(typingInterval.current)
        typingInterval.current = null

        // Brief pause between player line finishing and answer starting
        typingTimeout.current = window.setTimeout(() => {
          setStage('answerTyping')
        }, 280)
      }
    }, 28)

    return () => {
      clearTimers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, clearTimers, prefersReducedMotion, questions, selected])

  // Runs the answer-typing animation once the stage advances to answerTyping
  useEffect(() => {
    if (stage !== 'answerTyping' || !selected) return

    const answerMessage = answers[selected]
    const chars = Array.from(answerMessage)
    let answerIndex = 0

    typingInterval.current = window.setInterval(() => {
      answerIndex += 1
      setAnswerLine(chars.slice(0, answerIndex).join(''))
      if (answerIndex % 3 === 0 && chars[answerIndex] !== ' ') sfx.blip(0.85 + Math.random() * 0.3)

      if (answerIndex >= chars.length && typingInterval.current !== null) {
        window.clearInterval(typingInterval.current)
        typingInterval.current = null

        typingTimeout.current = window.setTimeout(() => {
          setStage('complete')
          setShowOk(true)
        }, 180)
      }
    }, 24)

    return () => {
      clearTimers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, clearTimers, selected, stage])

  // Flips the character sprite between still/talking at 160 ms while answer is typing
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
      }, 160)
    } else {
      clearTalkingInterval()
      setIsTalkingFrame(false)
    }

    return () => {
      clearTalkingInterval()
    }
  }, [clearTalkingInterval, prefersReducedMotion, stage])

  /** Jumps straight to the end of the current exchange */
  const handleSkip = useCallback(() => {
    if (!selected || stage === 'complete' || stage === 'idle') return
    clearTimers()
    const emoji = questionEmojis[selected]
    setPlayerLine(emoji ? `${emoji} ${questions[selected].playerLine}` : questions[selected].playerLine)
    setAnswerLine(answers[selected])
    setStage('complete')
    setShowOk(true)
    sfx.select()
  }, [answers, clearTimers, questions, selected, sfx, stage])

  /** Marks the question as answered, fires achievements and resets conversation state back to idle. */
  const handleOk = useCallback(() => {
    if (selected) {
      const next = answeredQuestions.includes(selected) ? answeredQuestions : [...answeredQuestions, selected]
      setAnsweredQuestions(next)

      const groupKey = questionToGroupMap[selected]
      const groupDone = questionGroupConfig[groupKey].questions.every((key) => next.includes(key))

      if (next.length === TOTAL_QUESTIONS) {
        unlock('allDone', { icon: '🏆', big: true })
      } else if (groupDone) {
        unlock('categoryComplete', { icon: questionGroupConfig[groupKey].emoji, big: true, instance: groupKey })
      } else if (next.length >= Math.ceil(TOTAL_QUESTIONS / 2)) {
        unlock('halfway', { icon: '🔥' })
      } else if (next.length === 1) {
        unlock('firstQuestion', { icon: '⭐' })
      } else {
        sfx.back()
      }
    }
    clearTimers()
    setSelected(null)
    setStage('idle')
    setPlayerLine('')
    setAnswerLine('')
    setShowOk(false)
  }, [answeredQuestions, clearTimers, selected, sfx, unlock])

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

  // Keyboard: Esc goes back to worlds, Enter/Space skips typing or confirms the answer
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'BUTTON', 'A'].includes(target.tagName)) return
      if (document.querySelector('[role="dialog"]')) return

      if (event.key === 'Escape' && !isConversationActive && selectedGroup) {
        handleBackToGroups()
      }
      if (event.key === 'Enter' || event.key === ' ') {
        if (stage === 'playerTyping' || stage === 'answerTyping') {
          event.preventDefault()
          handleSkip()
        } else if (stage === 'complete' && selected !== 'github' && selected !== 'cv') {
          event.preventDefault()
          handleOk()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleBackToGroups, handleOk, handleSkip, isConversationActive, selected, selectedGroup, stage])

  const selectedGroupData = useMemo(
    () => (selectedGroup ? groupEntries.find((group) => group.key === selectedGroup) ?? null : null),
    [groupEntries, selectedGroup],
  )

  const isShowingCategories = !isConversationActive && selectedGroup === null
  const isShowingQuestions = !isConversationActive && selectedGroupData !== null

  return (
    <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 pb-10 pt-20 md:px-8">
      <AchievementToasts toasts={toasts} />

      <HudBar
        answered={answeredQuestions.length}
        total={TOTAL_QUESTIONS}
        totalCoins={totalCoins}
        infiniteCoins={infiniteCoins}
        onToggle={handleToggleInfinite}
        coinRef={hudCoinRef}
        coinBump={coinBump}
        highlightToggle={highlightToggle}
        coinsCopy={coinsCopy}
        hudCopy={hudCopy}
      />

      <div ref={stageRef} className="scroll-mt-20">
        <h1 className="sr-only">{t('interview.title')}</h1>
        <ConversationPanel
          stage={stage}
          isTalkingFrame={isTalkingFrame}
          prefersReducedMotion={prefersReducedMotion}
          avatarAlt={t('interview.avatarAlt')}
          answerLine={answerLine}
          playerLine={playerLine}
          showOk={showOk}
          selected={selected}
          accent={accent}
          idleLine={t('interview.subtitle')}
          conversation={conversation}
          onOk={handleOk}
          onGithub={handleGithubRedirect}
          onCv={handleCvDownload}
          onSkip={handleSkip}
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
        repeatPrompt={t('interview.repeatPrompt')}
        groupPrompt={t('interview.groupPrompt')}
        selectPrompt={t('interview.selectPrompt')}
        backToCategories={t('interview.backToCategories')}
        escHint={hudCopy.escHint}
        onGroupSelect={handleGroupSelect}
        onBackToGroups={handleBackToGroups}
        onSelect={handleSelect}
        onHover={sfx.hover}
      />

      <SuggestionPrompt />

      <footer className="mt-auto pt-6 text-center font-mono text-base text-muted/60">
        {t('footer.text')} <span className="text-neonPink">♥</span>
      </footer>
    </section>
  )
}
