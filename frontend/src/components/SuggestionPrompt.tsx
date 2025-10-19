import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { useT } from '../hooks/useT'
import { ApiError, submitSuggestion } from '../lib/api'

export function SuggestionPrompt() {
  const { t } = useT()
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

  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

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

    if (trimmedQuestion.length < 8) {
      setMessage(copy.validationMessage)
      return
    }

    setStatus('loading')
    setMessage(null)

    try {
      await submitSuggestion({
        text: trimmedQuestion,
        category: trimmedCategory ? trimmedCategory : undefined,
      })
      setStatus('success')
      setMessage(copy.successMessage)
    } catch (error) {
      console.error(error)
      const apiMessage =
        error instanceof ApiError && typeof error.body === 'object' && error.body && 'error' in error.body
          ? String((error.body as { error?: string }).error)
          : null
      setStatus('error')
      setMessage(apiMessage ?? copy.errorMessage)
    }
  }

  return (
    <div className="mt-10 flex justify-center">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-full border border-highlight/60 bg-highlight/10 px-6 py-2 text-sm font-pixel uppercase tracking-[0.35em] text-highlight transition-colors hover:bg-highlight/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
      >
        {copy.buttonLabel}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">{copy.modalTitle}</h2>
                  <p className="mt-1 text-sm text-slate-400">{copy.modalDescription}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400 transition-colors hover:border-highlight hover:text-highlight"
                >
                  {copy.cancel}
                </button>
              </div>

              {status === 'success' ? (
                <div className="rounded-xl border border-highlight/50 bg-highlight/10 p-4 text-sm text-highlight">
                  <p className="font-semibold uppercase tracking-[0.2em]">{copy.successTitle}</p>
                  <p className="mt-2 text-highlight/90">{message}</p>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="rounded-full bg-highlight px-4 py-2 text-xs font-pixel uppercase tracking-[0.3em] text-charcoal"
                    >
                      OK
                    </button>
                  </div>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400" htmlFor="suggestion-question">
                      {copy.questionLabel}
                    </label>
                    <textarea
                      id="suggestion-question"
                      className="min-h-[120px] w-full resize-none rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 focus:border-highlight"
                      placeholder={copy.questionPlaceholder}
                      value={question}
                      onChange={(event) => setQuestion(event.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400" htmlFor="suggestion-category">
                      {copy.categoryLabel}
                    </label>
                    <input
                      id="suggestion-category"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 focus:border-highlight"
                      placeholder={copy.categoryPlaceholder}
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                    />
                  </div>

                  {message ? (
                    <p
                      className={`text-sm ${
                        status === 'error' ? 'text-red-400' : 'text-highlight'
                      }`}
                    >
                      {message}
                    </p>
                  ) : null}

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="rounded-full border border-slate-700 px-4 py-2 text-xs font-pixel uppercase tracking-[0.3em] text-slate-300 transition-colors hover:border-highlight hover:text-highlight"
                    >
                      {copy.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="rounded-full bg-highlight px-4 py-2 text-xs font-pixel uppercase tracking-[0.3em] text-charcoal transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {status === 'loading' ? 'Enviando…' : copy.submit}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default SuggestionPrompt
