import { config } from 'dotenv';
import { z } from 'zod';

// Load .env into process.env before validation runs
config();

const rawEnv = {
  PORT: process.env.PORT ?? '3000',
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  SUGGESTION_EMAIL_TO: process.env.SUGGESTION_EMAIL_TO,
};

const envSchema = z.object({
  PORT: z
    .string()
    .transform((value) => Number.parseInt(value, 10))
    .pipe(z.number().int().positive()),
  // Optional: server starts without email sending capability if these are absent
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),
  // Required: nowhere to deliver suggestions without a recipient address
  SUGGESTION_EMAIL_TO: z.string().email(),
});

const parsed = envSchema.safeParse(rawEnv);

// Fail fast at startup rather than silently at request time
if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = {
  PORT: parsed.data.PORT,
  RESEND_API_KEY: parsed.data.RESEND_API_KEY,
  EMAIL_FROM: parsed.data.EMAIL_FROM,
  SUGGESTION_EMAIL_TO: parsed.data.SUGGESTION_EMAIL_TO,
};