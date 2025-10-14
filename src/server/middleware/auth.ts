import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env.js';
import { UnauthorizedError } from '../utils/errors.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
  };
}

export function authenticateRequest(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header) {
    return next(new UnauthorizedError('Missing authorization header'));
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new UnauthorizedError('Invalid authorization header'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { email: string };
    req.user = { email: payload.email };
    return next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid or expired token'));
  }
}
