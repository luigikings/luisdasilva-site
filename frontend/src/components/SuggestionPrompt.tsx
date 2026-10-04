import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { FormEvent } from 'react'

import { useSound } from '../hooks/useSound'
import { useT } from '../hooks/useT'
import { ApiError, submitSuggestion } from '../lib/api'
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
    errorMessage: string
    validationMessage: string
  }>('suggestions')

  const { sfx } = useSound()
  const fx = useFx()
  const prefersReducedMotion = useReducedMotion()
  const submitRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  // Reset all form state on close so re-opening always starts fresh
  useEffect(() => {
    if (!isOpen) {
      setQuestion('')
      setCategory('')
      setStatus('idle')
      setMessage(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedQuestion = question.trim()
    const trimmedCategory = category.trim()

    // Client-side guard mirrors the 8-char minimum enforced by the backend schema
    if (trimmedQuestion.length < 8) {
      sfx.error()
      setMessage(copy.validationMessage)
      return
    }

    setStatus('loading')
    setMessage(null)

    try {
      await submitSuggestion({
        text: trimmedQuestion,
        category: trimmedCategory ? trimmedCategory : undefined,
        lang,
      })
      setStatus('success')
      setMessage(copy.successMessage)
      sfx.achievement()
      fx.burst(centerOf(submitRef.current), { count: 70, speed: 11, size: 8 })
    } catch (error) {
      console.error(error)
      // Prefer the server's error message when available for better user feedback
      const apiMessage =
        error instanceof ApiError &&
        typeof error.body === 'object' &&
        error.body &&
        'error' in error.body
          ? String((error.body as { error?: string }).error)
          : null
      setStatus('error')
      setMessage(apiMessage ?? copy.errorMessage)
      sfx.error()
    }
  }

  const inputClasses =
    'w-full rounded-xl border-2 border-line bg-abyss/80 px-4 py-3 text-base text-ink placeholder:text-muted/50 transition-colors focus:border-neonCyan focus:outline-none'

  return (
    <div className="mt-6 flex justify-center">
      <motion.button
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={() => setIsOpen(false)}
            >
              <motion.div
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

                {status === 'success' ? (
                  <motion.div
                    initial={
                      prefersReducedMotion ? undefined : { scale: 0.8, opacity: 0 }
                    }
                    animate={{ scale: 1, opacity: 1 }}
                    className="rounded-2xl border-2 border-neonLime bg-neonLime/10 p-5 text-center"
                  >
                    <p className="text-4xl">🎉</p>
                    <p className="mt-2 font-pixel text-[10px] uppercase text-neonLime">
                      {copy.successTitle}
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
                      <p
                        className={`text-right font-mono text-base ${question.trim().length >= 8 ? 'text-neonLime' : 'text-muted/60'}`}
                      >
                        {question.trim().length}/8+
                      </p>
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
                          exit={{ opacity: 0 }}
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
                        className="btn-arcade bg-neonPink text-ink"
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
