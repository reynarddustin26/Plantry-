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
  proteinTarget: nullableNumber,
  maxCookingMinutes: nullableNumber,
  defaultIntent: z.enum(['budget', 'health', 'quick', 'convenience', '']).transform((v) =>
    v === '' ? null : v,
  ),
  dietaryPreference: z.enum(['none', 'vegetarian', 'vegan', 'keto', 'gluten_free']),
  preferredStores: z.array(z.enum(['Coles', 'Woolworths', 'IGA', 'ALDI'])),
  allergyIds: z.array(z.string()),
});

export type ProfileFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;
