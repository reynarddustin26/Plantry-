import { getAllergenConflicts, hasAllergenConflict } from './allergens';
import { calculateUnitPrice, formatUnitPrice } from './nutrition';
import type { DemoProfile, Product } from './types';

// The hard gate: allergen-conflicted products are never recommendable,
// regardless of price or any other scoring factor. Never softened.
export function isRecommendable(product: Product, profile: DemoProfile): boolean {
  return !hasAllergenConflict(product, profile.allergies);
}

interface ReasonOptions {
  isBestValue?: boolean;
}

// Every recommendation shows its reason, not just a score. Returns undefined
// for unremarkable products rather than manufacturing filler text.
export function getRecommendationReason(
  product: Product,
  profile: DemoProfile,
  options: ReasonOptions = {},
): string | undefined {
  const conflicts = getAllergenConflicts(product, profile.allergies);
  if (conflicts.length > 0) {
    return `Contains ${conflicts.join(', ')} — excluded from your recommendations (allergy match)`;
  }

  if (options.isBestValue) {
    const unitPrice = calculateUnitPrice(product);
    return `Best value: ${formatUnitPrice(unitPrice)}`;
  }

  return undefined;
}

// Cheapest per-100g product among recommendable (non-conflicting) products
// with a weight-based unit price. Returns null if none qualify.
export function findBestValueId(products: Product[], profile: DemoProfile): string | null {
  let bestId: string | null = null;
  let bestAmount = Infinity;

  for (const product of products) {
    if (!isRecommendable(product, profile)) continue;
    const unitPrice = calculateUnitPrice(product);
    if (!unitPrice || unitPrice.unit !== '100g') continue;
    if (unitPrice.amount < bestAmount) {
      bestAmount = unitPrice.amount;
      bestId = product.id;
    }
  }

  return bestId;
}
