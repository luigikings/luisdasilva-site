import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'

import { track } from '../lib/analytics'
import { ContactForm } from './ContactForm'
import { PortfolioGrid } from './PortfolioGrid'
import { useT } from '../hooks/useT'
import type { QuestionKey } from '../i18n/dict'

type InterviewProps = {
  onBack: () => void
}

export function Interview({ onBack }: InterviewProps) {
  const { t, lang } = useT()
  const prefersReducedMotion = useReducedMotion()
  const questionEntries = Object.entries(
    t<Record<QuestionKey, string>>('interview.questions'),
  ) as [QuestionKey, string][]
  const responses = t<{
    who: { heading: string; body: string }
    stack: { heading: string; intro: string; items: string[] }
    jokes: { heading: string; intro: string; items: string[] }
    cv: { heading: string; body: string }
    portfolio: { heading: string; body: string; modalCta: string }
  }>('interview.responses')
  const [selected, setSelected] = useState<QuestionKey | null>(null)

  const handleSelect = (key: QuestionKey) => {
    setSelected(key)
    track('interview_question_selected', { key, lang })
  }

  const renderResponse = () => {
    if (!selected) {
      return (
        <p className="text-sm text-slate-300">{t('interview.selectPrompt')}</p>
      )
    }

    switch (selected) {
      case 'who':
        return (
          <div className="space-y-4 text-left">
            <h3 className="font-pixel text-sm uppercase tracking-[0.4em] text-highlight">
              {responses.who.heading}
            </h3>
            <p className="text-sm leading-relaxed text-slate-100">{responses.who.body}</p>
          </div>
        )
      case 'stack':
        return (
          <div className="space-y-4 text-left">
            <h3 className="font-pixel text-sm uppercase tracking-[0.4em] text-highlight">
              {responses.stack.heading}
            </h3>
            <p className="text-sm text-slate-200/90">{responses.stack.intro}</p>
            <ul className="space-y-2 text-sm text-slate-100">
              {responses.stack.items.map((item: string) => (
                <li key={item} className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-1 h-2 w-2 rounded-full bg-highlight" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      case 'joke':
        return (
          <div className="space-y-4 text-left">
            <h3 className="font-pixel text-sm uppercase tracking-[0.4em] text-highlight">
              {responses.jokes.heading}
            </h3>
            <p className="text-sm text-slate-200/90">{responses.jokes.intro}</p>
            <ul className="space-y-2 text-sm text-slate-100">
              {responses.jokes.items.map((item: string) => (
                <li key={item} className="rounded-xl border border-slate-700/60 bg-slate-800/60 p-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )
      case 'cv':
        return (
          <div className="space-y-4 text-left">
            <h3 className="font-pixel text-sm uppercase tracking-[0.4em] text-highlight">
              {responses.cv.heading}
            </h3>
            <p className="text-sm text-slate-200/90">{responses.cv.body}</p>
            <a
              href="/LK_CV.pdf"
              download
              className="inline-flex items-center gap-2 self-start rounded-pixel border border-highlight bg-highlight/10 px-5 py-2 font-pixel text-xs uppercase tracking-[0.3em] text-highlight shadow-pixel hover:bg-highlight/20"
            >
              {t('common.download')}
            </a>
          </div>
        )
      case 'portfolio':
        return (
          <div className="space-y-6 text-left">
            <div className="space-y-3">
              <h3 className="font-pixel text-sm uppercase tracking-[0.4em] text-highlight">
                {responses.portfolio.heading}
              </h3>
              <p className="text-sm text-slate-200/90">{responses.portfolio.body}</p>
            </div>
            <PortfolioGrid onProjectOpen={(id) => track('portfolio_open', { id, lang })} />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <section className="relative flex min-h-screen flex-col gap-8 px-4 py-10 md:px-12">
      <button
        type="button"
        onClick={onBack}
        className="self-start rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs uppercase tracking-wide text-slate-200 hover:bg-slate-800"
      >
        {t('common.back')}
      </button>

      <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
        <motion.div
          role="img"
          aria-label={t('interview.avatarAlt')}
          className="relative h-48 w-48 rounded-pixel border-4 border-slate-700 bg-slate-900 shadow-pixel"
          initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        >
          <div className="absolute inset-[10%] rounded-[22px] border-4 border-slate-800 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="h-12 w-12 rounded-lg border-4 border-slate-900 bg-highlight" />
            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full bg-slate-200" />
              <span className="h-3 w-3 rounded-full bg-slate-200" />
            </div>
            <div className="h-1.5 w-16 rounded-full bg-slate-300" />
          </div>
        </motion.div>
        <div className="space-y-3 text-center md:text-left">
          <h1 className="font-pixel text-lg uppercase tracking-[0.5em] text-highlight">
            {t('interview.title')}
          </h1>
          <p className="max-w-xl text-sm text-slate-300">{t('interview.subtitle')}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,280px)_1fr]">
        <div className="flex flex-col gap-3">
          {questionEntries.map(([key, label], index) => (
            <motion.button
              key={key}
              type="button"
              onClick={() => handleSelect(key)}
              className={`rounded-pixel border px-4 py-3 text-left text-sm uppercase tracking-[0.2em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal ${
                selected === key
                  ? 'border-highlight bg-highlight/20 text-highlight'
                  : 'border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800/70'
              }`}
              initial={prefersReducedMotion ? undefined : { opacity: 0, x: -10 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : 0.05 * index }}
              aria-pressed={selected === key}
            >
              {label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selected ?? 'idle'}
            className="min-h-[260px] rounded-pixel border border-slate-700/70 bg-slate-900/70 p-6 shadow-inner"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 15 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {renderResponse()}
          </motion.div>
        </AnimatePresence>
      </div>

      <ContactForm />

      <footer className="mt-auto text-center text-xs text-slate-500">
        {t('footer.text')}
      </footer>
    </section>
  )
}
