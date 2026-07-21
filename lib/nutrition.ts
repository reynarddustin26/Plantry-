import type { Product } from './types';

export interface ParsedPackageSize {
  totalGrams?: number;
  totalMl?: number;
  totalUnits?: number;
}

const PATTERNS: Array<{
  regex: RegExp;
  toParsed: (match: RegExpMatchArray) => ParsedPackageSize;
}> = [
  // Multipack first — "4x95g" would otherwise also match the plain "g" pattern.
  {
    regex: /^(\d+)\s*x\s*(\d+(?:\.\d+)?)g$/i,
    toParsed: ([, count, size]) => ({ totalGrams: Number(count) * Number(size) }),
  },
  {
    regex: /^(\d+)\s*x\s*(\d+(?:\.\d+)?)mL$/i,
    toParsed: ([, count, size]) => ({ totalMl: Number(count) * Number(size) }),
  },
  { regex: /^(\d+(?:\.\d+)?)kg$/i, toParsed: ([, n]) => ({ totalGrams: Number(n) * 1000 }) },
  { regex: /^(\d+(?:\.\d+)?)g$/i, toParsed: ([, n]) => ({ totalGrams: Number(n) }) },
  { regex: /^(\d+(?:\.\d+)?)L$/i, toParsed: ([, n]) => ({ totalMl: Number(n) * 1000 }) },
  { regex: /^(\d+(?:\.\d+)?)mL$/i, toParsed: ([, n]) => ({ totalMl: Number(n) }) },
  { regex: /^(\d+)\s*each$/i, toParsed: ([, n]) => ({ totalUnits: Number(n) }) },
  { regex: /^(\d+)\s*pk$/i, toParsed: ([, n]) => ({ totalUnits: Number(n) }) },
];

export function parsePackageSize(size: string): ParsedPackageSize | null {
  const trimmed = size.trim();
  for (const { regex, toParsed } of PATTERNS) {
    const match = trimmed.match(regex);
    if (match) return toParsed(match);
  }
  return null;
}

export type UnitPrice =
  | { amount: number; unit: '100g' }
  | { amount: number; unit: '100mL' }
  | { amount: number; unit: 'unit' };

export function calculateUnitPrice(product: Product): UnitPrice | null {
  const parsed = parsePackageSize(product.packageSize);
  if (!parsed) return null;

  if (parsed.totalGrams !== undefined) {
    return { amount: product.priceAud / (parsed.totalGrams / 100), unit: '100g' };
  }
  if (parsed.totalMl !== undefined) {
    return { amount: product.priceAud / (parsed.totalMl / 100), unit: '100mL' };
  }
  if (parsed.totalUnits !== undefined) {
    return { amount: product.priceAud / parsed.totalUnits, unit: 'unit' };
  }
  return null;
}

export function formatUnitPrice(unitPrice: UnitPrice | null): string {
  if (!unitPrice) return 'Unit price unavailable';
  return `$${unitPrice.amount.toFixed(2)}/${unitPrice.unit}`;
}

// Grams of protein per dollar spent. Only meaningful for weight-based
// products with real nutrition data — returns null otherwise rather than
// fabricating a number (blueprint §5: unknown values stay null).
export function proteinPerDollar(product: Product): number | null {
  const protein = product.nutritionPer100g?.protein;
  if (protein == null) return null;

  const unitPrice = calculateUnitPrice(product);
  if (!unitPrice || unitPrice.unit !== '100g') return null;

  return protein / unitPrice.amount;
}
