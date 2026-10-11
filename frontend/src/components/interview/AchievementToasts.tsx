import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
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

type ToastCardProps = {
  toast: Toast
  dismissLabel: string
  onDismiss: (id: number) => void
  prefersReducedMotion: boolean | null
}

/**
 * One achievement/notice card.
 *
 * RF-12 (no focus capture): the card itself is not focusable and traps
 * nothing — the only focusable element inside is its close button, so
 * every button and question stays actionable while the toast is visible
 * and closing it is never mandatory. If the card is removed while its
 * close button holds the focus (auto-dismiss, Escape or click), focus
 * returns to the element that was focused before the toast appeared
 * instead of falling to <body>.
 */
function ToastCard({ toast, dismissLabel, onDismiss, prefersReducedMotion }: ToastCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Remember the focused element at mount; the cleanup restores it
    // when the toast unmounts with its own close button focused.
    const previousFocus = document.activeElement as HTMLElement | null
    const card = cardRef.current
    return () => {
      if (!card || !previousFocus || !document.contains(previousFocus)) {
        return
      }
      if (card.contains(document.activeElement)) {
        previousFocus.focus({ preventScroll: true })
      }
    }
  }, [])

  return (
    <motion.div
      ref={cardRef}
      layout={prefersReducedMotion ? undefined : true}
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 40, scale: 0.8 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      onClick={() => onDismiss(toast.id)}
      role="alertdialog"
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
      {/* Shine sweep (motion only; pointer-transparent so it never
          blocks the toast or dims the close button's focus ring) */}
      {!prefersReducedMotion ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-16 -skew-x-12 bg-white/15"
          initial={{ left: '-20%' }}
          animate={{ left: '120%' }}
          transition={{ duration: 0.9, delay: 0.2 }}
        />
      ) : null}
    </motion.div>
  )
}

/** Stack of Xbox-style "achievement unlocked" toasts at the bottom of the screen.
 * Under reduced motion the same toasts appear instantly (same titles, same
 * bodies, same timing) with no slide, pop or shine sweep.
 *
 * RF-11: every notice dismisses itself in <= 4 s (3.4 s timer in
 * `Interview.pushToast`) or with 1 interaction — a click anywhere on the
 * card, its close button, or the Escape key handled below.
 * RF-12: notices never capture focus; Escape yields to any open modal
 * dialog (tutorial, suggestion form, generic Modal), which keeps the
 * dialog the single owner of Escape while it is visible. */
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

  // RF-11: Escape dismisses the newest toast with a single keystroke.
  // Modal dialogs own Escape while they are open, so notices never
  // steal it from the tutorial, the suggestion form or Modal.
  useEffect(() => {
    if (toasts.length === 0) {
      return
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || document.querySelector('[role="dialog"]')) {
        return
      }
      onDismiss(toasts[toasts.length - 1].id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toasts, onDismiss])

  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[85] flex flex-col-reverse items-center gap-2 px-4 sm:bottom-6"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            dismissLabel={dismissLabel}
            onDismiss={onDismiss}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  )
}
