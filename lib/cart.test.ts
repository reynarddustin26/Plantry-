import { describe, expect, it } from 'vitest';
import { getCartSummary } from './cart';
import type { CartItem, Product } from './types';

const productA: Product = {
  id: 'a',
  name: 'Product A',
  category: 'Test',
  packageSize: '1kg',
  priceAud: 2.5,
  allergens: [],
  store: 'Coles',
  source: 'curated',
  capturedAt: '2026-07-21',
  nutritionPer100g: null,
};

const productB: Product = {
  id: 'b',
  name: 'Product B',
  category: 'Test',
  packageSize: '500g',
  priceAud: 10,
  allergens: ['dairy'],
  store: 'Woolworths',
  source: 'curated',
  capturedAt: '2026-07-21',
  nutritionPer100g: null,
};

const products = [productA, productB];

describe('getCartSummary', () => {
  it('returns zero totals for an empty cart', () => {
    const summary = getCartSummary([], products);
    expect(summary.totalPriceAud).toBe(0);
    expect(summary.itemCount).toBe(0);
    expect(summary.lineItems).toEqual([]);
  });

  it('sums price * quantity across line items', () => {
    const items: CartItem[] = [
      { productId: 'a', quantity: 2 },
      { productId: 'b', quantity: 1 },
    ];
    const summary = getCartSummary(items, products);
    expect(summary.totalPriceAud).toBeCloseTo(2.5 * 2 + 10);
    expect(summary.itemCount).toBe(3);
  });

  it('computes a lineTotalAud per line item', () => {
    const items: CartItem[] = [{ productId: 'a', quantity: 3 }];
    const summary = getCartSummary(items, products);
    expect(summary.lineItems[0].lineTotalAud).toBeCloseTo(7.5);
    expect(summary.lineItems[0].product.id).toBe('a');
  });

  it('silently skips cart items whose product no longer exists in the catalog', () => {
    const items: CartItem[] = [
      { productId: 'a', quantity: 1 },
      { productId: 'missing', quantity: 5 },
    ];
    const summary = getCartSummary(items, products);
    expect(summary.lineItems).toHaveLength(1);
    expect(summary.totalPriceAud).toBeCloseTo(2.5);
  });
});
