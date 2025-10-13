import { motion, useReducedMotion } from 'framer-motion'
import { useMemo, useState } from 'react'

import { dict, type Language } from '../i18n/dict'
import { useT } from '../hooks/useT'

const languageOrder: Language[] = ['en', 'es']

export function LanguageIntroScreen({ onConfirm }: { onConfirm: () => void }) {
  const prefersReducedMotion = useReducedMotion()
  const { lang, setLang } = useT()
  const [selected, setSelected] = useState<Language>(lang)

  const copy = useMemo(() => dict[selected].languageIntro, [selected])

  const handleConfirm = () => {
    setLang(selected)
    onConfirm()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-4 text-center">
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-bold uppercase tracking-[0.35em] text-highlight drop-shadow">
          {copy.title}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-6">
          {languageOrder.map((code) => {
            const isActive = selected === code
            return (
              <button
                key={code}
                type="button"
                onClick={() => setSelected(code)}
                className={`rounded-3xl border-2 p-4 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal ${
                  isActive
                    ? 'border-highlight bg-highlight/20 shadow-pixel'
                    : 'border-slate-700/80 bg-slate-900/60 hover:border-highlight/60'
                }`}
                aria-pressed={isActive}
              >
                <img
                  src={`/imgs/languages/lang_${code}.png`}
                  alt={dict[code].common.languageName}
                  className="h-20 w-20"
                />
                <span className="mt-3 block font-pixel text-xs uppercase tracking-[0.3em] text-slate-100">
                  {dict[code].common.languageName}
                </span>
              </button>
            )
          })}
        </div>

        <motion.button
          type="button"
          onClick={handleConfirm}
          className="rounded-pixel bg-highlight px-10 py-3 font-pixel text-sm uppercase tracking-[0.45em] text-charcoal shadow-pixel transition-all duration-200 hover:-translate-y-1 hover:bg-highlight/90 hover:shadow-[0_0_18px_rgba(255,241,208,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
          initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
        >
          {copy.confirm}
        </motion.button>
      </motion.div>
    </div>
  )
}
