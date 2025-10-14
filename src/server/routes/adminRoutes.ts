import { Router } from 'express';
import { authenticateRequest } from '../middleware/auth.js';
import { approveSuggestionSchema } from '../utils/validators.js';
import { getAllQuestions, getTopQuestions } from '../services/questionService.js';
import {
  listSuggestions,
  approveSuggestion,
  rejectSuggestion
} from '../services/suggestionService.js';

const router = Router();

router.use(authenticateRequest);

router.get('/questions', (_req, res) => {
  const questions = getAllQuestions();
  res.json({ data: questions });
});

router.get('/questions/top', (req, res) => {
  const limit = Number.parseInt((req.query.limit as string) ?? '5', 10);
  const safeLimit = Number.isNaN(limit) ? 5 : Math.min(Math.max(limit, 1), 50);
  const questions = getTopQuestions(safeLimit);
  res.json({ data: questions });
});

router.get('/suggestions', (req, res) => {
  const { status } = req.query;
  const suggestions = listSuggestions(status as 'pending' | 'approved' | 'rejected' | undefined);
  res.json({ data: suggestions });
});

router.post('/suggestions/:id/approve', (req, res, next) => {
  const suggestionId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(suggestionId)) {
    return res.status(400).json({ error: 'Invalid suggestion id' });
  }

  try {
    const payload = approveSuggestionSchema.parse(req.body ?? {});
    const result = approveSuggestion(suggestionId, { category: payload.category });
    return res.json({ data: result });
  } catch (error) {
    return next(error);
  }
});

router.post('/suggestions/:id/reject', (req, res, next) => {
  const suggestionId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(suggestionId)) {
    return res.status(400).json({ error: 'Invalid suggestion id' });
  }

  try {
    const suggestion = rejectSuggestion(suggestionId);
    return res.json({ data: suggestion });
  } catch (error) {
    return next(error);
  }
});

export default router;
