import { Router } from 'express';
import {
  analyticsEventSchema,
  questionUsageSchema,
  suggestionSchema
} from '../utils/validators.js';
import {
  getActiveQuestions,
  incrementQuestionClick,
  trackQuestionUsage
} from '../services/questionService.js';
import { sendSuggestionEmail } from '../services/suggestionEmailService.js';
import { getMetrics } from '../services/metricsService.js';
import { suggestionLimiter } from '../middleware/rateLimiters.js';
import { trackAnalyticsEvent } from '../services/analyticsService.js';

const router = Router();

router.get('/questions', async (_req, res, next) => {
  try {
    const questions = await getActiveQuestions();
    res.json({ data: questions });
  } catch (error) {
    next(error);
  }
});

router.post('/questions/:id/click', async (req, res, next) => {
  const questionId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(questionId)) {
    return res.status(400).json({ error: 'Invalid question id' });
  }

  try {
    const question = await incrementQuestionClick(questionId);
    return res.json({ data: question });
  } catch (error) {
    return next(error);
  }
});

router.post('/questions/track', async (req, res, next) => {
  try {
    const payload = questionUsageSchema.parse(req.body);
    const question = await trackQuestionUsage({
      text: payload.text,
      category: payload.category
    });
    return res.status(201).json({ data: question });
  } catch (error) {
    return next(error);
  }
});

router.post('/suggestions', suggestionLimiter, async (req, res, next) => {
  try {
    const payload = suggestionSchema.parse(req.body);
    await sendSuggestionEmail({
      text: payload.text.trim(),
      category: payload.category,
      lang: payload.lang
    });
    const now = new Date().toISOString();
    return res.status(201).json({
      data: {
        id: 0,
        text: payload.text.trim(),
        category: payload.category ?? null,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        processedAt: null,
        questionId: null
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/analytics/events', async (req, res, next) => {
  try {
    const payload = analyticsEventSchema.parse(req.body);
    const event = await trackAnalyticsEvent(payload.type);
    return res.status(201).json({ data: event });
  } catch (error) {
    return next(error);
  }
});

router.get('/metrics', async (_req, res, next) => {
  try {
    const metrics = await getMetrics();
    res.json({ data: metrics });
  } catch (error) {
    next(error);
  }
});

export default router;
