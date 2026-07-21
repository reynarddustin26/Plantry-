import { explainResponseSchema, type ExplainRequest, type ExplainResponse } from './explainSchemas';

const TIMEOUT_MS = 15_000;
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const SYSTEM_PROMPT = `You explain grocery-shopping decisions for the Plantry app in plain, friendly \
language, in 120 words or fewer.

Hard rules — never break these:
- You are given a JSON object of already-calculated facts (prices, unit prices, allergen \
conflicts, savings amounts, reasons). These facts are ground truth, computed by deterministic \
code before you ever see them.
- You may ONLY reference numbers, product names, and claims that appear verbatim in the \
provided facts. Never state a price, nutrition value, allergen, or savings amount that is not \
already in the facts you were given.
- Never invent or guess any fact that is missing. If something isn't in the data, don't mention it.
- Respond with ONLY a single JSON object matching this exact shape, no other text: \
{"explanation": "<your explanation>", "grounded": true}`;

async function callAnthropic(prompt: string, apiKey: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    const text = data.content?.find((block) => block.type === 'text')?.text;
    return text ?? null;
  } catch {
    // Timeout, network failure, or malformed response — caller falls back
    // to the deterministic template. An explanation is never worth an outage.
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function tryParseExplainResponse(raw: string): ExplainResponse | null {
  try {
    const parsed = JSON.parse(raw);
    const result = explainResponseSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

/**
 * Requests a grounded explanation from the model. Returns null on any
 * failure (not configured, timeout, network error, or invalid output after
 * one stricter retry) — callers must fall back to buildFallbackExplanation.
 */
export async function requestAiExplanation(request: ExplainRequest): Promise<ExplainResponse | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const factsJson = JSON.stringify(request.facts);
  const profileJson = JSON.stringify(request.profile);

  const firstPrompt = `Facts: ${factsJson}\nUser's shopping profile: ${profileJson}\n\nExplain this.`;
  const firstRaw = await callAnthropic(firstPrompt, apiKey);
  if (firstRaw) {
    const parsed = tryParseExplainResponse(firstRaw);
    if (parsed) return parsed;
  }

  // Blueprint §9: on schema-validation failure, retry once with a stricter
  // prompt before falling back to the deterministic template.
  const stricterPrompt = `${firstPrompt}\n\nSTRICT: reply with ONLY the JSON object described in your \
system prompt — no markdown, no code fences, no extra text before or after it.`;
  const secondRaw = await callAnthropic(stricterPrompt, apiKey);
  if (secondRaw) {
    const parsed = tryParseExplainResponse(secondRaw);
    if (parsed) return parsed;
  }

  return null;
}
