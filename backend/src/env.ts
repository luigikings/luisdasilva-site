import { config } from 'dotenv';
import { z } from 'zod';

config();

const rawEnv = {
  PORT: process.env.PORT ?? '3000',
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
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z
    .string()
    .transform((value) => Number.parseInt(value, 10))
    .pipe(z.number().int().positive())
    .optional(),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
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
  SMTP_HOST: parsed.data.SMTP_HOST,
  SMTP_PORT: parsed.data.SMTP_PORT ?? 587,
  SMTP_USER: parsed.data.SMTP_USER,
  SMTP_PASS: parsed.data.SMTP_PASS,
  SMTP_FROM: parsed.data.SMTP_FROM,
  SUGGESTION_EMAIL_TO: parsed.data.SUGGESTION_EMAIL_TO ?? 'luigidasilv@gmail.com'
};
