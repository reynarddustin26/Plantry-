import { z } from 'zod';

// Every fact here must already be a deterministically-calculated value from
// lib/scoring.ts / lib/optimisation.ts / lib/nutrition.ts — the AI explains
// these, it never computes or invents any of them (blueprint §9).
export const explainFactsSchema = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('product_comparison'),
      products: z
        .array(
          z
            .object({
              name: z.string().min(1),
              priceAud: z.number().positive(),
              unitPriceLabel: z.string().nullable(),
              allergenConflict: z.boolean(),
              reason: z.string().min(1),
            })
            .strict(),
        )
        .min(1)
        .max(3),
    })
    .strict(),
  z
    .object({
      type: z.literal('basket_swap'),
      fromProductName: z.string().min(1),
      toProductName: z.string().min(1),
      savingsAud: z.number(),
      reason: z.string().min(1),
    })
    .strict(),
  z
    .object({
      type: z.literal('savings_summary'),
      totalSavingsAud: z.number().nonnegative(),
      swapCount: z.number().int().nonnegative(),
    })
    .strict(),
]);

export type ExplainFacts = z.infer<typeof explainFactsSchema>;

export const explainRequestSchema = z
  .object({
    facts: explainFactsSchema,
    profile: z
      .object({
        shoppingStrategy: z.enum(['balanced', 'budget_first', 'health_first']),
        weeklyBudget: z.number().positive(),
      })
      .strict(),
  })
  .strict();

export type ExplainRequest = z.infer<typeof explainRequestSchema>;

export const explainResponseSchema = z
  .object({
    explanation: z.string().min(1).max(700),
    grounded: z.boolean(),
  })
  .strict();

export type ExplainResponse = z.infer<typeof explainResponseSchema>;
