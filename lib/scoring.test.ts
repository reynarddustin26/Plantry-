import { describe, expect, it } from 'vitest';
import { findBestValueId, getRecommendationReason, isRecommendable, rankByPersonalScore } from './scoring';
import type { Product, ScoringProfile } from './types';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    name: 'Test product',
    category: 'Protein',
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
  allergies: ['dairy', 'tree nut'],
  preferredStores: ['Coles', 'Woolworths'],
};

describe('isRecommendable', () => {
  it('is false for a product that conflicts with a profile allergy — the hard gate', () => {
    expect(isRecommendable(makeProduct({ allergens: ['dairy'] }), profile)).toBe(false);
  });

  it('is true for a product with no allergen conflict', () => {
    expect(isRecommendable(makeProduct({ allergens: ['soy'] }), profile)).toBe(true);
  });

  it('is true for a product with no allergens at all', () => {
    expect(isRecommendable(makeProduct({ allergens: [] }), profile)).toBe(true);
  });
});

describe('getRecommendationReason', () => {
  it('names the specific allergen conflict and states exclusion, never softened', () => {
    const reason = getRecommendationReason(makeProduct({ allergens: ['dairy'] }), profile);
    expect(reason).toMatch(/dairy/);
    expect(reason).toMatch(/excluded/i);
  });

  it('flags the best-value product among recommendable options', () => {
    const reason = getRecommendationReason(makeProduct({ allergens: [] }), profile, {
      isBestValue: true,
    });
    expect(reason).toMatch(/best/i);
  });

  it('returns undefined for an unremarkable, non-conflicting product', () => {
    const reason = getRecommendationReason(makeProduct({ allergens: [] }), profile);
    expect(reason).toBeUndefined();
  });
});

describe('findBestValueId', () => {
  it('picks the lowest unit-price product among recommendable, weight-based products', () => {
    const cheap = makeProduct({ id: 'cheap', packageSize: '1kg', priceAud: 2 });
    const expensive = makeProduct({ id: 'expensive', packageSize: '500g', priceAud: 5 });
    expect(findBestValueId([cheap, expensive], profile)).toBe('cheap');
  });

  it('never picks an allergen-conflicted product, even if it is cheapest', () => {
    const cheapButConflicts = makeProduct({
      id: 'conflict',
      packageSize: '1kg',
      priceAud: 1,
      allergens: ['dairy'],
    });
    const safe = makeProduct({ id: 'safe', packageSize: '500g', priceAud: 5, allergens: [] });
    expect(findBestValueId([cheapButConflicts, safe], profile)).toBe('safe');
  });

  it('returns null when no product has a comparable unit price', () => {
    const unparseable = makeProduct({ packageSize: 'a bunch' });
    expect(findBestValueId([unparseable], profile)).toBeNull();
  });

  it('returns null for an empty product list', () => {
    expect(findBestValueId([], profile)).toBeNull();
  });
});

describe('rankByPersonalScore', () => {
  it('ranks a cheaper-per-unit product above a pricier one', () => {
    const cheap = makeProduct({ id: 'cheap', packageSize: '1kg', priceAud: 2 });
    const pricey = makeProduct({ id: 'pricey', packageSize: '1kg', priceAud: 8 });
    const ranked = rankByPersonalScore([pricey, cheap], profile);
    expect(ranked.map((p) => p.id)).toEqual(['cheap', 'pricey']);
  });

  it('never surfaces an allergen-conflicted product above a safe one', () => {
    const cheapButConflicts = makeProduct({
      id: 'conflict',
      packageSize: '1kg',
      priceAud: 1,
      allergens: ['dairy'],
    });
    const safe = makeProduct({ id: 'safe', packageSize: '1kg', priceAud: 5, allergens: [] });
    const ranked = rankByPersonalScore([cheapButConflicts, safe], profile);
    expect(ranked[0].id).toBe('safe');
  });

  it('does not mutate the input array', () => {
    const a = makeProduct({ id: 'a', packageSize: '1kg', priceAud: 8 });
    const b = makeProduct({ id: 'b', packageSize: '1kg', priceAud: 2 });
    const input = [a, b];
    rankByPersonalScore(input, profile);
    expect(input).toEqual([a, b]);
  });
});
