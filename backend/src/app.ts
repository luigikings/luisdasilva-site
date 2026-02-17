import cors from 'cors';
import express from 'express';
import { z } from 'zod';

import { sendDoorEntryEmail, sendSuggestionEmail } from './services/suggestionEmailService.js';

const suggestionSchema = z.object({
  text: z.string().trim().min(8, 'La sugerencia debe tener al menos 8 caracteres.'),
  category: z.string().trim().optional(),
  lang: z.enum(['es', 'en']).optional(),
});

const doorEntrySchema = z.object({
  lang: z.enum(['es', 'en']).optional(),
});

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/suggestions', async (req, res, next) => {
    try {
      const payload = suggestionSchema.parse(req.body);
      const emailSent = await sendSuggestionEmail({
        text: payload.text,
        category: payload.category ? payload.category : null,
        lang: payload.lang,
      });
      res.status(201).json({ ok: true, emailSent });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/door-entry', async (req, res, next) => {
    try {
      const payload = doorEntrySchema.parse(req.body ?? {});
      const emailSent = await sendDoorEntryEmail({
        lang: payload.lang,
      });
      res.status(201).json({ ok: true, emailSent });
    } catch (error) {
      next(error);
    }
  });

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof z.ZodError) {
      const message = error.issues[0]?.message ?? 'Solicitud inválida.';
      return res.status(400).json({ error: message });
    }
    console.error('Unhandled error:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  });

  return app;
}
