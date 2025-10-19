import { Router } from 'express';
import { authenticateRequest } from '../middleware/auth.js';
import { approveSuggestionSchema, loginSchema } from '../utils/validators.js';
import { getAllQuestions, getTopQuestions } from '../services/questionService.js';
import {
  listSuggestions,
  approveSuggestion,
  rejectSuggestion,
  deleteSuggestion
} from '../services/suggestionService.js';
import { authenticate } from '../services/authService.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const credentials = loginSchema.parse(req.body);
    const result = await authenticate(credentials);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

router.use(authenticateRequest);

router.get('/questions', async (_req, res, next) => {
  try {
    const questions = await getAllQuestions();
    res.json({ data: questions });
  } catch (error) {
    next(error);
  }
});

router.get('/questions/top', async (req, res, next) => {
  try {
    const limit = Number.parseInt((req.query.limit as string) ?? '5', 10);
    const safeLimit = Number.isNaN(limit) ? 5 : Math.min(Math.max(limit, 1), 50);
    const questions = await getTopQuestions(safeLimit);
    res.json({ data: questions });
  } catch (error) {
    next(error);
  }
});

router.get('/suggestions', async (req, res, next) => {
  try {
    const { status } = req.query;
    const suggestions = await listSuggestions(status as 'pending' | 'approved' | 'rejected' | undefined);
    res.json({ data: suggestions });
  } catch (error) {
    next(error);
  }
});

router.post('/suggestions/:id/approve', async (req, res, next) => {
  const suggestionId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(suggestionId)) {
    return res.status(400).json({ error: 'Invalid suggestion id' });
  }

  try {
    const payload = approveSuggestionSchema.parse(req.body ?? {});
    const result = await approveSuggestion(suggestionId, { category: payload.category });
    return res.json({ data: result });
  } catch (error) {
    return next(error);
  }
});

router.post('/suggestions/:id/reject', async (req, res, next) => {
  const suggestionId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(suggestionId)) {
    return res.status(400).json({ error: 'Invalid suggestion id' });
  }

  try {
    const suggestion = await rejectSuggestion(suggestionId);
    return res.json({ data: suggestion });
  } catch (error) {
    return next(error);
  }
});

router.delete('/suggestions/:id', async (req, res, next) => {
  const suggestionId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(suggestionId)) {
    return res.status(400).json({ error: 'Invalid suggestion id' });
  }

  try {
    await deleteSuggestion(suggestionId);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
