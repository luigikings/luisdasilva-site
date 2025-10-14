import { Router } from 'express';
import { questionUsageSchema, suggestionSchema } from '../utils/validators.js';
import {
  getActiveQuestions,
  incrementQuestionClick,
  trackQuestionUsage
} from '../services/questionService.js';
import { createSuggestion } from '../services/suggestionService.js';
import { getMetrics } from '../services/metricsService.js';
import { suggestionLimiter } from '../middleware/rateLimiters.js';

const router = Router();

router.get('/questions', (_req, res) => {
  const questions = getActiveQuestions();
  res.json({ data: questions });
});

router.post('/questions/:id/click', (req, res, next) => {
  const questionId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(questionId)) {
    return res.status(400).json({ error: 'Invalid question id' });
  }

  try {
    const question = incrementQuestionClick(questionId);
    return res.json({ data: question });
  } catch (error) {
    return next(error);
  }
});

router.post('/questions/track', (req, res, next) => {
  try {
    const payload = questionUsageSchema.parse(req.body);
    const question = trackQuestionUsage({
      text: payload.text,
      category: payload.category
    });
    return res.status(201).json({ data: question });
  } catch (error) {
    return next(error);
  }
});

router.post('/suggestions', suggestionLimiter, (req, res, next) => {
  try {
    const payload = suggestionSchema.parse(req.body);
    const suggestion = createSuggestion(payload.text.trim(), payload.category);
    return res.status(201).json({ data: suggestion });
  } catch (error) {
    return next(error);
  }
});

router.get('/metrics', (_req, res) => {
  const metrics = getMetrics();
  res.json({ data: metrics });
});

export default router;
