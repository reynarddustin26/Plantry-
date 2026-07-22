import { describe, expect, it } from 'vitest';
import { calculateSavingsSummary, findSwapCandidates } from './optimisation';
import type { CartItem, Product, ScoringProfile } from './types';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p',
    name: 'Product',
    category: 'Dairy',
    packageSize: '500g',
    priceAud: 5,
    allergens: [],
    store: 'Coles',
    source: 'curated',
    capturedAt: '2026-07-21',
    nutritionPer100g: null,
    ...overrides,
  };
}

const profile: ScoringProfile = {
  shoppingStrategy: 'balanced',
  allergies: ['dairy'],
  preferredStores: ['Coles', 'Woolworths'],
};

describe('findSwapCandidates', () => {
  it('proposes a cheaper same-category alternative with real $ savings', () => {
    const expensive = makeProduct({ id: 'expensive', category: 'Protein', packageSize: '500g', priceAud: 10, allergens: [] });
    const cheaper = makeProduct({ id: 'cheaper', category: 'Protein', packageSize: '500g', priceAud: 6, allergens: [] });
    const items: CartItem[] = [{ productId: 'expensive', quantity: 1 }];

    const swaps = findSwapCandidates(items, [expensive, cheaper], profile);
    expect(swaps).toHaveLength(1);
    expect(swaps[0].suggestedProductId).toBe('cheaper');
    expect(swaps[0].savingsAud).toBeCloseTo(4);
    expect(swaps[0].reason).toMatch(/cheaper|save/i);
  });

  it('never proposes a swap to a product that conflicts with the profile allergies', () => {
    const current = makeProduct({ id: 'current', category: 'Protein', priceAud: 10, allergens: [] });
    const cheaperButUnsafe = makeProduct({
      id: 'unsafe',
      category: 'Protein',
      priceAud: 1,
      allergens: ['dairy'],
    });
    const items: CartItem[] = [{ productId: 'current', quantity: 1 }];

    const swaps = findSwapCandidates(items, [current, cheaperButUnsafe], profile);
    expect(swaps).toHaveLength(0);
  });

  it('returns no swap when the current item is already cheapest in its category ("no safe alternative found")', () => {
    const cheapest = makeProduct({ id: 'cheapest', category: 'Protein', priceAud: 3, allergens: [] });
    const items: CartItem[] = [{ productId: 'cheapest', quantity: 1 }];
    expect(findSwapCandidates(items, [cheapest], profile)).toEqual([]);
  });

  it('skips cart items whose product no longer exists in the catalog', () => {
    const items: CartItem[] = [{ productId: 'missing', quantity: 1 }];
    expect(findSwapCandidates(items, [], profile)).toEqual([]);
  });
});

describe('calculateSavingsSummary', () => {
  it('sums savings across all proposed swaps, scaled by quantity', () => {
    const swaps = [
      { cartProductId: 'a', suggestedProductId: 'b', savingsAud: 2, reason: 'cheaper' },
      { cartProductId: 'c', suggestedProductId: 'd', savingsAud: 1.5, reason: 'cheaper' },
    ];
    const items: CartItem[] = [
      { productId: 'a', quantity: 2 },
      { productId: 'c', quantity: 1 },
    ];
    const summary = calculateSavingsSummary(swaps, items);
    expect(summary.totalSavingsAud).toBeCloseTo(5.5); // 2*2 + 1.5*1
    expect(summary.swapCount).toBe(2);
  });

  it('returns zero savings for no swaps', () => {
    expect(calculateSavingsSummary([], [])).toEqual({ totalSavingsAud: 0, swapCount: 0 });
  });
});
