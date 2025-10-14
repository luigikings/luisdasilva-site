import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../env.js';
import { UnauthorizedError } from '../utils/errors.js';

export interface LoginPayload {
  email: string;
  password: string;
}

export function authenticate({ email, password }: LoginPayload) {
  if (email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isPasswordValid = bcrypt.compareSync(password, env.ADMIN_PASSWORD_HASH);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const token = jwt.sign({ email: env.ADMIN_EMAIL }, env.JWT_SECRET, {
    expiresIn: '12h'
  });

  return { token };
}
