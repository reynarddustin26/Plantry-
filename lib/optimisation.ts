import { isRecommendable } from './scoring';
import { calculateUnitPrice, type UnitPrice } from './nutrition';
import type { CartItem, DemoProfile, OptimiserSwap, Product } from './types';

// Proposes at least one real, explainable swap per eligible cart item.
// Allergen-conflicted candidates are filtered out via isRecommendable before
// any price comparison happens — the hard gate from Phase 3 applies here too,
// so the optimiser can never trade a user into an allergen conflict.
export function findSwapCandidates(
  items: CartItem[],
  products: Product[],
  profile: DemoProfile,
): OptimiserSwap[] {
  const productsById = new Map(products.map((p) => [p.id, p]));
  const swaps: OptimiserSwap[] = [];

  for (const item of items) {
    const current = productsById.get(item.productId);
    if (!current) continue;

    const currentUnitPrice = calculateUnitPrice(current);
    if (!currentUnitPrice) continue;

    let best: { product: Product; unitPrice: UnitPrice } | null = null;

    for (const candidate of products) {
      if (candidate.id === current.id) continue;
      if (candidate.category !== current.category) continue;
      if (!isRecommendable(candidate, profile)) continue;

      const candidateUnitPrice = calculateUnitPrice(candidate);
      if (!candidateUnitPrice || candidateUnitPrice.unit !== currentUnitPrice.unit) continue;
      if (candidateUnitPrice.amount >= currentUnitPrice.amount) continue;

      if (!best || candidateUnitPrice.amount < best.unitPrice.amount) {
        best = { product: candidate, unitPrice: candidateUnitPrice };
      }
    }

    if (!best) continue;

    const scaleFactor = best.unitPrice.amount / currentUnitPrice.amount;
    const savingsAud = current.priceAud * (1 - scaleFactor);

    swaps.push({
      cartProductId: current.id,
      suggestedProductId: best.product.id,
      savingsAud,
      reason: `Save ${formatAudShort(savingsAud)} by switching to ${best.product.name} (${best.product.store}) — cheaper per ${best.unitPrice.unit}`,
    });
  }

  return swaps;
}

function formatAudShort(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export interface SavingsSummary {
  totalSavingsAud: number;
  swapCount: number;
}

export function calculateSavingsSummary(
  swaps: OptimiserSwap[],
  items: CartItem[],
): SavingsSummary {
  const quantityByProductId = new Map(items.map((i) => [i.productId, i.quantity]));

  const totalSavingsAud = swaps.reduce((sum, swap) => {
    const quantity = quantityByProductId.get(swap.cartProductId) ?? 0;
    return sum + swap.savingsAud * quantity;
  }, 0);

  return { totalSavingsAud, swapCount: swaps.length };
}
