import { describe, expect, it } from 'vitest';
import { calculateUnitPrice, formatUnitPrice, parsePackageSize, proteinPerDollar } from './nutrition';
import type { Product } from './types';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p',
    name: 'Test product',
    category: 'Test',
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

describe('parsePackageSize', () => {
  it('parses plain grams', () => {
    expect(parsePackageSize('500g')).toEqual({ totalGrams: 500 });
  });

  it('parses kilograms', () => {
    expect(parsePackageSize('1kg')).toEqual({ totalGrams: 1000 });
  });

  it('parses litres', () => {
    expect(parsePackageSize('2L')).toEqual({ totalMl: 2000 });
  });

  it('parses millilitres', () => {
    expect(parsePackageSize('375mL')).toEqual({ totalMl: 375 });
  });

  it('parses multipack grams (NxYg)', () => {
    expect(parsePackageSize('4x95g')).toEqual({ totalGrams: 380 });
  });

  it('parses multipack millilitres (NxYmL)', () => {
    expect(parsePackageSize('10x375mL')).toEqual({ totalMl: 3750 });
  });

  it('parses "N each"', () => {
    expect(parsePackageSize('1 each')).toEqual({ totalUnits: 1 });
  });

  it('parses "Npk"', () => {
    expect(parsePackageSize('25pk')).toEqual({ totalUnits: 25 });
  });

  it('returns null for unparseable strings', () => {
    expect(parsePackageSize('a bunch')).toBeNull();
  });
});

describe('calculateUnitPrice', () => {
  it('computes price per 100g for weight-based products', () => {
    const result = calculateUnitPrice(makeProduct({ packageSize: '500g', priceAud: 5 }));
    expect(result).toEqual({ amount: 1, unit: '100g' });
  });

  it('computes price per 100mL for volume-based products', () => {
    const result = calculateUnitPrice(makeProduct({ packageSize: '2L', priceAud: 5 }));
    expect(result).toEqual({ amount: 0.25, unit: '100mL' });
  });

  it('computes price per unit for count-based products', () => {
    const result = calculateUnitPrice(makeProduct({ packageSize: '25pk', priceAud: 5 }));
    expect(result?.unit).toBe('unit');
    expect(result?.amount).toBeCloseTo(0.2);
  });

  it('returns null when package size cannot be parsed', () => {
    const result = calculateUnitPrice(makeProduct({ packageSize: 'a bunch' }));
    expect(result).toBeNull();
  });
});

describe('formatUnitPrice', () => {
  it('formats a 100g unit price', () => {
    expect(formatUnitPrice({ amount: 1.5, unit: '100g' })).toBe('$1.50/100g');
  });

  it('formats a unit price', () => {
    expect(formatUnitPrice({ amount: 0.2, unit: 'unit' })).toBe('$0.20/unit');
  });

  it('returns a fallback string for null', () => {
    expect(formatUnitPrice(null)).toBe('Unit price unavailable');
  });
});

describe('proteinPerDollar', () => {
  it('returns null when nutrition data is unavailable (never fabricated)', () => {
    const product = makeProduct({ nutritionPer100g: null });
    expect(proteinPerDollar(product)).toBeNull();
  });

  it('computes grams of protein per dollar when nutrition data exists', () => {
    // Synthetic test fixture only — real catalog has no nutrition data yet.
    const product = makeProduct({
      packageSize: '500g',
      priceAud: 5, // $1.00 / 100g
      nutritionPer100g: { calories: 200, protein: 20, carbs: 0, fat: 0, fibre: 0 },
    });
    expect(proteinPerDollar(product)).toBeCloseTo(20);
  });

  it('returns null for non-weight-based products even with nutrition data', () => {
    const product = makeProduct({
      packageSize: '25pk',
      nutritionPer100g: { calories: 200, protein: 20, carbs: 0, fat: 0, fibre: 0 },
    });
    expect(proteinPerDollar(product)).toBeNull();
  });
});
