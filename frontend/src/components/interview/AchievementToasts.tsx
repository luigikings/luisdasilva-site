import { AnimatePresence, motion } from 'framer-motion'
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

/** Stack of Xbox-style "achievement unlocked" toasts at the top of the screen */
export function AchievementToasts({ toasts }: { toasts: Toast[] }) {
  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[85] flex flex-col-reverse items-center gap-2 px-4 sm:bottom-6"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 40, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className={`relative flex w-full max-w-sm items-center gap-3 overflow-hidden rounded-2xl border-2 bg-abyss/95 px-4 py-3 backdrop-blur-md ${toneStyles[toast.tone]}`}
          >
            <motion.span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-panelHi text-2xl"
              initial={{ rotate: -30, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.1 }}
            >
              {toast.icon}
            </motion.span>
            <div className="min-w-0 text-left">
              <p className="font-pixel text-[9px] leading-relaxed text-ink">{toast.title}</p>
              <p className="truncate text-sm text-muted">{toast.body}</p>
            </div>
            {/* Shine sweep */}
            <motion.span
              aria-hidden
              className="absolute inset-y-0 w-16 -skew-x-12 bg-white/15"
              initial={{ left: '-20%' }}
              animate={{ left: '120%' }}
              transition={{ duration: 0.9, delay: 0.2 }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  )
}
