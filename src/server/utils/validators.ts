import { z } from 'zod';

export const suggestionSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'La pregunta sugerida no puede estar vacía')
    .max(220, 'La sugerencia debe tener máximo 220 caracteres'),
  category: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .optional()
    .or(z.literal('').transform(() => undefined))
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria')
});

export const approveSuggestionSchema = z.object({
  category: z
    .string()
    .trim()
    .min(1, 'La categoría es obligatoria')
    .max(60)
    .optional()
});
