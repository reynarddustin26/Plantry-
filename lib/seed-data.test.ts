import { describe, expect, it } from 'vitest';
import { SEED_PRODUCTS } from './seed-data';
import { formatAud } from './utils';

describe('seed data', () => {
  it('includes at least one product with an allergen for the AllergyWarning demo', () => {
    const withAllergens = SEED_PRODUCTS.filter((p) => p.allergens.length > 0);
    expect(withAllergens.length).toBeGreaterThan(0);
  });

  it('loads the full curated catalog (62 rows from data/pricing-worksheet.csv)', () => {
    expect(SEED_PRODUCTS.length).toBe(62);
  });

  it('has unique product ids', () => {
    const ids = new Set(SEED_PRODUCTS.map((p) => p.id));
    expect(ids.size).toBe(SEED_PRODUCTS.length);
  });

  it('never fabricates nutrition data — nutritionPer100g stays null until Phase 6', () => {
    expect(SEED_PRODUCTS.every((p) => p.nutritionPer100g === null)).toBe(true);
  });
});

describe('formatAud', () => {
  it('formats a number as AUD currency', () => {
    expect(formatAud(8.5)).toBe('$8.50');
  });
});
