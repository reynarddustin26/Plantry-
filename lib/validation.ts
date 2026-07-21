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

export const nutritionPer100gSchema = z
  .object({
    calories: z.number().nonnegative().nullable(),
    protein: z.number().nonnegative().nullable(),
    carbs: z.number().nonnegative().nullable(),
    fat: z.number().nonnegative().nullable(),
    fibre: z.number().nonnegative().nullable(),
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
    nutritionPer100g: nutritionPer100gSchema.nullable(),
  })
  .strict();

export const cartItemSchema = z
  .object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })
  .strict();

export const recipeCourseSchema = z.enum([
  'breakfast',
  'main',
  'snack',
  'dessert',
  'drink',
  'meal_prep',
]);

export const recipeTagSchema = z.enum([
  'vegan',
  'vegetarian',
  'gluten_free',
  'dairy_free',
  'keto',
  'high_protein',
  'low_calorie',
  'budget',
  'student',
  'family',
  'no_cook',
]);

export const recipeMethodSchema = z.enum(['air_fryer', 'bbq', 'one_pot', 'quick']);

export const recipeIngredientSchema = z
  .object({
    name: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.string().min(1),
    productId: z.string().optional(),
    pantryStaple: z.boolean().optional(),
  })
  .strict();

export const recipeSubstitutionSchema = z
  .object({
    originalIngredient: z.string().min(1),
    substitute: z.string().min(1),
    reason: z.string().optional(),
  })
  .strict();

export const recipeSchema = z
  .object({
    id: z.string(),
    title: z.string().min(1),
    course: recipeCourseSchema,
    tags: z.array(recipeTagSchema),
    method: z.array(recipeMethodSchema),
    source: z.literal('curated'),
    totalMinutes: z.number().positive(),
    servings: z.number().int().positive(),
    ingredients: z.array(recipeIngredientSchema).min(1),
    instructions: z.array(z.string().min(1)).min(1),
    allergens: z.array(z.string()),
    costPerServingAud: z.number().positive(),
    storageNotes: z.string().optional(),
    substitutions: z.array(recipeSubstitutionSchema).optional(),
  })
  .strict();
