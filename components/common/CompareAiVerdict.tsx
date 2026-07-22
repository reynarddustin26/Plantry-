'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PlantryMascot } from '@/components/common/PlantryMascot';
import { useProfileStore } from '@/store/profileStore';
import { isRecommendable, getRecommendationReason } from '@/lib/scoring';
import { hasAllergenConflict } from '@/lib/allergens';
import { calculateUnitPrice, formatUnitPrice } from '@/lib/nutrition';
import { formatAud } from '@/lib/utils';
import type { Product } from '@/lib/types';

function cacheKey(productIds: string[]): string {
  return `plantry-ai-compare:${[...productIds].sort().join(',')}`;
}

// The winner is picked by real, deterministic code (cheapest per-100g among
// allergy-safe options in this comparison set) — the AI only explains an
// already-decided fact, it never picks the winner itself.
function pickWinner(products: Product[], profile: Parameters<typeof isRecommendable>[1]) {
  let winner: Product | null = null;
  let bestAmount = Infinity;
  for (const product of products) {
    if (!isRecommendable(product, profile)) continue;
    const unitPrice = calculateUnitPrice(product);
    if (!unitPrice) continue;
    if (unitPrice.amount < bestAmount) {
      bestAmount = unitPrice.amount;
      winner = product;
    }
  }
  return winner;
}

export function CompareAiVerdict({ products }: { products: Product[] }) {
  const profile = useProfileStore((s) => s.profile);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [fullText, setFullText] = useState<string | null>(null);
  const [typedChars, setTypedChars] = useState(0);
  const [grounded, setGrounded] = useState(false);
  const typedFromCache = useRef(false);

  const winner = pickWinner(products, profile);

  useEffect(() => {
    if (!fullText || typedFromCache.current) return;
    if (typedChars >= fullText.length) return;
    const t = setTimeout(() => setTypedChars((c) => c + 1), 18);
    return () => clearTimeout(t);
  }, [fullText, typedChars]);

  useEffect(() => {
    if (!winner || products.length < 2) return;

    (async () => {
      const key = cacheKey(products.map((p) => p.id));
      const cached = sessionStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached) as { explanation: string; grounded: boolean };
        typedFromCache.current = true;
        setFullText(parsed.explanation);
        setTypedChars(parsed.explanation.length);
        setGrounded(parsed.grounded);
        return;
      }

      setStatus('loading');
      try {
        const res = await fetch('/api/ai/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            facts: {
              type: 'product_comparison',
              products: products.map((product) => {
                const unitPrice = calculateUnitPrice(product);
                return {
                  name: product.name,
                  priceAud: product.priceAud,
                  unitPriceLabel: formatUnitPrice(unitPrice),
                  allergenConflict: hasAllergenConflict(product, profile.allergies),
                  reason:
                    getRecommendationReason(product, profile, {
                      isBestValue: product.id === winner.id,
                    }) ?? `${formatUnitPrice(unitPrice) ?? formatAud(product.priceAud)} in ${product.category}.`,
                };
              }),
            },
            profile: {
              shoppingStrategy: profile.shoppingStrategy,
              weeklyBudget: profile.weeklyBudget,
            },
          }),
        });
        if (!res.ok) throw new Error('AI compare request failed');
        const data = (await res.json()) as { explanation: string; grounded: boolean };
        sessionStorage.setItem(key, JSON.stringify(data));
        setFullText(data.explanation);
        setTypedChars(0);
        setGrounded(data.grounded);
        setStatus('idle');
      } catch {
        setStatus('error');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner?.id, products.length]);

  if (!winner || products.length < 2) return null;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <PlantryMascot className={`h-8 w-8 ${status === 'loading' ? 'animate-spin' : ''}`} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Plantry recommends
          </p>
          <p className="text-lg font-bold text-primary">{winner.name}</p>
        </div>
      </div>

      {status === 'loading' && (
        <p className="text-sm text-muted-foreground">Plantry is thinking…</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-muted-foreground">
          {getRecommendationReason(winner, profile, { isBestValue: true })}
        </p>
      )}
      {fullText !== null && (
        <p className="text-sm">
          {fullText.slice(0, typedChars)}
          {typedChars < fullText.length && <span className="animate-pulse">▍</span>}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Based on your {formatAud(profile.weeklyBudget)}/week budget and{' '}
        {profile.proteinTarget}g protein target.{' '}
        {fullText !== null && (grounded ? 'Powered by Gemini.' : 'Deterministic explanation (AI unavailable).')}
      </p>
    </Card>
  );
}
