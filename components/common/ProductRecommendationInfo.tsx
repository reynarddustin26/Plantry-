'use client';

import type { Product } from '@/lib/types';
import { calculateUnitPrice, formatUnitPrice } from '@/lib/nutrition';
import { hasAllergenConflict } from '@/lib/allergens';
import { getRecommendationReason } from '@/lib/scoring';
import { useProfileStore } from '@/store/profileStore';
import { ReasoningSlot } from './ReasoningSlot';

// Server Components (product detail, compare) can't read the client-side
// Zustand profile store directly, so the allergy-aware scoring/reason UI is
// delegated to this small client component.
export function ProductRecommendationInfo({ product }: { product: Product }) {
  const profile = useProfileStore((s) => s.profile);
  const conflict = hasAllergenConflict(product, profile.allergies);
  const unitPriceLabel = formatUnitPrice(calculateUnitPrice(product));
  const reason = getRecommendationReason(product, profile);

  return (
    <>
      <p className="text-xs text-muted-foreground">{unitPriceLabel}</p>
      <ReasoningSlot reason={reason} tone={conflict ? 'excluded' : 'positive'} />
    </>
  );
}
