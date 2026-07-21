import { describe, expect, it } from 'vitest';
import { getAllergenConflicts, hasAllergenConflict } from './allergens';
import type { Product } from './types';

function makeProduct(allergens: string[]): Product {
  return {
    id: 'p',
    name: 'Test product',
    category: 'Test',
    packageSize: '500g',
    priceAud: 5,
    allergens,
    store: 'Coles',
    source: 'curated',
    capturedAt: '2026-07-21',
    nutritionPer100g: null,
  };
}

describe('getAllergenConflicts', () => {
  it('returns an empty array when there is no overlap', () => {
    expect(getAllergenConflicts(makeProduct(['soy']), ['dairy', 'tree nut'])).toEqual([]);
  });

  it('returns the intersecting allergens', () => {
    expect(getAllergenConflicts(makeProduct(['dairy', 'gluten']), ['dairy', 'tree nut'])).toEqual([
      'dairy',
    ]);
  });

  it('returns an empty array when the product has no allergens', () => {
    expect(getAllergenConflicts(makeProduct([]), ['dairy'])).toEqual([]);
  });

  it('returns an empty array when the profile has no allergies', () => {
    expect(getAllergenConflicts(makeProduct(['dairy']), [])).toEqual([]);
  });
});

describe('hasAllergenConflict', () => {
  it('is true when any allergen overlaps', () => {
    expect(hasAllergenConflict(makeProduct(['dairy']), ['dairy'])).toBe(true);
  });

  it('is false when there is no overlap', () => {
    expect(hasAllergenConflict(makeProduct(['soy']), ['dairy'])).toBe(false);
  });
});
