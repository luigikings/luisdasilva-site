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

type EmailSendResult = {
  emailSent: boolean;
  error: string | null;
};

const FROM = process.env.EMAIL_FROM || 'LuisDaSilvaDev <noreply@luisdasilvadev.com>';

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

export async function sendSuggestionEmail(payload: SuggestionEmailPayload): Promise<EmailSendResult> {
  if (!isResendConfigured()) {
    return {
      emailSent: false,
      error: 'RESEND_API_KEY is missing.',
    };
  }

  const toAddress = env.SUGGESTION_EMAIL_TO;
  const subject = payload.lang === 'en' ? 'Suggest Question' : 'Pregunta sugerida';

  try {
    await resend.emails.send({
      from: FROM,
      to: toAddress,
      subject,
      html: buildSuggestionEmailHtml(payload),
    });

    return {
      emailSent: true,
      error: null,
    };
  } catch (error) {
    console.error('Resend email error:', error);
    return {
      emailSent: false,
      error: String((error as { message?: string })?.message || error),
    };
  }
}

export async function sendDoorEntryEmail(payload: DoorEntryEmailPayload = {}): Promise<EmailSendResult> {
  if (!isResendConfigured()) {
    return {
      emailSent: false,
      error: 'RESEND_API_KEY is missing.',
    };
  }

  const toAddress = env.SUGGESTION_EMAIL_TO;
  const subject = payload.lang === 'en' ? 'A user has entered' : 'Un usuario ha entrado';
  const body = payload.lang === 'en' ? 'A user has entered' : 'Un usuario ha entrado';

  try {
    await resend.emails.send({
      from: FROM,
      to: toAddress,
      subject,
      html: `<p>${body}</p>`,
    });

    return {
      emailSent: true,
      error: null,
    };
  } catch (error) {
    console.error('Resend email error:', error);
    return {
      emailSent: false,
      error: String((error as { message?: string })?.message || error),
    };
  }
}
