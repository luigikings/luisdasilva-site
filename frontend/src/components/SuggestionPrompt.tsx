import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { FormEvent } from 'react'

import { useSound } from '../hooks/useSound'
import { useT } from '../hooks/useT'
import { dict, type Language } from '../i18n/dict'
import { submitSuggestion } from '../lib/api'
import { resolveSuggestionOutcome } from '../lib/suggestionOutcome'
import { centerOf, useFx } from './fx/FxProvider'

/**
 * Floating button + inline modal that lets visitors suggest new interview questions.
 * The form resets every time the modal closes so stale input or error state never
 * bleeds into the next open.
 */
export function SuggestionPrompt() {
  const { t, lang } = useT()
  const copy = t<{
    buttonLabel: string
    modalTitle: string
    modalDescription: string
    questionLabel: string
    questionPlaceholder: string
    categoryLabel: string
    categoryPlaceholder: string
    cancel: string
    submit: string
    successTitle: string
    successMessage: string
    degradedMessage: string
    errorMessage: string
    validationMessage: string
    questionTooLongMessage: string
    categoryTooLongMessage: string
  }>('suggestions')

  const { sfx } = useSound()
  const fx = useFx()
  const prefersReducedMotion = useReducedMotion()
  const submitRef = useRef<HTMLButtonElement>(null)
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const questionRef = useRef<HTMLTextAreaElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'degraded' | 'error'
  >('idle')
  const [message, setMessage] = useState<string | null>(null)
  // Language frozen at submit time (EN fallback): the visible notice never
  // changes on a later language switch (spec 005 RF-7).
  const [noticeLang, setNoticeLang] = useState<Language>('en')

  // Reset all form state on close so re-opening always starts fresh
  useEffect(() => {
    if (!isOpen) {
      setQuestion('')
      setCategory('')
      setStatus('idle')
      setMessage(null)
      setNoticeLang('en')
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }
    // RF-21: move focus into the dialog on open and return it to the
    // opener on close, so keyboard visitors never lose their place.
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    questionRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        return
      }
      if (event.key === 'Tab') {
        // Keep Tab cycling inside the dialog while it is open.
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
        )
        if (!focusable || focusable.length === 0) return
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

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus({ preventScroll: true })
    }
  }, [isOpen])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedQuestion = question.trim()
    const trimmedCategory = category.trim()
    // Freeze the active language at submit time; anything indeterminate
    // falls back to EN so every notice is generated in a single language.
    const submitLang: Language = lang === 'es' ? 'es' : 'en'

    // Client-side guard mirrors the 8-char minimum enforced by the backend schema
    if (trimmedQuestion.length < 8) {
      sfx.error()
      setMessage(dict[submitLang].suggestions.validationMessage)
      return
    }

    // Client-side guards mirror the backend size caps (spec 006 RF-3, RF-4):
    // validated on the trimmed value, message frozen in the submit language
    // (spec 005 convention) and no network request when over the cap (RF-6).
    if (trimmedQuestion.length > 1000) {
      sfx.error()
      setMessage(dict[submitLang].suggestions.questionTooLongMessage)
      return
    }
    if (trimmedCategory.length > 100) {
      sfx.error()
      setMessage(dict[submitLang].suggestions.categoryTooLongMessage)
      return
    }

    setStatus('loading')
    setMessage(null)

    try {
      const result = await submitSuggestion({
        text: trimmedQuestion,
        category: trimmedCategory ? trimmedCategory : undefined,
        lang,
      })
      // Describe the raw payload shape for the pure outcome resolver:
      // only a JSON object with a boolean `emailSent` can be success or
      // degraded — anything else (empty, text or missing flag) is an error.
      // The technical `error` detail is never passed on to the view (RF-4).
      const raw: unknown = result
      const outcome = resolveSuggestionOutcome({
        emailSent:
          typeof raw === 'object' && raw !== null
            ? (raw as { emailSent?: unknown }).emailSent as boolean | undefined
            : undefined,
        hasBody: raw !== undefined && raw !== null,
        isJson: typeof raw === 'object' && raw !== null,
      })
      if (outcome === 'error') {
        setStatus('error')
        setNoticeLang(submitLang)
        setMessage(dict[submitLang].suggestions.errorMessage)
        sfx.error()
        return
      }
      if (outcome === 'degraded') {
        setStatus('degraded')
        setNoticeLang(submitLang)
        setMessage(dict[submitLang].suggestions.degradedMessage)
      } else {
        setStatus('success')
        setNoticeLang(submitLang)
        setMessage(dict[submitLang].suggestions.successMessage)
      }
      sfx.achievement()
      fx.burst(centerOf(submitRef.current), { count: 70, speed: 11, size: 8 })
    } catch (error) {
      console.error(error)
      // Any rejection (400/500/network): the current error notice in the
      // frozen language. Server details never reach the visible message.
      setStatus('error')
      setNoticeLang(submitLang)
      setMessage(dict[submitLang].suggestions.errorMessage)
      sfx.error()
    }
  }

  const inputClasses =
    'w-full rounded-xl border-2 border-[#6a5bb0] bg-abyss/80 px-4 py-3 text-base text-ink placeholder:text-muted transition-colors focus:border-neonCyan focus:outline-none'

  return (
    <div className="mt-6 flex justify-center">
      <motion.button
        ref={openButtonRef}
        type="button"
        onClick={() => {
          sfx.select()
          setIsOpen(true)
        }}
        onPointerEnter={() => sfx.hover()}
        className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-neonPink/70 bg-neonPink/10 px-6 py-4 font-pixel text-[10px] uppercase text-ink transition-colors hover:border-solid hover:bg-neonPink/20"
        whileHover={prefersReducedMotion ? undefined : { scale: 1.04, rotate: -1 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
      >
        <span className="mr-2 inline-block transition-transform duration-300 group-hover:rotate-[20deg] group-hover:scale-125">
          💡
        </span>
        {copy.buttonLabel}
      </motion.button>

      {/* Portal keeps the modal above the FX canvas regardless of ancestor stacking contexts */}
      {createPortal(
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              key="modal"
              className="fixed inset-0 z-[80] flex items-center justify-center bg-abyss/80 px-4 backdrop-blur-md"
              initial={prefersReducedMotion ? undefined : { opacity: 0 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="suggestion-title"
                className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-neonPink bg-panel p-6 shadow-neon-pink"
                initial={
                  prefersReducedMotion
                    ? undefined
                    : { opacity: 0, y: 40, scale: 0.9, rotateX: 20 }
                }
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { opacity: 1, y: 0, scale: 1, rotateX: 0 }
                }
                exit={
                  prefersReducedMotion ? undefined : { opacity: 0, y: 30, scale: 0.95 }
                }
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                onClick={(event) => event.stopPropagation()}
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1.5 animate-shimmer bg-[linear-gradient(90deg,#22e4ff,#9b5cff,#ff3ea5,#ffd23f,#22e4ff)] bg-[length:200%_100%] motion-reduce:animate-none"
                />
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2
                      id="suggestion-title"
                      className="font-pixel text-xs leading-relaxed text-ink"
                    >
                      💡 {copy.modalTitle}
                    </h2>
                    <p className="mt-2 text-sm text-muted">{copy.modalDescription}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label={copy.cancel}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-line font-pixel text-[10px] text-muted transition-colors hover:border-danger hover:text-danger"
                  >
                    ✕
                  </button>
                </div>

                {status === 'success' || status === 'degraded' ? (
                  <motion.div
                    initial={
                      prefersReducedMotion ? undefined : { scale: 0.8, opacity: 0 }
                    }
                    animate={prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }}
                    className="rounded-2xl border-2 border-neonLime bg-neonLime/10 p-5 text-center"
                  >
                    <p className="text-4xl">🎉</p>
                    <p className="mt-2 font-pixel text-[10px] uppercase text-neonLime">
                      {dict[noticeLang].suggestions.successTitle}
                    </p>
                    <p className="mt-2 text-sm text-ink/80">{message}</p>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="btn-arcade mt-4 bg-neonLime"
                    >
                      OK
                    </button>
                  </motion.div>
                ) : (
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <label
                        className="font-pixel text-[8px] uppercase text-neonCyan"
                        htmlFor="suggestion-question"
                      >
                        {copy.questionLabel}
                      </label>
                      <textarea
                        ref={questionRef}
                        id="suggestion-question"
                        className={`${inputClasses} min-h-[120px] resize-none`}
                        placeholder={copy.questionPlaceholder}
                        value={question}
                        onChange={(event) => {
                          setQuestion(event.target.value)
                          if (event.target.value.length % 4 === 0) sfx.blip(1.4)
                        }}
                        required
                      />
                      {/* Always-visible size counters (spec 006 RF-6): lengths are
                          measured on the trimmed value, like the backend caps. */}
                      <div className="flex items-center justify-between font-mono text-base">
                        <p
                          className={`${question.trim().length >= 8 ? 'text-neonLime' : 'text-muted'}`}
                        >
                          {question.trim().length}/8+
                        </p>
                        <p
                          className={`${question.trim().length > 1000 ? 'text-danger' : 'text-muted'}`}
                        >
                          {question.trim().length}/1000
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        className="font-pixel text-[8px] uppercase text-neonCyan"
                        htmlFor="suggestion-category"
                      >
                        {copy.categoryLabel}
                      </label>
                      <input
                        id="suggestion-category"
                        className={inputClasses}
                        placeholder={copy.categoryPlaceholder}
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                      />
                      <p
                        className={`text-right font-mono text-base ${category.trim().length > 100 ? 'text-danger' : 'text-muted'}`}
                      >
                        {category.trim().length}/100
                      </p>
                    </div>

                    <AnimatePresence>
                      {message ? (
                        <motion.p
                          initial={
                            prefersReducedMotion ? undefined : { opacity: 0, x: -10 }
                          }
                          animate={
                            prefersReducedMotion
                              ? undefined
                              : { opacity: 1, x: [0, -6, 6, 0] }
                          }
                          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                          className={`text-sm ${status === 'error' || status === 'idle' ? 'text-danger' : 'text-neonCyan'}`}
                        >
                          {message}
                        </motion.p>
                      ) : null}
                    </AnimatePresence>

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="btn-arcade bg-panelHi text-ink"
                      >
                        {copy.cancel}
                      </button>
                      <button
                        ref={submitRef}
                        type="submit"
                        disabled={status === 'loading'}
                        className="btn-arcade bg-neonPink text-night"
                      >
                        {status === 'loading'
                          ? lang === 'es'
                            ? 'Enviando…'
                            : 'Sending…'
                          : `${copy.submit} ▶`}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}

export default SuggestionPrompt
