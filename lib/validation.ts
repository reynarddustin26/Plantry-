import { z } from 'zod';

export const storeSchema = z.enum(['Coles', 'Woolworths', 'IGA']);

export const intentSchema = z.enum(['budget', 'health', 'quick', 'convenience']);

export const shoppingStrategySchema = z.enum([
  'balanced',
  'budget_first',
  'health_first',
]);

export const demoProfileSchema = z
  .object({
    id: z.string(),
    displayName: z.string().min(1),
    weeklyBudget: z.number().positive(),
    calorieTarget: z.number().positive(),
    proteinTarget: z.number().positive(),
    carbTarget: z.number().positive(),
    fatTarget: z.number().positive(),
    fibreTarget: z.number().positive(),
    maxCookingMinutes: z.number().positive(),
    defaultIntent: intentSchema,
    shoppingStrategy: shoppingStrategySchema,
    allergies: z.array(z.string()),
    preferredStores: z.array(storeSchema),
  })
  .strict();

export const productSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1),
    brand: z.string().optional(),
    category: z.string().min(1),
    packageSize: z.string().min(1),
    priceAud: z.number().positive(),
    allergens: z.array(z.string()),
    store: storeSchema,
    source: z.enum(['demo', 'curated', 'open_food_facts']),
    capturedAt: z.string(),
  })
  .strict();
