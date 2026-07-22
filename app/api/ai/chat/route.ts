import { NextResponse, type NextRequest } from 'next/server';
import { GoogleGenerativeAI, type GenerateContentStreamResult } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { chatRequestSchema, type ChatMessage } from '@/lib/ai/chatSchemas';
import { checkRateLimit } from '@/lib/ai/rateLimiter';

const TIMEOUT_MS = 20_000;
const MAX_MESSAGES_PER_HOUR = 30;
// Corrected from the requested "gemini-1.5-flash" — see PLAN.md's AI
// provider switch section for why (retired model id; verified live).
const MODEL = process.env.GEMINI_CHAT_MODEL || 'gemini-flash-latest';

const SYSTEM_PROMPT = `You are Plantry AI, a friendly grocery and meal planning assistant built into the Plantry app.

You help users with:
- Finding the best value products for their goals and budget
- Answering questions about nutrition, ingredients and allergens
- Suggesting recipes and meals
- Explaining why one product is better than another
- Budget planning for groceries

You have access to the user's profile context passed in each message.

STRICT RULES:
- Never invent specific prices — say "check the app for current prices"
- Never declare a product allergen-safe unless the structured data confirms it
- Always recommend they verify allergen info in the app's allergen checker
- Keep responses short — 2-4 sentences max unless they ask for a recipe
- Be warm, friendly and slightly playful — you're a grocery app, not a doctor
- Never give medical dietary advice
- Add a 🌱 emoji occasionally, you're Plantry`;

function fallbackStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

const FALLBACK_TEXT =
  "🌱 I'm running in offline mode right now (no AI key configured), so I can't chat freely — " +
  'but the app itself still gives you real, calculated answers: check a product page for its ' +
  'deterministic recommendation reason, or use the allergen checker before adding anything to your cart.';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const validated = chatRequestSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: validated.error.flatten() },
      { status: 400 },
    );
  }

  const rateLimitKey = await resolveRateLimitKey(request);
  const rateLimit = checkRateLimit(`chat:${rateLimitKey}`, Date.now(), MAX_MESSAGES_PER_HOUR);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) },
      },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(fallbackStream(FALLBACK_TEXT), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const { messages, userContext } = validated.data;
  const contextLine = `User context: budget $${userContext.budget}/week, allergens: ${
    userContext.allergens.length > 0 ? userContext.allergens.join(', ') : 'none'
  }, protein target: ${userContext.proteinTarget}g/day, shops at: ${userContext.preferredStores.join(', ')}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // Gemini uses 'model' where Anthropic/OpenAI use 'assistant', and has no
  // separate system-message role — the system prompt is passed as
  // systemInstruction on the model instead of as a message.
  const contents = messages.map((m: ChatMessage) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  let streamResult: GenerateContentStreamResult;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: `${SYSTEM_PROMPT}\n\n${contextLine}`,
    });
    streamResult = await model.generateContentStream({ contents }, { signal: controller.signal });
  } catch {
    clearTimeout(timeout);
    return new Response(fallbackStream(FALLBACK_TEXT), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const textStream = new ReadableStream<Uint8Array>({
    async start(streamController) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of streamResult.stream) {
          let text: string;
          try {
            text = chunk.text();
          } catch {
            // Chunk blocked (safety filter) or has no text part — skip it,
            // don't break the whole stream.
            continue;
          }
          if (text) streamController.enqueue(encoder.encode(text));
        }
      } catch {
        // Upstream aborted/errored mid-stream — end gracefully rather than
        // leaving the client's reader hanging.
      } finally {
        clearTimeout(timeout);
        streamController.close();
      }
    },
  });

  return new Response(textStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-RateLimit-Remaining': String(rateLimit.remaining),
    },
  });
}

async function resolveRateLimitKey(request: NextRequest): Promise<string> {
  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return `user:${user.id}`;
  }
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim();
  return ip ? `ip:${ip}` : 'anonymous';
}
