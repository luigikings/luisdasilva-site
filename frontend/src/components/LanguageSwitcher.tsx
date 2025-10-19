import { motion } from 'framer-motion'

import { dict, type Language } from '../i18n/dict'
import { useT } from '../hooks/useT'

const languages: Language[] = ['es', 'en']

export function LanguageSwitcher() {
  const { lang, setLang, t } = useT()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 140, damping: 12 }}
      className="fixed right-4 top-4 z-50"
    >
      <div
        role="group"
        aria-label={t('common.languageLabel')}
        className="flex items-center gap-2 rounded-full border border-slate-600/60 bg-slate-900/60 px-2 py-1 backdrop-blur-sm"
      >
        {languages.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={lang === code}
            aria-label={dict[code].common.languageName}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal ${
              lang === code
                ? 'bg-highlight shadow-pixel'
                : 'bg-slate-800/80 hover:bg-slate-700/80'
            }`}
          >
            <img
              src={`/imgs/languages/lang_${code}.png`}
              alt={dict[code].common.languageName}
              className="h-6 w-6"
            />
            <span className="sr-only">{dict[code].common.languageName}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}
