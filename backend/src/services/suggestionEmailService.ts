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
  const categoryValue = category?.trim() ? category.trim() : lang === 'en' ? 'Unspecified' : 'Sin categoría';

  if (lang !== 'en') {
    return `<p>Tienes la siguiente Sugerencia de pregunta:</p><p>Pregunta: ${text}</p><p>Categoria: ${categoryValue}</p>`;
  }

  return `<p><strong>Question:</strong> ${text}</p><p><strong>Category:</strong> ${categoryValue}</p>`;
}

export async function sendSuggestionEmail(payload: SuggestionEmailPayload): Promise<EmailSendResult> {
  if (!isResendConfigured()) {
    return {
      emailSent: false,
      error: 'RESEND_API_KEY is missing.',
    };
  }

  const toAddress = env.SUGGESTION_EMAIL_TO;
  const subject = payload.lang === 'en' ? 'Suggest Question' : 'Te han sugerido una Pregunta';

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
  const subject = payload.lang === 'en' ? 'A user has entered' : 'Has entrado a una entrevista!';
  const body = payload.lang === 'en' ? 'A user has entered' : 'Un usuario te ha dejado pasar para la entrevista!';

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
