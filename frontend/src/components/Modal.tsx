import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

import { useT } from '../hooks/useT'

type ModalProps = {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * Accessible modal dialog rendered into document.body via a portal.
 *
 * Accessibility features:
 * - Focus is moved to the close button when the modal opens
 * - Tab key cycles only within the modal (focus trap) to prevent background interaction
 * - Escape key closes the modal
 * - body overflow is set to hidden while open to prevent scroll bleed
 */
export function Modal({ isOpen, title, onClose, children }: ModalProps) {
  const { t } = useT()
  const prefersReducedMotion = useReducedMotion()
  // Stable ID ties the heading to aria-labelledby without manual string management
  const headingId = useId()
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
      if (event.key === 'Tab') {
        // Collect all focusable elements inside the modal to cycle between them
        const focusable = overlayRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (!focusable || focusable.length === 0) {
          return
        }
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault()
            last.focus()
          }
        } else if (document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      // Restore the previous overflow value rather than blindly clearing it
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onClose])

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a160a]/50 px-4 py-8"
          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={onClose}
        >
          {/* stopPropagation prevents overlay click from closing the modal when clicking inside */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-pixel border border-[#d8c39a] bg-cream p-6 shadow-2xl"
            initial={prefersReducedMotion ? undefined : { y: 20, opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { y: 0, opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { y: 20, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id={headingId} className="font-sans text-base font-bold tracking-wide text-charcoal">
                {title}
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label={t('common.close')}
                className="rounded-full border border-[#d8c39a] bg-creamPanel px-3 py-1 text-xs uppercase tracking-wide text-charcoal hover:bg-[#e8d5ab]"
              >
                {t('common.close')}
              </button>
            </div>
            <div className="mt-4 space-y-4 text-left text-sm text-charcoal/80">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
