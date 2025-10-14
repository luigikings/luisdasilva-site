import { Router } from 'express';
import { authenticate } from '../services/authService.js';
import { loginSchema } from '../utils/validators.js';

const router = Router();

router.post('/login', (req, res, next) => {
  try {
    const credentials = loginSchema.parse(req.body);
    const result = authenticate(credentials);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
