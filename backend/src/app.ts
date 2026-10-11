import cors from 'cors';
import express from 'express';
import { z } from 'zod';

import { env } from './env.js';
import { sendDoorEntryEmail, sendSuggestionEmail } from './services/suggestionEmailService.js';

/** Minimum length matched on both client and server to prevent trivial spam */
// Sizes are checked on the trimmed value (spec 006 RF-2); caps are inclusive (RF-5).
const suggestionSchema = z.object({
  text: z
    .string()
    .trim()
    .min(8, 'La sugerencia debe tener al menos 8 caracteres.')
    .max(1000, 'La sugerencia no puede superar los 1000 caracteres.'),
  category: z.string().trim().max(100, 'La categoría no puede superar los 100 caracteres.').optional(),
  lang: z.enum(['es', 'en']).optional(),
});

const doorEntrySchema = z.object({
  lang: z.enum(['es', 'en']).optional(),
});

/**
 * Sliding-window rate limit shared by both POST endpoints (spec 006 RF-7).
 * Pure: the clock is injected as `now` so the decision is inspectable
 * without waiting out the real 60 s window.
 */
export const RATE_LIMIT_MAX_HITS = 10;
export const RATE_LIMIT_WINDOW_MS = 60_000;

export function isRateLimited(hits: number[], now: number): { limited: boolean; hits: number[] } {
  const fresh = hits.filter((mark) => now - mark < RATE_LIMIT_WINDOW_MS);
  if (fresh.length >= RATE_LIMIT_MAX_HITS) {
    return { limited: true, hits: fresh };
  }
  fresh.push(now);
  return { limited: false, hits: fresh };
}

/**
 * In-memory hit log per client IP, volatile by design (spec 006 RNF-4:
 * IPs live only in memory and are never logged).
 */
const hitsByIp = new Map<string, number[]>();

/**
 * Shared 10/min-per-IP gate for POST /api/suggestions and /api/door-entry
 * (spec 006 RF-7, RF-8). Mounted after the JSON parser so malformed (400)
 * and oversized (413) bodies never reach the counter, and before validation
 * so 429 wins over 400 (spec 006 RF-9). Denied requests return 429 JSON
 * without attempting any email send.
 */
function checkRateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip ?? 'unknown';
  const now = Date.now();
  const { limited, hits } = isRateLimited(hitsByIp.get(ip) ?? [], now);
  hitsByIp.set(ip, hits);
  // Opportunistic sweep so the map cannot grow without bound.
  if (hitsByIp.size > 1000) {
    for (const [key, marks] of hitsByIp) {
      if (marks.every((mark) => now - mark >= RATE_LIMIT_WINDOW_MS)) {
        hitsByIp.delete(key);
      }
    }
  }
  if (limited) {
    return res.status(429).json({ error: 'Demasiadas solicitudes. Espera un momento antes de intentarlo de nuevo.' });
  }
  next();
}

/**
 * Creates and configures the Express application.
 * Exported as a factory so tests can instantiate isolated copies.
 * `corsOrigins` defaults to the configured list (spec 006 RF-11) and is
 * injectable so the CORS gate stays inspectable without env changes.
 */
export function createApp(options?: { corsOrigins?: string[] }) {
  const app = express();
  const allowedOrigins = options?.corsOrigins ?? env.CORS_ORIGINS;

  // Restricted CORS (spec 006 RF-10): only origins in the configured list get
  // ACAO headers (no credentials; methods GET, POST, OPTIONS; header
  // Content-Type). Requests without Origin or with `Origin: null` pass through
  // without CORS headers, as do disallowed origins (same status, no new code).
  // Preflights always end 204 via the cors middleware — with ACAO when allowed,
  // without it when not.
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || origin === 'null') {
          return callback(null, false);
        }
        return callback(null, allowedOrigins.includes(origin.toLowerCase()));
      },
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
      credentials: false,
      optionsSuccessStatus: 204,
      // Let our own OPTIONS handler end every preflight with 204: the cors
      // middleware sets ACAO headers first when the origin is allowed and
      // nothing when it is not, so denied preflights are 204 without ACAO
      // (spec 006 RF-10) instead of Express' default 200 with Allow.
      preflightContinue: true,
    }),
  );
  app.options('*', (_req, res) => {
    res.sendStatus(204);
  });
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/suggestions', checkRateLimit, async (req, res, next) => {
    try {
      const payload = suggestionSchema.parse(req.body);
      const { emailSent, error } = await sendSuggestionEmail({
        text: payload.text,
        category: payload.category ? payload.category : null,
        lang: payload.lang,
      });

      res.status(201).json({
        ok: true,
        emailSent,
        error,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/door-entry', checkRateLimit, async (req, res, next) => {
    try {
      // req.body can be undefined when Content-Type header is absent
      const payload = doorEntrySchema.parse(req.body ?? {});
      const { emailSent, error } = await sendDoorEntryEmail({
        lang: payload.lang,
      });

      res.status(201).json({
        ok: true,
        emailSent,
        error,
      });
    } catch (error) {
      next(error);
    }
  });

  // Express recognises error-handling middleware by its 4-argument signature — all four params are required
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof z.ZodError) {
      const message = error.issues[0]?.message ?? 'Solicitud inválida.';
      return res.status(400).json({ error: message });
    }
    // Malformed JSON never reaches validation: the JSON parser raises a
    // SyntaxError with status 400 — report it as 400 without sending email.
    if (error instanceof SyntaxError && (error as { status?: unknown }).status === 400 && 'body' in error) {
      return res.status(400).json({ error: 'Solicitud inválida.' });
    }
    // Oversized bodies never reach the rate limiter either: the JSON parser
    // rejects them with status 413 — report it as 413 (spec 006 RF-9, RF-14).
    if (
      (error as { status?: unknown }).status === 413 ||
      (error as { type?: unknown }).type === 'entity.too.large'
    ) {
      return res.status(413).json({ error: 'El cuerpo de la petición es demasiado grande.' });
    }
    console.error('Unhandled error:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  });

  return app;
}