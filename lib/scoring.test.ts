import { describe, expect, it } from 'vitest';
import { findBestValueId, getRecommendationReason, isRecommendable } from './scoring';
import type { DemoProfile, Product } from './types';

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

const profile: DemoProfile = {
  id: 'demo-001',
  displayName: 'Jamie',
  weeklyBudget: 80,
  calorieTarget: 2200,
  proteinTarget: 150,
  carbTarget: 275,
  fatTarget: 73,
  fibreTarget: 30,
  maxCookingMinutes: 45,
  defaultIntent: 'health',
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
