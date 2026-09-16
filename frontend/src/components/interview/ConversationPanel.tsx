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
  conversation: {
    youLabel: string
    characterLabel: string
    okButton: string
    githubButton: string
    cvButton: string
  }
  onOk: () => void
  onGithub: () => void
  onCv: () => void
}

export function ConversationPanel({
  stage,
  isTalkingFrame,
  prefersReducedMotion,
  avatarAlt,
  answerLine,
  playerLine,
  showOk,
  selected,
  conversation,
  onOk,
  onGithub,
  onCv,
}: ConversationPanelProps) {
  return (
    <motion.div layout className="relative flex flex-col items-center">
      <motion.div
        className="relative flex h-56 w-56 items-center justify-center rounded-pixel border-4 border-[#8a5a30] bg-creamPanel shadow-pixel md:h-64 md:w-64"
        initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.94 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="absolute inset-[8%] flex items-center justify-center overflow-hidden rounded-[22px] border-4 border-[#8a5a30] bg-gradient-to-br from-[#c99a5b] via-[#b3854a] to-[#8a5a30]">
          <img
            src={
              stage === 'answerTyping' && !prefersReducedMotion && isTalkingFrame
                ? '/imgs/main_caracter/LK_hablando1.png'
                : '/imgs/main_caracter/LK_defrente.png'
            }
            alt={avatarAlt}
            className="h-full w-full object-contain"
          />
        </div>
      </motion.div>

      <AnimatePresence mode="popLayout">
        {answerLine || stage === 'answerTyping' || stage === 'complete' ? (
          <motion.div
            key="answer-line"
            layout
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mt-4 flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-[#d8c39a] bg-[#fffaf0] p-4 text-left text-sm text-charcoal shadow-inner md:absolute md:left-full md:top-1/2 md:mt-0 md:ml-6 md:w-72 md:-translate-y-1/2 md:transform md:text-left md:shadow-xl"
          >
            <p className="text-[11px] uppercase tracking-wide text-charcoal/50">
              {conversation.characterLabel}
            </p>
            <p className="leading-relaxed">{answerLine}</p>
            <AnimatePresence>
              {showOk ? (
                <motion.div
                  key="answer-actions"
                  initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="flex flex-wrap justify-end gap-2"
                >
                  {selected === 'github' ? (
                    <motion.button
                      type="button"
                      onClick={onGithub}
                      className="rounded-full bg-highlight px-4 py-1 font-sans text-[10px] font-semibold uppercase tracking-wide text-charcoal shadow-sm transition-colors hover:bg-highlight/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf0]"
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                    >
                      {conversation.githubButton}
                    </motion.button>
                  ) : null}
                  {selected === 'cv' ? (
                    <motion.button
                      type="button"
                      onClick={onCv}
                      className="rounded-full bg-highlight px-4 py-1 font-sans text-[10px] font-semibold uppercase tracking-wide text-charcoal shadow-sm transition-colors hover:bg-highlight/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf0]"
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                    >
                      {conversation.cvButton}
                    </motion.button>
                  ) : null}
                  <motion.button
                    type="button"
                    onClick={onOk}
                    className="rounded-full border border-[#d8c39a] bg-cream px-4 py-1 font-sans text-[10px] font-semibold uppercase tracking-wide text-charcoal shadow-sm transition-colors hover:bg-creamPanel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf0]"
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
            layout
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mt-6 w-full max-w-md rounded-2xl border border-highlight/60 bg-highlight/15 px-6 py-4 text-center text-sm text-charcoal shadow-pixel"
          >
            <p className="mb-1 text-[11px] uppercase tracking-wide text-charcoal/60">
              {conversation.youLabel}
            </p>
            <p>{playerLine}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}
