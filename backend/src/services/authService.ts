import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../env.js';
import { UnauthorizedError } from '../utils/errors.js';
import { pool } from '../db.js';

export interface LoginPayload {
  email: string;
  password: string;
}

export async function authenticate({ email, password }: LoginPayload) {
  const normalizedEmail = email.trim().toLowerCase();
  const { rows } = await pool.query<{ email: string; password_hash: string }>(
    `SELECT email, password_hash FROM admin_credentials WHERE email = $1`,
    [normalizedEmail]
  );

  const admin = rows[0];
  if (!admin) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isPasswordValid = bcrypt.compareSync(password, admin.password_hash);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const token = jwt.sign({ email: admin.email }, env.JWT_SECRET, {
    expiresIn: '12h'
  });

  return { token };
}
