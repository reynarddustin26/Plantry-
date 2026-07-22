'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PlantryMascot } from '@/components/common/PlantryMascot';
import { useProfileStore } from '@/store/profileStore';
import { hasAllergenConflict } from '@/lib/allergens';
import { calculateUnitPrice, formatUnitPrice } from '@/lib/nutrition';
import { getRecommendationReason } from '@/lib/scoring';
import type { Product } from '@/lib/types';

function cacheKey(productId: string): string {
  return `plantry-ai-explain:${productId}`;
}

export function ProductAiPanel({ product }: { product: Product }) {
  const profile = useProfileStore((s) => s.profile);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [fullText, setFullText] = useState<string | null>(null);
  const [typedChars, setTypedChars] = useState(0);
  const [grounded, setGrounded] = useState(false);
  const typedFromCache = useRef(false);

  // Typewriter reveal of already-fetched text — this app's /api/ai/explain
  // returns a complete JSON response, not a real token stream, so this is a
  // presentation effect over real (already-arrived) text, not a claim that
  // tokens are arriving live.
  useEffect(() => {
    if (!fullText || typedFromCache.current) return;
    if (typedChars >= fullText.length) return;
    const t = setTimeout(() => setTypedChars((c) => c + 1), 18);
    return () => clearTimeout(t);
  }, [fullText, typedChars]);

  async function handleAsk() {
    const cached = sessionStorage.getItem(cacheKey(product.id));
    if (cached) {
      const parsed = JSON.parse(cached) as { explanation: string; grounded: boolean };
      typedFromCache.current = true;
      setFullText(parsed.explanation);
      setTypedChars(parsed.explanation.length);
      setGrounded(parsed.grounded);
      setStatus('idle');
      return;
    }

    setStatus('loading');
    typedFromCache.current = false;
    try {
      const unitPrice = calculateUnitPrice(product);
      const conflict = hasAllergenConflict(product, profile.allergies);
      const reason =
        getRecommendationReason(product, profile, { isBestValue: false }) ??
        `${formatUnitPrice(unitPrice) ?? formatAudFallback(product.priceAud)} in ${product.category}.`;

      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facts: {
            type: 'product_comparison',
            products: [
              {
                name: product.name,
                priceAud: product.priceAud,
                unitPriceLabel: formatUnitPrice(unitPrice),
                allergenConflict: conflict,
                reason,
              },
            ],
          },
          profile: {
            shoppingStrategy: profile.shoppingStrategy,
            weeklyBudget: profile.weeklyBudget,
          },
        }),
      });

      if (!res.ok) throw new Error('AI explain request failed');
      const data = (await res.json()) as { explanation: string; grounded: boolean };

      sessionStorage.setItem(cacheKey(product.id), JSON.stringify(data));
      setFullText(data.explanation);
      setTypedChars(0);
      setGrounded(data.grounded);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <p className="font-semibold">What Plantry thinks</p>

      {status === 'idle' && fullText === null && (
        <button
          type="button"
          onClick={handleAsk}
          className="btn-primary flex min-h-[44px] items-center justify-center rounded-lg text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          style={{ background: 'var(--emerald)' }}
        >
          Ask AI to explain this choice
        </button>
      )}

      {status === 'loading' && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <PlantryMascot className="h-8 w-8 animate-spin" />
          Plantry is thinking…
        </div>
      )}

      {status === 'error' && (
        <p className="text-sm text-muted-foreground">
          AI explanations are unavailable right now — the deterministic
          reasoning above is still fully accurate.
        </p>
      )}

      {fullText !== null && (
        <div className="flex flex-col gap-1">
          <p className="text-sm">
            {fullText.slice(0, typedChars)}
            {typedChars < fullText.length && <span className="animate-pulse">▍</span>}
          </p>
          <p className="text-xs text-muted-foreground">
            {grounded ? 'Powered by Gemini' : 'Deterministic explanation (AI unavailable)'}
          </p>
        </div>
      )}
    </Card>
  );
}

function formatAudFallback(amount: number): string {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
}
