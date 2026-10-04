import { AnimatePresence, motion } from 'framer-motion'

import { groupTheme, initialCoinsByGroup, questionCosts, questionEmojis } from '../../data/interview'
import type { QuestionGroupKey, QuestionKey } from '../../i18n/dict'
import { PixelCoin } from '../fx/PixelCoin'
import { TiltCard } from '../fx/TiltCard'

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
  coinsCopy: { remaining: string; unavailable: string; cost: string; free: string }
  repeatPrompt: string
  groupPrompt: string
  selectPrompt: string
  backToCategories: string
  escHint: string
  onGroupSelect: (key: QuestionGroupKey) => void
  onBackToGroups: () => void
  onSelect: (key: QuestionKey, origin: HTMLElement) => void
  onHover: () => void
}

/** Row of mini coins showing how many coins are left in a world */
function CoinPips({ remaining, max, infinite }: { remaining: number; max: number; infinite: boolean }) {
  if (infinite) {
    return <span className="font-sans text-xl font-bold leading-none text-neonLime">∞</span>
  }
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`transition-all duration-300 ${i < remaining ? '' : 'scale-75 opacity-20 grayscale'}`}>
          <PixelCoin size={12} />
        </span>
      ))}
    </span>
  )
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
  escHint,
  onGroupSelect,
  onBackToGroups,
  onSelect,
  onHover,
}: InterviewNavProps) {
  const enter = prefersReducedMotion ? undefined : { opacity: 0, y: 24 }
  const shown = prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
  const leave = prefersReducedMotion ? undefined : { opacity: 0, y: -16, transition: { duration: 0.2 } }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {isShowingCategories ? (
          <motion.div key="groups" initial={enter} animate={shown} exit={leave} className="flex flex-col gap-5">
            <h2 className="text-center font-pixel text-xs text-ink sm:text-sm">
              <span className="text-neonPink">◆</span> {groupPrompt} <span className="text-neonCyan">◆</span>
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
              {groupEntries.map((group, index) => {
                const theme = groupTheme[group.key]
                const total = group.questionKeys.length
                const answeredCount = group.questionKeys.filter((key) => answeredQuestions.includes(key)).length
                const allAnswered = answeredCount === total
                const remainingCoins = groupCoins[group.key] ?? 0
                const showWarning = coinWarningGroup === group.key

                return (
                  <motion.div
                    key={group.key}
                    className={index === groupEntries.length - 1 && groupEntries.length % 2 === 1 ? 'col-span-2 lg:col-span-1' : ''}
                    initial={prefersReducedMotion ? undefined : { opacity: 0, y: 40, scale: 0.85 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 18, delay: index * 0.07 }}
                  >
                    <TiltCard
                      onClick={() => onGroupSelect(group.key)}
                      onPointerEnter={onHover}
                      aria-pressed={selectedGroup === group.key}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                      className={`flex h-full w-full flex-col gap-3 overflow-hidden rounded-pixel border-2 p-4 text-left sm:gap-4 sm:p-5 transition-[border-color,box-shadow] duration-300 ${
                        showWarning ? 'border-danger' : 'border-line hover:border-[var(--c)]'
                      }`}
                      style={{
                        ['--c' as string]: theme.color,
                        background: `${theme.gradient}, #170d36`,
                        boxShadow: showWarning ? '0 0 24px rgba(255,77,94,0.6)' : undefined,
                      }}
                    >
                      {/* Big floating emoji */}
                      <motion.span
                        className="text-4xl drop-shadow-[0_6px_0_rgba(0,0,0,0.4)] sm:text-5xl"
                        animate={prefersReducedMotion ? undefined : { y: [0, -6, 0], rotate: [0, -6, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.3, ease: 'easeInOut' }}
                        aria-hidden
                      >
                        {group.emoji}
                      </motion.span>
                      <span className="flex-1 text-base font-bold leading-tight text-ink sm:text-lg">{group.label}</span>

                      <span className="flex flex-col gap-2">
                        <span className="h-2 w-full overflow-hidden rounded-full bg-abyss/80">
                          <motion.span
                            className="block h-full rounded-full"
                            style={{ background: theme.color, boxShadow: `0 0 8px ${theme.glow}` }}
                            initial={false}
                            animate={{ width: `${(answeredCount / total) * 100}%` }}
                          />
                        </span>
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-mono text-lg leading-none text-muted">
                            {answeredCount}/{total}
                          </span>
                          {showWarning ? (
                            <span className="font-pixel text-[8px] text-danger">{coinsCopy.unavailable}</span>
                          ) : (
                            <CoinPips remaining={remainingCoins} max={initialCoinsByGroup[group.key]} infinite={infiniteCoins} />
                          )}
                        </span>
                      </span>

                      {allAnswered ? (
                        <motion.span
                          className="absolute right-3 top-3 rotate-12 rounded-md border-2 px-2 py-1 font-pixel text-[8px]"
                          style={{ borderColor: theme.color, color: theme.color, textShadow: `0 0 8px ${theme.color}` }}
                          initial={prefersReducedMotion ? undefined : { scale: 3, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                        >
                          CLEAR <span className="font-sans text-xs">★</span>
                        </motion.span>
                      ) : null}
                    </TiltCard>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        ) : null}

        {isShowingQuestions && selectedGroupData ? (
          <motion.div key={`questions-${selectedGroupData.key}`} initial={enter} animate={shown} exit={leave} className="flex flex-col gap-5">
            {(() => {
              const theme = groupTheme[selectedGroupData.key]
              const showWarning = coinWarningGroup === selectedGroupData.key
              return (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={onBackToGroups}
                      onPointerEnter={onHover}
                      className="btn-arcade bg-panelHi px-4 py-2.5 text-[9px] text-ink"
                    >
                      ← {backToCategories}
                    </button>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl" aria-hidden>
                        {selectedGroupData.emoji}
                      </span>
                      <span className="text-lg font-bold" style={{ color: theme.color, textShadow: `0 0 14px ${theme.glow}` }}>
                        {selectedGroupData.label}
                      </span>
                    </div>
                    <motion.span
                      className={`flex items-center gap-2 rounded-xl border-2 bg-abyss/80 px-3 py-2 ${showWarning ? 'border-danger' : 'border-line'}`}
                      animate={showWarning && !prefersReducedMotion ? { x: [0, -8, 8, -6, 6, 0] } : undefined}
                      transition={{ duration: 0.4 }}
                    >
                      {showWarning ? (
                        <span className="font-pixel text-[8px] text-danger">{coinsCopy.unavailable}</span>
                      ) : (
                        <CoinPips
                          remaining={groupCoins[selectedGroupData.key] ?? 0}
                          max={initialCoinsByGroup[selectedGroupData.key]}
                          infinite={infiniteCoins}
                        />
                      )}
                    </motion.span>
                  </div>

                  <p className="text-center font-pixel text-[10px] text-muted">{selectPrompt}</p>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {selectedGroupData.questionKeys.map((key, index) => {
                      const question = questions[key]
                      const isAnswered = answeredQuestions.includes(key)
                      const isActive = selected === key
                      const baseCost = questionCosts[key] ?? 1

                      return (
                        <motion.button
                          key={key}
                          type="button"
                          onClick={(event) => onSelect(key, event.currentTarget)}
                          onPointerEnter={onHover}
                          aria-pressed={isActive}
                          className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl border-2 bg-panel/90 p-4 text-left transition-[border-color,box-shadow,background-color] duration-300 hover:bg-panelHi ${
                            isAnswered ? 'border-line/60' : 'border-line hover:border-[var(--c)] hover:shadow-[0_0_24px_var(--g)]'
                          }`}
                          style={{ ['--c' as string]: theme.color, ['--g' as string]: theme.glow }}
                          initial={prefersReducedMotion ? undefined : { opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                          animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                          whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                          whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 22, delay: prefersReducedMotion ? 0 : index * 0.05 }}
                        >
                          <span
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${isAnswered ? 'opacity-60' : ''}`}
                            style={{ background: theme.gradient, boxShadow: `inset 0 0 0 2px ${theme.color}55` }}
                            aria-hidden
                          >
                            {questionEmojis[key]}
                          </span>
                          <span className={`flex-1 text-base font-medium leading-snug ${isAnswered ? 'text-muted' : 'text-ink'}`}>
                            {question.label}
                          </span>
                          <span className="shrink-0">
                            {isAnswered ? (
                              <span className="flex flex-col items-center gap-1">
                                <span className="font-sans text-xl font-bold text-neonLime group-hover:hidden">✓</span>
                                <span className="hidden font-sans text-xl font-bold text-neonCyan group-hover:block" title={repeatPrompt}>
                                  ↻
                                </span>
                              </span>
                            ) : baseCost > 0 ? (
                              <span className="flex items-center gap-1 rounded-lg border border-coin/50 bg-abyss/80 px-2 py-1" title={`${coinsCopy.cost}: ${baseCost}`}>
                                <PixelCoin size={14} />
                                <span className="font-pixel text-[8px] text-coin">{baseCost}</span>
                              </span>
                            ) : (
                              <span className="rounded-lg border border-neonLime/60 bg-abyss/80 px-2 py-1 font-pixel text-[7px] uppercase text-neonLime">
                                {coinsCopy.free}
                              </span>
                            )}
                          </span>
                          {isAnswered ? <span className="sr-only">{repeatPrompt}</span> : null}
                        </motion.button>
                      )
                    })}
                  </div>
                  <p className="hidden text-center font-mono text-base text-muted/60 sm:block">{escHint}</p>
                </>
              )
            })()}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
