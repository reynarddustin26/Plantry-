import { z } from 'zod';

export const pantryItemFormSchema = z.object({
  name: z.string().trim().min(1, 'Item name is required.'),
  quantity: z
    .string()
    .transform((v) => (v.trim() === '' ? null : Number(v)))
    .refine((v) => v === null || (Number.isFinite(v) && v > 0), {
      error: 'Must be a positive number.',
    }),
  unit: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v)),
});

export type PantryFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;
