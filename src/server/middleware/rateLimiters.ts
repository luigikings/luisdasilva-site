import rateLimit from 'express-rate-limit';
import { env } from '../env.js';

export const suggestionLimiter = rateLimit({
  windowMs: env.SUGGESTION_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  max: env.SUGGESTION_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many suggestions submitted. Please try again later.'
  }
});
