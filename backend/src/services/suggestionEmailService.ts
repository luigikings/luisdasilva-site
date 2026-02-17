import { Resend } from 'resend';

import { env } from '../env.js';

type SuggestionEmailPayload = {
  text: string;
  category?: string | null;
  lang?: 'es' | 'en';
};

type DoorEntryEmailPayload = {
  lang?: 'es' | 'en';
};

const DEFAULT_RECIPIENT = 'luigidasilv@gmail.com';

const resend = new Resend(process.env.RESEND_API_KEY);

function isResendConfigured() {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing; skipping email send.');
    return false;
  }

  return true;
}

function buildSuggestionEmailHtml({ text, category, lang }: SuggestionEmailPayload) {
  const labels =
    lang === 'en'
      ? { question: 'Question', category: 'Category' }
      : { question: 'Pregunta', category: 'Categoría' };

  const categoryValue = category?.trim() ? category.trim() : lang === 'en' ? 'Unspecified' : 'Sin categoría';

  return `<p><strong>${labels.question}:</strong> ${text}</p><p><strong>${labels.category}:</strong> ${categoryValue}</p>`;
}

export async function sendSuggestionEmail(payload: SuggestionEmailPayload): Promise<boolean> {
  if (!isResendConfigured()) {
    return false;
  }

  const fromAddress = env.SMTP_FROM ?? DEFAULT_RECIPIENT;
  const toAddress = env.SUGGESTION_EMAIL_TO ?? DEFAULT_RECIPIENT;
  const subject = payload.lang === 'en' ? 'Suggest Question' : 'Pregunta sugerida';

  try {
    await resend.emails.send({
      from: fromAddress,
      to: toAddress,
      subject,
      html: buildSuggestionEmailHtml(payload),
    });

    return true;
  } catch (error) {
    console.error('Failed to send suggestion email with Resend:', error);
    return false;
  }
}

export async function sendDoorEntryEmail(payload: DoorEntryEmailPayload = {}): Promise<boolean> {
  if (!isResendConfigured()) {
    return false;
  }

  const fromAddress = env.SMTP_FROM ?? DEFAULT_RECIPIENT;
  const toAddress = env.SUGGESTION_EMAIL_TO ?? DEFAULT_RECIPIENT;
  const subject = payload.lang === 'en' ? 'A user has entered' : 'Un usuario ha entrado';
  const body = payload.lang === 'en' ? 'A user has entered' : 'Un usuario ha entrado';

  try {
    await resend.emails.send({
      from: fromAddress,
      to: toAddress,
      subject,
      html: `<p>${body}</p>`,
    });

    return true;
  } catch (error) {
    console.error('Failed to send door entry email with Resend:', error);
    return false;
  }
}
