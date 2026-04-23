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

// Read at module-init time; EMAIL_FROM falls back to a branded noreply address
const FROM = env.EMAIL_FROM ?? 'LuisDaSilvaDev <noreply@luisdasilvadev.com>';

// Resend client is instantiated once — constructor accepts undefined without throwing
const resend = new Resend(env.RESEND_API_KEY);

/** Returns false and logs if the API key is absent, so callers can skip the network call */
function isResendConfigured() {
  if (!env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing; skipping email send.');
    return false;
  }

  return true;
}

/** Produces bilingual HTML depending on the visitor's chosen language */
function buildSuggestionEmailHtml({ text, category, lang }: SuggestionEmailPayload) {
  const categoryValue = category?.trim() ? category.trim() : lang === 'en' ? 'Unspecified' : 'Sin categoría';

  if (lang !== 'en') {
    return `<p>Tienes la siguiente Sugerencia de pregunta:</p><p>Pregunta: ${text}</p><p>Categoria: ${categoryValue}</p>`;
  }

  return `<p><strong>Question:</strong> ${text}</p><p><strong>Category:</strong> ${categoryValue}</p>`;
}

/**
 * Sends a visitor's question suggestion to the configured recipient.
 * Always resolves — errors are captured and returned rather than thrown,
 * so the HTTP response can still report partial success (201 with emailSent: false).
 */
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

/**
 * Fires a notification email whenever a visitor enters the interview.
 * Errors are swallowed so a failed send never blocks the user from continuing.
 */
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