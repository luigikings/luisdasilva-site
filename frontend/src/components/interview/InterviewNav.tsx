import { AnimatePresence, motion } from 'framer-motion'

import { questionEmojis, questionCosts } from '../../data/interview'
import type { QuestionGroupKey, QuestionKey } from '../../i18n/dict'

type GroupEntry = {
  key: QuestionGroupKey
  emoji: string
  label: string
  questionKeys: QuestionKey[]
}

type InterviewNavProps = {
  isShowingCategories: boolean
  isShowingQuestions: boolean
  selectedGroup: QuestionGroupKey | null
  selectedGroupData: GroupEntry | null
  groupEntries: GroupEntry[]
  questions: Record<QuestionKey, { label: string; playerLine: string }>
  answeredQuestions: QuestionKey[]
  selected: QuestionKey | null
  groupCoins: Record<QuestionGroupKey, number>
  infiniteCoins: boolean
  coinWarningGroup: QuestionGroupKey | null
  prefersReducedMotion: boolean | null
  coinsCopy: { remaining: string; unavailable: string; cost: string }
  repeatPrompt: string
  groupPrompt: string
  selectPrompt: string
  backToCategories: string
  onGroupSelect: (key: QuestionGroupKey) => void
  onBackToGroups: () => void
  onSelect: (key: QuestionKey) => void
}

export function InterviewNav({
  isShowingCategories,
  isShowingQuestions,
  selectedGroup,
  selectedGroupData,
  groupEntries,
  questions,
  answeredQuestions,
  selected,
  groupCoins,
  infiniteCoins,
  coinWarningGroup,
  prefersReducedMotion,
  coinsCopy,
  repeatPrompt,
  groupPrompt,
  selectPrompt,
  backToCategories,
  onGroupSelect,
  onBackToGroups,
  onSelect,
}: InterviewNavProps) {
  return (
    <motion.div layout className="flex flex-col gap-8">
      <AnimatePresence mode="popLayout">
        {isShowingCategories ? (
          <motion.div
            key="group-prompt"
            layout
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <p className="text-center text-sm text-charcoal/70">{groupPrompt}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {isShowingQuestions ? (
          <motion.div
            key="question-prompt"
            layout
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="flex flex-col items-center gap-4 text-center"
          >
            <p className="text-sm text-charcoal/70">{selectPrompt}</p>
            {selectedGroupData ? (
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-wide text-charcoal/60">
                <span className="rounded-full border border-[#d8c39a] bg-creamPanel/70 px-3 py-1 font-sans text-[10px] font-semibold text-charcoal/70">
                  {`${selectedGroupData.emoji} ${selectedGroupData.label}`}
                </span>
                <span
                  className={`rounded-full border px-3 py-1 font-sans text-[10px] font-semibold ${
                    coinWarningGroup === selectedGroupData.key
                      ? 'border-red-500/80 bg-red-500/15 text-red-700'
                      : 'border-[#d8c39a] bg-creamPanel/70 text-charcoal/70'
                  }`}
                >
                  {coinWarningGroup === selectedGroupData.key
                    ? coinsCopy.unavailable
                    : `${coinsCopy.remaining}: ${
                        infiniteCoins ? '∞' : groupCoins[selectedGroupData.key] ?? 0
                      }`}
                </span>
                <button
                  type="button"
                  onClick={onBackToGroups}
                  className="rounded-full border border-[#d8c39a] bg-creamPanel/50 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-wide text-charcoal/60 transition-colors duration-300 hover:border-highlight/40 hover:text-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                >
                  {backToCategories}
                </button>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {isShowingCategories ? (
          <motion.div
            key="groups"
            layout
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:flex lg:flex-wrap lg:justify-center"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            {groupEntries.map((group, index) => {
              const groupQuestions = group.questionKeys
              const answeredCount = groupQuestions.filter((key) =>
                answeredQuestions.includes(key),
              ).length
              const allAnswered = answeredCount === groupQuestions.length
              const remainingCoins = groupCoins[group.key] ?? 0
              const showWarning = coinWarningGroup === group.key
              const baseClasses =
                'group relative flex flex-col gap-3 overflow-hidden rounded-pixel border px-5 py-5 text-left text-sm uppercase tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-cream'
              const stateClasses = showWarning
                ? 'border-red-500/80 bg-red-500/10 text-red-700'
                : allAnswered
                  ? 'border-[#d8c39a] bg-creamPanel/30 text-charcoal/50 opacity-80 hover:border-highlight/40 hover:text-highlight'
                  : 'border-[#d8c39a] bg-creamPanel/60 text-charcoal/90 hover:bg-creamPanel'

              return (
                <motion.button
                  key={group.key}
                  type="button"
                  onClick={() => onGroupSelect(group.key)}
                  className={`${baseClasses} ${stateClasses} lg:basis-[calc(33.333%_-_12px)] lg:max-w-[calc(33.333%_-_12px)] lg:flex-none`}
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: prefersReducedMotion ? 0 : 0.08 * index }}
                  aria-pressed={selectedGroup === group.key}
                >
                  <span className="text-lg text-highlight">{`${group.emoji} ${group.label}`}</span>
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-wide text-charcoal/60">
                    {`${answeredCount}/${groupQuestions.length}`}
                  </span>
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-wide text-charcoal/60">
                    {showWarning
                      ? coinsCopy.unavailable
                      : `${coinsCopy.remaining}: ${infiniteCoins ? '∞' : remainingCoins}`}
                  </span>
                </motion.button>
              )
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {isShowingQuestions && selectedGroupData ? (
          <motion.div
            key="questions"
            layout
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {selectedGroupData.questionKeys.map((key, index) => {
              const question = questions[key]
              const isAnswered = answeredQuestions.includes(key)
              const isActive = selected === key
              const emoji = questionEmojis[key]
              const baseCost = questionCosts[key] ?? 1
              const labelWithEmoji = emoji ? `${emoji} ${question.label}` : question.label
              const baseClasses =
                'group relative overflow-hidden rounded-pixel border px-4 py-4 text-left text-sm uppercase tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-cream'
              const stateClasses = isActive
                ? 'border-highlight bg-highlight/25 text-highlight shadow-pixel'
                : isAnswered
                  ? 'border-[#d8c39a] bg-creamPanel/30 text-charcoal/50 opacity-70 hover:border-highlight/40 hover:bg-creamPanel/60 hover:text-charcoal/80 hover:opacity-100'
                  : 'border-[#d8c39a] bg-creamPanel/60 text-charcoal/90 hover:bg-creamPanel'

              return (
                <motion.button
                  key={key}
                  type="button"
                  onClick={() => onSelect(key)}
                  className={`${baseClasses} ${stateClasses}`}
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: prefersReducedMotion ? 0 : 0.08 * index }}
                  aria-pressed={isActive}
                >
                  <span
                    className={`block transition-opacity duration-300 ${
                      isAnswered ? 'group-hover:opacity-0' : ''
                    }`}
                  >
                    {labelWithEmoji}
                  </span>
                  {baseCost > 0 ? (
                    <span className="absolute right-3 top-3 rounded-full border border-[#d8c39a] bg-creamPanel/70 px-2 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-wide text-charcoal/70">
                      {`${coinsCopy.cost}: ${baseCost}`}
                    </span>
                  ) : null}
                  {isAnswered ? (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-sans text-[10px] font-semibold uppercase tracking-wide text-charcoal/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {repeatPrompt}
                    </span>
                  ) : null}
                </motion.button>
              )
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}
