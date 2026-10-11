import { config } from 'dotenv';
import { z } from 'zod';

// Load .env into process.env before validation runs
config();

/** Defaults used when CORS_ORIGINS is absent or yields no usable entry (spec 006 RF-11). */
export const DEFAULT_CORS_ORIGINS = [
  'http://localhost:5173',
  'https://luisdasilva-site.vercel.app',
];

/**
 * Pure: parses CORS_ORIGINS (comma-separated) per spec 006 RF-11.
 * Each entry is trimmed, lowercased and stripped of trailing slashes;
 * the port is respected. Empty or invalid entries are ignored and the
 * subdomain must match exactly (no wildcards). Absent/empty input — or a
 * list with no usable entry — falls back to the two defaults.
 */
export function normalizeOrigins(raw: string | undefined): string[] {
  if (raw === undefined) {
    return [...DEFAULT_CORS_ORIGINS];
  }

  const origins: string[] = [];
  for (const part of raw.split(',')) {
    const normalized = part.trim().toLowerCase().replace(/\/+$/, '');
    if (normalized === '') {
      continue;
    }

    let url: URL;
    try {
      url = new URL(normalized);
    } catch {
      continue;
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      continue;
    }
    // Reject anything beyond a bare origin (paths, queries, hashes);
    // url.origin keeps the port when it is non-default.
    if (url.pathname !== '/' || url.search !== '' || url.hash !== '') {
      continue;
    }
    if (origins.includes(url.origin)) {
      continue;
    }
    origins.push(url.origin);
  }

  return origins.length > 0 ? origins : [...DEFAULT_CORS_ORIGINS];
}

const rawEnv = {
  PORT: process.env.PORT ?? '3000',
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  SUGGESTION_EMAIL_TO: process.env.SUGGESTION_EMAIL_TO,
  CORS_ORIGINS: process.env.CORS_ORIGINS,
};

const envSchema = z.object({
  PORT: z
    .string()
    .transform((value) => Number.parseInt(value, 10))
    .pipe(z.number().int().positive()),
  // Optional: server starts without email sending capability if these are absent.
  // An explicitly empty key counts as absent (spec 002), so it must not fail startup.
  RESEND_API_KEY: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().min(1).optional(),
  ),
  // Strict bare address only (spec 006 RF-12): "Name <mail>" or several
  // addresses are invalid and fail startup. Whitespace-only counts as absent.
  EMAIL_FROM: z.preprocess(
    (value) => {
      if (typeof value !== 'string') {
        return undefined;
      }
      const trimmed = value.trim();
      return trimmed === '' ? undefined : trimmed;
    },
    z.string().email().optional(),
  ),
  // Required: nowhere to deliver suggestions without a recipient address
  SUGGESTION_EMAIL_TO: z.string().email(),
  CORS_ORIGINS: z.preprocess(
    (value) => normalizeOrigins(typeof value === 'string' ? value : undefined),
    z.array(z.string()),
  ),
});

const parsed = envSchema.safeParse(rawEnv);

// Fail fast at startup rather than silently at request time
if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = {
  PORT: parsed.data.PORT,
  RESEND_API_KEY: parsed.data.RESEND_API_KEY,
  EMAIL_FROM: parsed.data.EMAIL_FROM,
  SUGGESTION_EMAIL_TO: parsed.data.SUGGESTION_EMAIL_TO,
  CORS_ORIGINS: parsed.data.CORS_ORIGINS,
};
