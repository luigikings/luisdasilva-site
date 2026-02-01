import { config } from 'dotenv';
import { z } from 'zod';

config();

const rawEnv = {
  PORT: process.env.PORT ?? '3000',
  DATABASE_URL: process.env.DATABASE_URL,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
  JWT_SECRET: process.env.JWT_SECRET,
  SUGGESTION_RATE_LIMIT_WINDOW_MINUTES: process.env.SUGGESTION_RATE_LIMIT_WINDOW_MINUTES ?? '15',
  SUGGESTION_RATE_LIMIT_MAX: process.env.SUGGESTION_RATE_LIMIT_MAX ?? '5',
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
  SUGGESTION_EMAIL_TO: process.env.SUGGESTION_EMAIL_TO ?? 'luigidasilv@gmail.com'
};

const envSchema = z.object({
  PORT: z
    .string()
    .transform((value) => Number.parseInt(value, 10))
    .pipe(z.number().int().positive()),
  DATABASE_URL: z.string().min(1),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD_HASH: z.string().min(10, 'ADMIN_PASSWORD_HASH must be a bcrypt hash'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  SUGGESTION_RATE_LIMIT_WINDOW_MINUTES: z
    .string()
    .transform((value) => Number.parseInt(value, 10))
    .pipe(z.number().int().positive()),
  SUGGESTION_RATE_LIMIT_MAX: z
    .string()
    .transform((value) => Number.parseInt(value, 10))
    .pipe(z.number().int().positive()),
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z
    .string()
    .transform((value) => Number.parseInt(value, 10))
    .pipe(z.number().int().positive())
    .optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASS: z.string().min(1).optional(),
  SMTP_FROM: z.string().email().optional(),
  SUGGESTION_EMAIL_TO: z.string().email().optional()
});

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = {
  PORT: parsed.data.PORT,
  DATABASE_URL: parsed.data.DATABASE_URL,
  ADMIN_EMAIL: parsed.data.ADMIN_EMAIL,
  ADMIN_PASSWORD_HASH: parsed.data.ADMIN_PASSWORD_HASH,
  JWT_SECRET: parsed.data.JWT_SECRET,
  SUGGESTION_RATE_LIMIT_WINDOW_MINUTES: parsed.data.SUGGESTION_RATE_LIMIT_WINDOW_MINUTES,
  SUGGESTION_RATE_LIMIT_MAX: parsed.data.SUGGESTION_RATE_LIMIT_MAX,
  SMTP_HOST: parsed.data.SMTP_HOST,
  SMTP_PORT: parsed.data.SMTP_PORT ?? 587,
  SMTP_USER: parsed.data.SMTP_USER,
  SMTP_PASS: parsed.data.SMTP_PASS,
  SMTP_FROM: parsed.data.SMTP_FROM,
  SUGGESTION_EMAIL_TO: parsed.data.SUGGESTION_EMAIL_TO ?? 'luigidasilv@gmail.com'
};
