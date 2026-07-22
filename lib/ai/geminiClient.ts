import { GoogleGenerativeAI } from '@google/generative-ai';
import { explainResponseSchema, type ExplainRequest, type ExplainResponse } from './explainSchemas';

const TIMEOUT_MS = 15_000;
// Corrected from the requested "gemini-1.5-flash", which Google has fully
// retired (404s for every key as of this build) — "gemini-2.5-flash" is
// also already retired for new users. "gemini-flash-latest" is Google's
// maintained alias that always points at the current recommended
// free-tier flash model, so it won't silently break on the next retirement.
const DEFAULT_MODEL = 'gemini-flash-latest';

export function isAiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
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

async function callGemini(prompt: string, apiKey: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: { responseMimeType: 'application/json' },
    });
    const result = await model.generateContent(
      { contents: [{ role: 'user', parts: [{ text: prompt }] }] },
      { signal: controller.signal },
    );
    return result.response.text() || null;
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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const factsJson = JSON.stringify(request.facts);
  const profileJson = JSON.stringify(request.profile);

  const firstPrompt = `Facts: ${factsJson}\nUser's shopping profile: ${profileJson}\n\nExplain this.`;
  const firstRaw = await callGemini(firstPrompt, apiKey);
  if (firstRaw) {
    const parsed = tryParseExplainResponse(firstRaw);
    if (parsed) return parsed;
  }

  // Blueprint §9: on schema-validation failure, retry once with a stricter
  // prompt before falling back to the deterministic template.
  const stricterPrompt = `${firstPrompt}\n\nSTRICT: reply with ONLY the JSON object described in your \
system prompt — no markdown, no code fences, no extra text before or after it.`;
  const secondRaw = await callGemini(stricterPrompt, apiKey);
  if (secondRaw) {
    const parsed = tryParseExplainResponse(secondRaw);
    if (parsed) return parsed;
  }

  return null;
}
