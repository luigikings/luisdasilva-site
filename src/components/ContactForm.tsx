import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'

import type { FormEvent } from 'react'

import { useT } from '../hooks/useT'

type Errors = {
  name?: string
  email?: string
  message?: string
  success?: string
}

export function ContactForm() {
  const { t } = useT()
  const contactErrors = t<{ name: string; email: string; message: string; success: string }>('interview.contact.errors')
  const prefersReducedMotion = useReducedMotion()
  const [errors, setErrors] = useState<Errors>({})

  const validate = (form: HTMLFormElement) => {
    const formErrors: Errors = {}
    const formData = new FormData(form)
    const name = String(formData.get('name') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const message = String(formData.get('message') ?? '').trim()

    if (name.length < 2) {
      formErrors.name = contactErrors.name
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formErrors.email = contactErrors.email
    }
    if (message.length < 10) {
      formErrors.message = contactErrors.message
    }

    return formErrors
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault()
    } else {
      event.preventDefault()
      setErrors({ success: contactErrors.success })
    }
  }

  return (
    <motion.section
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mt-12 w-full rounded-pixel border border-slate-700/70 bg-slate-900/70 p-6 shadow-xl"
    >
      <div className="space-y-2">
        <h3 className="font-pixel text-sm uppercase tracking-[0.4em] text-highlight">{t('interview.contact.heading')}</h3>
        <p className="text-sm text-slate-200/80">{t('interview.contact.description')}</p>
        <p className="text-xs text-slate-400">{t('interview.contact.helper')}</p>
      </div>
      {/* Replace action="#" with your Formspree endpoint, e.g. https://formspree.io/f/xxxxxx */}
      <form
        action="#"
        method="POST"
        className="mt-6 grid gap-4 md:grid-cols-2"
        onSubmit={handleSubmit}
        noValidate
      >
        <label className="col-span-1 flex flex-col gap-2 text-left text-xs uppercase tracking-wide text-slate-300">
          {t('interview.contact.nameLabel')}
          <input
            type="text"
            name="name"
            required
            minLength={2}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
          />
          {errors.name ? (
            <span id="contact-name-error" className="text-[11px] text-red-400">
              {errors.name}
            </span>
          ) : null}
        </label>
        <label className="col-span-1 flex flex-col gap-2 text-left text-xs uppercase tracking-wide text-slate-300">
          {t('interview.contact.emailLabel')}
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
          />
          {errors.email ? (
            <span id="contact-email-error" className="text-[11px] text-red-400">
              {errors.email}
            </span>
          ) : null}
        </label>
        <label className="col-span-1 md:col-span-2 flex flex-col gap-2 text-left text-xs uppercase tracking-wide text-slate-300">
          {t('interview.contact.messageLabel')}
          <textarea
            name="message"
            required
            minLength={10}
            rows={4}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? 'contact-message-error' : undefined}
          />
          {errors.message ? (
            <span id="contact-message-error" className="text-[11px] text-red-400">
              {errors.message}
            </span>
          ) : null}
        </label>
        <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
          <motion.button
            type="submit"
            className="self-start rounded-pixel bg-highlight px-5 py-2 font-pixel text-xs uppercase tracking-[0.3em] text-charcoal shadow-pixel hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
          >
            {t('interview.contact.submit')}
          </motion.button>
          {errors.success ? (
            <span className="text-[11px] text-highlight">{errors.success}</span>
          ) : null}
        </div>
      </form>
    </motion.section>
  )
}
