import { z } from 'zod';

export const chatMessageSchema = z
  .object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(2000),
  })
  .strict();

export const chatRequestSchema = z
  .object({
    messages: z.array(chatMessageSchema).min(1).max(20),
    // Nullable/optional: signed-out visitors have no real profile, and this
    // must never be filled with fabricated placeholder values just to
    // satisfy the schema.
    userContext: z
      .object({
        budget: z.number().positive().nullable(),
        allergens: z.array(z.string()),
        proteinTarget: z.number().positive().nullable(),
        preferredStores: z.array(z.string()),
      })
      .strict()
      .nullable()
      .optional(),
  })
  .strict();

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
