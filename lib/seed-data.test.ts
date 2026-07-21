import { describe, expect, it } from 'vitest';
import { DEMO_PROFILE, SEED_PRODUCTS } from './seed-data';
import { formatAud } from './utils';

describe('seed data', () => {
  it('provides a valid Demo Profile with no network dependency', () => {
    expect(DEMO_PROFILE.displayName).toBe('Jamie (Demo User)');
    expect(DEMO_PROFILE.allergies).toContain('dairy');
  });

  it('includes at least one product with an allergen for the AllergyWarning demo', () => {
    const withAllergens = SEED_PRODUCTS.filter((p) => p.allergens.length > 0);
    expect(withAllergens.length).toBeGreaterThan(0);
  });
});

describe('formatAud', () => {
  it('formats a number as AUD currency', () => {
    expect(formatAud(8.5)).toBe('$8.50');
  });
});
