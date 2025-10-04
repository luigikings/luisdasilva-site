import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { dict, type Language } from '../i18n/dict'

type LanguageContextValue = {
  lang: Language
  setLang: (lang: Language) => void
  t: <T = unknown>(path: string) => T
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

const STORAGE_KEY = 'pixel-interrogatorio-lang'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window === 'undefined') {
      return 'es'
    }
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'en' || stored === 'es' ? stored : 'es'
  })

  const setLang = (value: Language) => {
    setLangState(value)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, value)
    }
  }

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
    }
  }, [lang])

  const value = useMemo<LanguageContextValue>(() => {
    const t = <T = unknown>(path: string): T => {
      const segments = path.split('.')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: any = dict[lang]
      for (const segment of segments) {
        if (result && typeof result === 'object' && segment in result) {
          result = result[segment as keyof typeof result]
        } else {
          if (import.meta.env.DEV) {
            console.warn(`Missing translation for path: ${path}`)
          }
          return path as unknown as T
        }
      }
      return result as T
    }

    return {
      lang,
      setLang,
      t,
    }
  }, [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useT() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useT must be used within a LanguageProvider')
  }
  return context
}
