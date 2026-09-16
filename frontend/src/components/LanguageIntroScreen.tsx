import { motion, useReducedMotion } from 'framer-motion'
import { useMemo, useState } from 'react'

import { dict, type Language } from '../i18n/dict'
import { useT } from '../hooks/useT'

const languageOrder: Language[] = ['en', 'es']

/**
 * First screen the visitor sees — lets them pick ES or EN before the experience begins.
 * The selection is previewed locally until confirmed, so copy updates reactively
 * without committing to the global language context yet.
 */
export function LanguageIntroScreen({ onConfirm }: { onConfirm: () => void }) {
  const prefersReducedMotion = useReducedMotion()
  const { lang, setLang } = useT()
  const [selected, setSelected] = useState<Language>(lang)

  // Read copy directly from the dict for the previewed language, not the context language
  const copy = useMemo(() => dict[selected].languageIntro, [selected])

  const handleConfirm = () => {
    setLang(selected)
    onConfirm()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-4 text-center">
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-bold tracking-wide text-charcoal drop-shadow-sm">
          {copy.title}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-6">
          {languageOrder.map((code, index) => {
            const isActive = selected === code
            return (
              <motion.button
                key={code}
                type="button"
                onClick={() => setSelected(code)}
                className={`rounded-3xl border-2 p-4 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
                  isActive
                    ? 'border-highlight bg-highlight/20 shadow-pixel'
                    : 'border-[#d8c39a] bg-creamPanel/60 hover:border-highlight/60'
                }`}
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: prefersReducedMotion ? 0 : 0.15 + index * 0.1 }}
                aria-pressed={isActive}
              >
                <img
                  src={`/imgs/languages/lang_${code}.png`}
                  alt={dict[code].common.languageName}
                  className="h-20 w-20"
                />
                <span className="mt-3 block font-sans text-xs font-semibold uppercase tracking-wide text-charcoal">
                  {dict[code].common.languageName}
                </span>
              </motion.button>
            )
          })}
        </div>

        <motion.button
          type="button"
          onClick={handleConfirm}
          className="rounded-pixel bg-highlight px-10 py-3 font-sans text-sm font-bold tracking-wide text-charcoal shadow-pixel transition-all duration-300 hover:-translate-y-1 hover:bg-highlight/90 hover:shadow-[0_0_18px_rgba(207,154,74,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: prefersReducedMotion ? 0 : 0.4 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
        >
          {copy.confirm}
        </motion.button>
      </motion.div>
    </div>
  )
}