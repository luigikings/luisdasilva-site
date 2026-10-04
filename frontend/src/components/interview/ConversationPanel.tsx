import { AnimatePresence, motion } from 'framer-motion'

import type { QuestionKey } from '../../i18n/dict'

type ConversationPanelProps = {
  stage: 'idle' | 'playerTyping' | 'answerTyping' | 'complete'
  isTalkingFrame: boolean
  prefersReducedMotion: boolean | null
  avatarAlt: string
  answerLine: string
  playerLine: string
  showOk: boolean
  selected: QuestionKey | null
  /** Accent color of the active world; tints the spotlight and dialog box */
  accent: string
  idleLine: string
  conversation: {
    youLabel: string
    characterLabel: string
    okButton: string
    githubButton: string
    cvButton: string
    skipHint: string
  }
  onOk: () => void
  onGithub: () => void
  onCv: () => void
  onSkip: () => void
}

/**
 * The interview "stage": Luis inside an arcade monitor under a colored spotlight,
 * with the visitor's question bubble and an RPG-style answer box next to him.
 * Clicking the answer box while text is typing skips straight to the end.
 */
export function ConversationPanel({
  stage,
  isTalkingFrame,
  prefersReducedMotion,
  avatarAlt,
  answerLine,
  playerLine,
  showOk,
  selected,
  accent,
  idleLine,
  conversation,
  onOk,
  onGithub,
  onCv,
  onSkip,
}: ConversationPanelProps) {
  const isTalking = stage === 'answerTyping'
  const isTyping = stage === 'playerTyping' || stage === 'answerTyping'
  const hasAnswer = Boolean(answerLine) || stage === 'answerTyping' || stage === 'complete'

  return (
    <div className="grid w-full items-center gap-6 md:grid-cols-[auto_1fr] md:gap-10">
      {/* Character monitor */}
      <div className="relative mx-auto">
        {/* Spotlight cone */}
        <motion.div
          aria-hidden
          className="absolute -top-16 left-1/2 h-64 w-72 -translate-x-1/2 blur-2xl"
          style={{ background: `radial-gradient(ellipse at top, ${accent}55, transparent 70%)` }}
          animate={prefersReducedMotion ? undefined : { opacity: isTalking ? [0.7, 1, 0.7] : 0.6 }}
          transition={{ duration: 0.6, repeat: isTalking ? Infinity : 0 }}
        />
        <motion.div
          className="relative h-56 w-56 rounded-[28px] border-4 p-2 sm:h-64 sm:w-64"
          style={{ borderColor: accent, boxShadow: `0 0 30px ${accent}88, inset 0 0 20px ${accent}44` }}
          initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8, rotate: -4 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 16 }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-[radial-gradient(circle_at_50%_30%,#3b1f8f,#170d36_70%)]">
            {/* Monitor grid + scanlines */}
            <div aria-hidden className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:16px_16px]" />
            <div aria-hidden className="crt-scanlines absolute inset-0" />
            <motion.img
              src={isTalking && !prefersReducedMotion && isTalkingFrame ? '/imgs/main_caracter/LK_hablando1.png' : '/imgs/main_caracter/LK_defrente.png'}
              alt={avatarAlt}
              className="pixelated relative h-full w-full object-contain"
              animate={
                prefersReducedMotion
                  ? undefined
                  : isTalking
                    ? { y: [0, -4, 0], rotate: [0, -1.5, 1.5, 0] }
                    : { y: [0, -6, 0] }
              }
              transition={isTalking ? { duration: 0.44, repeat: Infinity } : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* REC / LIVE badge */}
            <span className="absolute left-2 top-2 flex items-center gap-1 rounded bg-abyss/80 px-1.5 py-0.5 font-pixel text-[7px] text-danger">
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-danger motion-reduce:animate-none" /> LIVE
            </span>
          </div>
        </motion.div>

        {/* Voice equalizer while talking */}
        <div aria-hidden className="mx-auto mt-3 flex h-6 w-28 items-end justify-center gap-1">
          {Array.from({ length: 9 }, (_, i) => (
            <motion.span
              key={i}
              className="w-1.5 rounded-sm"
              style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
              animate={
                isTalking && !prefersReducedMotion
                  ? { height: ['20%', `${40 + ((i * 37) % 60)}%`, '25%', `${60 + ((i * 53) % 40)}%`, '20%'] }
                  : { height: '15%' }
              }
              transition={{ duration: 0.6 + (i % 3) * 0.1, repeat: isTalking ? Infinity : 0, delay: i * 0.04 }}
            />
          ))}
        </div>
      </div>

      {/* Dialog column */}
      <div className="flex min-h-[12rem] flex-col justify-center gap-4">
        <AnimatePresence mode="popLayout">
          {!selected && !playerLine ? (
            <motion.div
              key="idle"
              initial={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, x: 20 }}
              className="relative self-start rounded-2xl border-2 border-line bg-panel/90 px-5 py-4 md:before:absolute md:before:-left-3 md:before:top-1/2 md:before:h-5 md:before:w-5 md:before:-translate-y-1/2 md:before:rotate-45 md:before:border-b-2 md:before:border-l-2 md:before:border-line md:before:bg-panel"
            >
              <p className="font-mono text-2xl leading-tight text-ink">
                {idleLine}
                <motion.span
                  className="ml-1 inline-block"
                  animate={prefersReducedMotion ? undefined : { rotate: [0, 18, -8, 18, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.2 }}
                >
                  👋
                </motion.span>
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {playerLine ? (
            <motion.div
              key="player-line"
              layout
              initial={prefersReducedMotion ? undefined : { opacity: 0, x: 40, scale: 0.9 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, x: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="max-w-md self-end rounded-2xl rounded-br-sm border-2 border-neonCyan bg-neonCyan/10 px-5 py-3 text-right shadow-neon"
            >
              <p className="mb-1 font-pixel text-[8px] uppercase text-neonCyan">{conversation.youLabel}</p>
              <p className="text-base font-medium text-ink">{playerLine}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {hasAnswer && selected ? (
            <motion.div
              key="answer-line"
              layout
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20, scale: 0.95 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              onClick={isTyping ? onSkip : undefined}
              className={`relative rounded-2xl border-4 border-ink bg-abyss/95 p-5 text-left ${isTyping ? 'cursor-pointer' : ''}`}
              style={{ boxShadow: `0 0 0 4px #0b0620, 0 0 34px ${accent}77` }}
            >
              <span
                className="absolute -top-3 left-4 rounded-md px-2 py-1 font-pixel text-[8px] uppercase text-night"
                style={{ background: accent }}
              >
                {conversation.characterLabel}
              </span>
              <p className="whitespace-pre-line pt-1 text-base leading-relaxed text-ink sm:text-lg">
                {answerLine}
                {isTyping ? (
                  <span className="ml-0.5 inline-block h-5 w-2 translate-y-1 animate-blink bg-ink motion-reduce:animate-none" />
                ) : null}
              </p>

              {isTyping ? (
                <p className="mt-3 text-right font-mono text-base text-muted">{conversation.skipHint} ▸▸</p>
              ) : null}

              <AnimatePresence>
                {showOk ? (
                  <motion.div
                    key="answer-actions"
                    initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-4 flex flex-wrap justify-end gap-3"
                  >
                    {selected === 'github' ? (
                      <button type="button" onClick={onGithub} className="btn-arcade bg-neonPurple text-ink">
                        🐙 {conversation.githubButton}
                      </button>
                    ) : null}
                    {selected === 'cv' ? (
                      <button type="button" onClick={onCv} className="btn-arcade bg-coin">
                        📄 {conversation.cvButton}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={onOk}
                      className="btn-arcade bg-neonLime"
                    >
                      ✔ {conversation.okButton}
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
