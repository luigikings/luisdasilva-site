import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'

import { portfolioItems } from '../data/portfolio'
import { useT } from '../hooks/useT'
import { Modal } from './Modal'

type PortfolioGridProps = {
  onProjectOpen?: (id: string) => void
}

export function PortfolioGrid({ onProjectOpen }: PortfolioGridProps) {
  const { lang, t } = useT()
  const prefersReducedMotion = useReducedMotion()
  const [activeId, setActiveId] = useState<string | null>(null)

  const activeItem = portfolioItems.find((item) => item.id === activeId)

  const openItem = (id: string) => {
    setActiveId(id)
    onProjectOpen?.(id)
  }

  const closeModal = () => setActiveId(null)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {portfolioItems.map((item, index) => (
        <motion.button
          key={item.id}
          type="button"
          onClick={() => openItem(item.id)}
          className="group flex h-full flex-col justify-between rounded-pixel border border-slate-700/70 bg-slate-900/70 p-5 text-left shadow-lg transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : index * 0.05, duration: 0.4, ease: 'easeOut' }}
          aria-label={`${t('interview.responses.portfolio.modalCta')} ${item.title[lang]}`}
        >
          <div className="space-y-3">
            <h3 className="font-pixel text-sm uppercase tracking-[0.3em] text-highlight">
              {item.title[lang]}
            </h3>
            <p className="text-sm text-slate-200/90">{item.excerpt[lang]}</p>
          </div>
          <ul className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-wide text-slate-300">
            {item.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-slate-600/60 bg-slate-800/60 px-2 py-1"
              >
                {tag}
              </li>
            ))}
          </ul>
        </motion.button>
      ))}

      <Modal
        isOpen={Boolean(activeItem)}
        onClose={closeModal}
        title={activeItem ? activeItem.title[lang] : ''}
      >
        {activeItem ? (
          <div className="space-y-4">
            <p>{activeItem.details[lang]}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={activeItem.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-slate-600 bg-slate-800 px-4 py-2 text-xs uppercase tracking-wide text-slate-100 hover:bg-slate-700"
              >
                {t('common.github')}
              </a>
              {activeItem.demoUrl ? (
                <a
                  href={activeItem.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-highlight bg-highlight/10 px-4 py-2 text-xs uppercase tracking-wide text-highlight hover:bg-highlight/20"
                >
                  {t('common.demo')}
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
