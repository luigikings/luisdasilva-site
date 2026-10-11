import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { createPortal } from 'react-dom'

export type Toast = {
  id: number
  title: string
  body: string
  icon: string
  tone: 'gold' | 'danger' | 'cyan'
}

const toneStyles: Record<Toast['tone'], string> = {
  gold: 'border-coin shadow-neon-coin',
  danger: 'border-danger shadow-[0_0_24px_rgba(255,77,94,0.6)]',
  cyan: 'border-neonCyan shadow-neon',
}

/** Stack of Xbox-style "achievement unlocked" toasts at the bottom of the screen.
 * Under reduced motion the same toasts appear instantly (same titles, same
 * bodies, same timing) with no slide, pop or shine sweep (RF-7).
 *
 * RF-17: notices never block — no focus capture, everything stays actionable,
 * and 1 interaction (click on the toast or its close button) dismisses them
 * before the <= 4 s self-dismiss. */
export function AchievementToasts({
  toasts,
  dismissLabel,
  onDismiss,
}: {
  toasts: Toast[]
  dismissLabel: string
  onDismiss: (id: number) => void
}) {
  const prefersReducedMotion = useReducedMotion()
  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[85] flex flex-col-reverse items-center gap-2 px-4 sm:bottom-6"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout={prefersReducedMotion ? undefined : true}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 40, scale: 0.8 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            onClick={() => onDismiss(toast.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
                event.preventDefault()
                onDismiss(toast.id)
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`${toast.title} — ${dismissLabel}`}
            className={`pointer-events-auto relative flex w-full max-w-sm cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border-2 bg-abyss/95 px-4 py-3 backdrop-blur-md ${toneStyles[toast.tone]}`}
          >
            <motion.span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-panelHi text-2xl"
              initial={prefersReducedMotion ? undefined : { rotate: -30, scale: 0 }}
              animate={prefersReducedMotion ? undefined : { rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.1 }}
            >
              {toast.icon}
            </motion.span>
            <div className="min-w-0 flex-1 text-left">
              <p className="font-pixel text-[9px] leading-relaxed text-ink">{toast.title}</p>
              <p className="truncate text-sm text-muted">{toast.body}</p>
            </div>
            <button
              type="button"
              aria-label={dismissLabel}
              onClick={(event) => {
                event.stopPropagation()
                onDismiss(toast.id)
              }}
              className="shrink-0 rounded-lg border border-line px-2 py-1 font-pixel text-[10px] text-muted transition-colors hover:border-ink hover:text-ink"
            >
              ✕
            </button>
            {/* Shine sweep (motion only) */}
            {!prefersReducedMotion ? (
              <motion.span
                aria-hidden
                className="absolute inset-y-0 w-16 -skew-x-12 bg-white/15"
                initial={{ left: '-20%' }}
                animate={{ left: '120%' }}
                transition={{ duration: 0.9, delay: 0.2 }}
              />
            ) : null}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  )
}
