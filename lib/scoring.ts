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

// A real, deterministic personalization score — never a proxy for facts we
// don't have. Nutrition-per-100g is null for every product in the current
// local catalog (Open-Food-Facts-enriched nutrition lives in Supabase,
// unlinked from these local ids — see PLAN.md Section G), so this
// deliberately does NOT score on protein/calories the way a "for your
// muscle goal" feed might imply — that would be inventing a signal from
// data that isn't there. It scores on what's actually real: unit price
// (weighted harder under a budget-first strategy) and preferred-store
// match, behind the same allergen hard gate as everything else.
export function personalScore(product: Product, profile: DemoProfile): number {
  if (!isRecommendable(product, profile)) return -Infinity;

  let score = 0;
  const unitPrice = calculateUnitPrice(product);
  if (unitPrice) {
    const priceWeight = profile.shoppingStrategy === 'budget_first' ? 150 : 100;
    score += priceWeight / (unitPrice.amount + 1);
  }
  if (profile.preferredStores.includes(product.store)) {
    score += 10;
  }

  return score;
}

// Highest personalScore first. Never surfaces an allergen-conflicted
// product above a safe one (personalScore's hard gate sorts those last).
export function rankByPersonalScore(products: Product[], profile: DemoProfile): Product[] {
  return [...products].sort((a, b) => personalScore(b, profile) - personalScore(a, profile));
}
