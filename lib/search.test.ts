import { describe, expect, it } from 'vitest';
import { filterProducts } from './search';
import type { Product } from './types';

const products: Product[] = [
  {
    id: 'a',
    name: 'Chicken Breast Fillets',
    category: 'Protein',
    packageSize: '500g',
    priceAud: 8.5,
    allergens: [],
    store: 'Coles',
    source: 'curated',
    capturedAt: '2026-07-21',
    nutritionPer100g: null,
  },
  {
    id: 'b',
    name: 'Full Cream Milk',
    category: 'Dairy',
    packageSize: '2L',
    priceAud: 3.6,
    allergens: ['dairy'],
    store: 'Woolworths',
    source: 'curated',
    capturedAt: '2026-07-21',
    nutritionPer100g: null,
  },
  {
    id: 'c',
    name: 'Almond Milk Unsweetened',
    category: 'Dairy',
    packageSize: '1L',
    priceAud: 3.0,
    allergens: ['tree nut'],
    store: 'Woolworths',
    source: 'curated',
    capturedAt: '2026-07-21',
    nutritionPer100g: null,
  },
];

describe('filterProducts', () => {
  it('returns all products when no filters are given', () => {
    expect(filterProducts(products, {})).toHaveLength(3);
  });

  it('matches query against product name, case-insensitively', () => {
    const result = filterProducts(products, { query: 'milk' });
    expect(result.map((p) => p.id).sort()).toEqual(['b', 'c']);
  });

  it('filters by category', () => {
    const result = filterProducts(products, { category: 'Dairy' });
    expect(result.map((p) => p.id).sort()).toEqual(['b', 'c']);
  });

  it('filters by store', () => {
    const result = filterProducts(products, { store: 'Coles' });
    expect(result.map((p) => p.id)).toEqual(['a']);
  });

  it('excludes products containing a given allergen', () => {
    const result = filterProducts(products, { excludeAllergens: ['dairy'] });
    expect(result.map((p) => p.id).sort()).toEqual(['a', 'c']);
  });

  it('combines query, category, store, and allergen exclusion', () => {
    const result = filterProducts(products, {
      query: 'milk',
      category: 'Dairy',
      store: 'Woolworths',
      excludeAllergens: ['dairy'],
    });
    expect(result.map((p) => p.id)).toEqual(['c']);
  });
});
