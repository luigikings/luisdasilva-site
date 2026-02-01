import nodemailer from 'nodemailer';

import { env } from '../env.js';

type SuggestionEmailPayload = {
  text: string;
  category?: string | null;
  lang?: 'es' | 'en';
};

const DEFAULT_RECIPIENT = 'luigidasilv@gmail.com';

function getTransportConfig() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    throw new Error('SMTP configuration is missing for suggestion emails.');
  }

  const port = env.SMTP_PORT ?? 587;

  return {
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  };
}

function buildEmailBody({ text, category, lang }: SuggestionEmailPayload) {
  const labels =
    lang === 'en'
      ? { question: 'Question', category: 'Category' }
      : { question: 'Pregunta', category: 'Categoría' };

  const categoryValue = category?.trim() ? category.trim() : lang === 'en' ? 'Unspecified' : 'Sin categoría';

  return `${labels.question}: ${text}\n${labels.category}: ${categoryValue}`;
}

export async function sendSuggestionEmail(payload: SuggestionEmailPayload) {
  const transport = nodemailer.createTransport(getTransportConfig());
  const subject = payload.lang === 'en' ? 'Suggest Question' : 'Pregunta sugerida';
  const fromAddress = env.SMTP_FROM ?? env.SMTP_USER ?? DEFAULT_RECIPIENT;
  const toAddress = env.SUGGESTION_EMAIL_TO ?? DEFAULT_RECIPIENT;

  await transport.sendMail({
    from: fromAddress,
    to: toAddress,
    subject,
    text: buildEmailBody(payload),
  });
}
