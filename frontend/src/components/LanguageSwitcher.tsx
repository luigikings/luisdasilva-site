import { motion } from 'framer-motion'

import { dict, type Language } from '../i18n/dict'
import { useSound } from '../hooks/useSound'
import { useT } from '../hooks/useT'

const languages: Language[] = ['es', 'en']

/** Fixed top-right HUD: language flags + 8-bit sound toggle, available on every view after the first */
export function LanguageSwitcher({ showLanguages = true }: { showLanguages?: boolean }) {
  const { lang, setLang, t } = useT()
  const { muted, toggleMuted, sfx } = useSound()

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed right-3 top-3 z-50 flex items-center gap-2 sm:right-4 sm:top-4"
    >
      {showLanguages ? (
        <div
          role="group"
          aria-label={t('common.languageLabel')}
          className="flex items-center gap-1 rounded-full border-2 border-line bg-abyss/80 p-1 backdrop-blur-md"
        >
          {languages.map((code) => {
            const active = lang === code
            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  if (!active) sfx.select()
                  setLang(code)
                }}
                aria-pressed={active}
                aria-label={dict[code].common.languageName}
                className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
                  active ? '' : 'opacity-60 hover:scale-110 hover:opacity-100'
                }`}
              >
                {active ? (
                  <motion.span
                    layoutId="lang-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-neonCyan to-neonPurple shadow-neon"
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  />
                ) : null}
                <img
                  src={`/imgs/languages/lang_${code}.png`}
                  alt=""
                  className="relative h-6 w-6"
                />
              </button>
            )
          })}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          toggleMuted()
          // Play a confirmation beep when turning sound back on
          if (muted) window.setTimeout(() => sfx.select(), 0)
        }}
        aria-pressed={!muted}
        aria-label={muted ? t('common.soundOn') : t('common.soundOff')}
        title={muted ? t('common.soundOn') : t('common.soundOff')}
        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-line bg-abyss/80 text-lg backdrop-blur-md transition-colors hover:border-neonCyan"
      >
        <SpeakerIcon muted={muted} />
      </button>
    </motion.div>
  )
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 12 12" width="20" height="20" shapeRendering="crispEdges" aria-hidden>
      <rect x="1" y="4" width="2" height="4" fill="#f4f1ff" />
      <rect x="3" y="3" width="1" height="6" fill="#f4f1ff" />
      <rect x="4" y="2" width="1" height="8" fill="#f4f1ff" />
      <rect x="5" y="1" width="1" height="10" fill="#f4f1ff" />
      {muted ? (
        <>
          <rect x="7" y="4" width="1" height="1" fill="#ff4d5e" />
          <rect x="8" y="5" width="1" height="1" fill="#ff4d5e" />
          <rect x="9" y="6" width="1" height="1" fill="#ff4d5e" />
          <rect x="10" y="7" width="1" height="1" fill="#ff4d5e" />
          <rect x="10" y="4" width="1" height="1" fill="#ff4d5e" />
          <rect x="9" y="5" width="1" height="1" fill="#ff4d5e" />
          <rect x="7" y="7" width="1" height="1" fill="#ff4d5e" />
          <rect x="8" y="6" width="1" height="1" fill="#ff4d5e" />
        </>
      ) : (
        <>
          <rect x="7" y="4" width="1" height="4" fill="#22e4ff" />
          <rect x="9" y="2" width="1" height="8" fill="#ff3ea5" />
        </>
      )}
    </svg>
  )
}
