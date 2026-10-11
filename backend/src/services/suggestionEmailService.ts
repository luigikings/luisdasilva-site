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

const MISSING_API_KEY_ERROR = 'RESEND_API_KEY is missing.';
const GENERIC_SEND_ERROR = 'The email could not be sent.';

/**
 * Pure: a key counts as absent when it has no value, is empty or holds only
 * whitespace. All three forms behave the same (spec 002 definition).
 */
function isMissingApiKey(key: string | undefined): boolean {
  return key === undefined || key.trim().length === 0;
}

/** Pure: best-effort text from a provider rejection or an interruption; null when unusable. */
function toErrorText(value: unknown): string | null {
  if (typeof value === 'string') {
    const text = value.trim();
    return text === '' ? null : text;
  }

  if (value instanceof Error) {
    const text = value.message.trim();
    return text === '' ? null : text;
  }

  if (typeof value === 'object' && value !== null && 'message' in value) {
    const message: unknown = (value as { message?: unknown }).message;
    if (typeof message === 'string') {
      const text = message.trim();
      return text === '' ? null : text;
    }
  }

  return null;
}

/** Pure: normalises any failure to the fixed shape — error is always a non-empty string. */
function failure(reason?: unknown): EmailSendResult {
  return {
    emailSent: false,
    error: toErrorText(reason) ?? GENERIC_SEND_ERROR,
  };
}

/** Pure: the single fixed success shape. */
function success(): EmailSendResult {
  return {
    emailSent: true,
    error: null,
  };
}

type OutgoingEmail = {
  subject: string;
  html: string;
};

/**
 * Single network border: builds the email client only when a usable key exists
 * (never at module load), sends one message and normalises rejection, success
 * and interruption to the fixed `{emailSent, error}` shape. The client is
 * constructed per request, so concurrent sends stay independent of each other.
 */
async function deliverEmail({ subject, html }: OutgoingEmail): Promise<EmailSendResult> {
  const apiKey = env.RESEND_API_KEY;

  if (isMissingApiKey(apiKey)) {
    console.error('RESEND_API_KEY is missing; skipping email send.');
    return failure(MISSING_API_KEY_ERROR);
  }

  try {
    const resend = new Resend(apiKey as string);
    const result = await resend.emails.send({
      from: FROM,
      to: env.SUGGESTION_EMAIL_TO,
      subject,
      html,
    });

    // Rejections arrive as `{data, error}` without throwing: error wins even
    // when data is present, and an empty message becomes the generic one.
    if (result.error) {
      const message = toErrorText(result.error) ?? GENERIC_SEND_ERROR;
      console.error('Resend email rejected:', message);
      return failure(message);
    }

    return success();
  } catch (error) {
    console.error('Resend email error:', error);
    return failure(error);
  }
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
  const subject = payload.lang === 'en' ? 'Suggest Question' : 'Te han sugerido una Pregunta';

  return deliverEmail({
    subject,
    html: buildSuggestionEmailHtml(payload),
  });
}

/**
 * Fires a notification email whenever a visitor enters the interview.
 * Errors are swallowed so a failed send never blocks the user from continuing.
 */
export async function sendDoorEntryEmail(payload: DoorEntryEmailPayload = {}): Promise<EmailSendResult> {
  const subject = payload.lang === 'en' ? 'A user has entered' : 'Has entrado a una entrevista!';
  const body = payload.lang === 'en' ? 'A user has entered' : 'Un usuario te ha dejado pasar para la entrevista!';

  return deliverEmail({
    subject,
    html: `<p>${body}</p>`,
  });
}