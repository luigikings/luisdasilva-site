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
                <span
                  className={`rounded-full border px-3 py-1 font-pixel text-[10px] ${
                    coinWarningGroup === selectedGroupData.key
                      ? 'border-red-500/80 bg-red-500/20 text-red-200'
                      : 'border-slate-700/60 bg-slate-900/60 text-slate-300'
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
              const remainingCoins = groupCoins[group.key] ?? 0
              const showWarning = coinWarningGroup === group.key
              const baseClasses =
                'group relative flex flex-col gap-3 overflow-hidden rounded-pixel border px-5 py-5 text-left text-sm uppercase tracking-[0.2em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal'
              const stateClasses = showWarning
                ? 'border-red-500/80 bg-red-500/15 text-red-200'
                : allAnswered
                  ? 'border-slate-800 bg-slate-900/40 text-slate-500 opacity-80 hover:border-highlight/40 hover:text-highlight'
                  : 'border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800/70'

              return (
                <motion.button
                  key={group.key}
                  type="button"
                  onClick={() => onGroupSelect(group.key)}
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
                  <span className="text-[10px] font-pixel uppercase tracking-[0.35em] text-slate-400">
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
              const baseCost = questionCosts[key] ?? 1
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
                  onClick={() => onSelect(key)}
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
                  {baseCost > 0 ? (
                    <span className="absolute right-3 top-3 rounded-full border border-slate-700/60 bg-slate-900/60 px-2 py-0.5 font-pixel text-[9px] uppercase tracking-[0.3em] text-slate-300">
                      {`${coinsCopy.cost}: ${baseCost}`}
                    </span>
                  ) : null}
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
  )
}
