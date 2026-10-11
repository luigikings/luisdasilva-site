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

/**
 * Send timeout (spec 006 RF-13): an attempt reaching or exceeding this is
 * treated as timed out and degrades instead of hanging the request.
 */
export const EMAIL_SEND_TIMEOUT_MS = 10_000;

/** Generic user-facing timeout message (Spanish, non-empty, no technical detail). */
export const SEND_TIMEOUT_ERROR = 'El envío tardó demasiado. Inténtalo de nuevo más tarde.';

/**
 * Pure race between an email send and a timer (spec 006 RF-13).
 * The timer and its cancellation are injectable so the race is inspectable
 * without real network or waiting out the real 10 s window.
 * The orphaned send settling late is ignored: no retry, no second resolve.
 * Never rejects — a provider rejection maps to its own failure message,
 * distinct from the timeout message (spec 006 edge case).
 */
export function sendWithTimeout(
  send: Promise<EmailSendResult>,
  ms: number = EMAIL_SEND_TIMEOUT_MS,
  setTimer: typeof setTimeout = setTimeout,
  clearTimer: typeof clearTimeout = clearTimeout,
): Promise<EmailSendResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout: Promise<EmailSendResult> = new Promise((resolve) => {
    timer = setTimer(() => resolve({ emailSent: false, error: SEND_TIMEOUT_ERROR }), ms);
  });
  const settled = send.then(
    (result) => {
      if (timer !== undefined) {
        clearTimer(timer);
      }
      return result;
    },
    (reason) => {
      if (timer !== undefined) {
        clearTimer(timer);
      }
      return failure(reason);
    },
  );
  return Promise.race([timeout, settled]);
}

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

/** Pure: escapes visitor content for the HTML email (spec 006 RF-1).
 * Maps & < > " ' to entities; newlines become <br> markup (inserted after escaping). */
export function escapeEmailHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\r\n/g, '<br>')
    .replace(/\n/g, '<br>')
    .replace(/\r/g, '<br>');
}

type OutgoingEmail = {
  subject: string;
  html: string;
};

/**
 * Single network border: builds the email client only when a usable key exists
 * (never at module load), sends one message and normalises rejection, success
 * and interruption to the fixed `{emailSent, error}` shape. The send runs
 * under a 10 s race degrading to `{emailSent:false}` on timeout (RF-13).
 * The client is constructed per request, so concurrent sends stay
 * independent of each other.
 */
async function deliverEmail({ subject, html }: OutgoingEmail): Promise<EmailSendResult> {
  const apiKey = env.RESEND_API_KEY;

  if (isMissingApiKey(apiKey)) {
    console.error('RESEND_API_KEY is missing; skipping email send.');
    return failure(MISSING_API_KEY_ERROR);
  }

  try {
    const resend = new Resend(apiKey as string);
    // The provider attempt never rejects outward: `{data, error}` rejections
    // map to failure with the provider message, thrown errors map to failure
    // with their own message. The 10 s race around it degrades to the timeout
    // message instead (spec 006 RF-13); the orphaned late send is ignored.
    const attempt: Promise<EmailSendResult> = (async () => {
      try {
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
    })();

    return await sendWithTimeout(attempt);
  } catch (error) {
    console.error('Resend email error:', error);
    return failure(error);
  }
}

/** Produces bilingual HTML depending on the visitor's chosen language */
function buildSuggestionEmailHtml({ text, category, lang }: SuggestionEmailPayload) {
  // Trimmed content is what gets validated and sent (spec 006 RF-2); escape it
  // so visitor markup arrives as literal text (spec 006 RF-1).
  const trimmedText = text.trim();
  const trimmedCategory = category?.trim() ? category.trim() : null;
  const escapedText = escapeEmailHtml(trimmedText);
  const categoryValue = trimmedCategory
    ? escapeEmailHtml(trimmedCategory)
    : lang === 'en'
      ? 'Unspecified'
      : 'Sin categoría';

  if (lang !== 'en') {
    return `<p>Tienes la siguiente Sugerencia de pregunta:</p><p>Pregunta: ${escapedText}</p><p>Categoria: ${categoryValue}</p>`;
  }

  return `<p><strong>Question:</strong> ${escapedText}</p><p><strong>Category:</strong> ${categoryValue}</p>`;
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