'use client';

import type { Product } from '@/lib/types';
import { calculateUnitPrice, formatUnitPrice } from '@/lib/nutrition';
import { hasAllergenConflict } from '@/lib/allergens';
import { getRecommendationReason } from '@/lib/scoring';
import { useProfile } from '@/lib/hooks/useProfile';
import { ReasoningSlot } from './ReasoningSlot';

// Server Components (product detail, compare) can't read the client-side
// signed-in profile directly, so the allergy-aware scoring/reason UI is
// delegated to this small client component. Signed-out visitors (or a
// profile that hasn't finished loading) just see the unit price — their
// allergens are genuinely unknown, so no reason/conflict is fabricated.
export function ProductRecommendationInfo({ product }: { product: Product }) {
  const { profile } = useProfile();
  const unitPriceLabel = formatUnitPrice(calculateUnitPrice(product));

  if (!profile) {
    return <p className="text-xs text-muted-foreground">{unitPriceLabel}</p>;
  }

  const conflict = hasAllergenConflict(product, profile.allergies);
  const reason = getRecommendationReason(product, profile);

  return (
    <>
      <p className="text-xs text-muted-foreground">{unitPriceLabel}</p>
      <ReasoningSlot reason={reason} tone={conflict ? 'excluded' : 'positive'} />
    </>
  );
}
