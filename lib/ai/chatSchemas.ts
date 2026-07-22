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
    userContext: z
      .object({
        budget: z.number().positive(),
        allergens: z.array(z.string()),
        proteinTarget: z.number().positive(),
        preferredStores: z.array(z.string()),
      })
      .strict(),
  })
  .strict();

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
