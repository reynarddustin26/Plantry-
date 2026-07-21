import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { explainRequestSchema } from '@/lib/ai/explainSchemas';
import { isAiConfigured, requestAiExplanation } from '@/lib/ai/anthropicClient';
import { buildFallbackExplanation } from '@/lib/ai/fallbackExplanation';
import { checkRateLimit } from '@/lib/ai/rateLimiter';

// Server-only route. All prices/nutrition/allergen facts are computed by
// deterministic code before this route is ever called — the AI (when
// configured) only explains them in plain language; it never calculates
// anything (blueprint §9). Fully functional with ANTHROPIC_API_KEY absent —
// see lib/ai/fallbackExplanation.ts.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const validated = explainRequestSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: validated.error.flatten() },
      { status: 400 },
    );
  }

  const rateLimitKey = await resolveRateLimitKey(request);
  const rateLimit = checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) },
      },
    );
  }

  if (isAiConfigured()) {
    const aiResult = await requestAiExplanation(validated.data);
    if (aiResult) {
      return NextResponse.json(aiResult, {
        headers: { 'X-RateLimit-Remaining': String(rateLimit.remaining) },
      });
    }
  }

  // Not configured, timed out, or failed validation twice — the app must
  // stay fully usable regardless (blueprint §9/§10).
  const explanation = buildFallbackExplanation(validated.data.facts);
  return NextResponse.json(
    { explanation, grounded: false },
    { headers: { 'X-RateLimit-Remaining': String(rateLimit.remaining) } },
  );
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
