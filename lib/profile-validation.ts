import { z } from 'zod';

// Form fields arrive as strings (or '' when left blank) from FormData — blank
// stays null rather than being coerced to 0, matching the "unknown values
// stay null" rule already applied to Product/Recipe (blueprint §5).
const nullableNumber = z
  .string()
  .transform((v) => (v.trim() === '' ? null : Number(v)))
  .refine((v) => v === null || (Number.isFinite(v) && v > 0), {
    error: 'Must be a positive number.',
  });

export const profileFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v)),
  weeklyBudget: nullableNumber,
  calorieTarget: nullableNumber,
  proteinTarget: nullableNumber,
  carbTarget: nullableNumber,
  fatTarget: nullableNumber,
  fibreTarget: nullableNumber,
  maxCookingMinutes: nullableNumber,
  defaultIntent: z.enum(['budget', 'health', 'quick', 'convenience', '']).transform((v) =>
    v === '' ? null : v,
  ),
  shoppingStrategy: z.enum(['balanced', 'budget_first', 'health_first']),
  preferredStores: z.array(z.enum(['Coles', 'Woolworths', 'IGA'])),
  allergyIds: z.array(z.string()),
});

export type ProfileFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;
