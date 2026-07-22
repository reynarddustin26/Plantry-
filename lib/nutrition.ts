import type { NutritionPer100g, Product, RecipeIngredient } from './types';

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

export interface RecipeNutritionResult {
  /** Per-serving totals, or null if not a single ingredient contributed any real data. */
  perServing: NutritionPer100g | null;
  includedCount: number;
  /** Ingredients that were skipped: no linked product, no matched nutrition
   *  data, or a quantity/unit that can't be honestly converted to a weight
   *  (e.g. "1 each", "2 tbsp") — never estimated via a guessed density. */
  excludedIngredientNames: string[];
}

// Real, deterministic per-serving nutrition computed from ingredient
// quantity × its linked product's real nutrition_per_100g. Only 'g'/'mL'
// quantities are used (mL treated as ~1g/mL, standard for the
// water-based liquids in this catalog, e.g. milk) — anything else is
// honestly excluded rather than guessed.
export function calculateRecipeNutrition(
  ingredients: RecipeIngredient[],
  servings: number,
  nutritionByProductName: Map<string, NutritionPer100g | null>,
  getProductName: (productId: string) => string | undefined,
): RecipeNutritionResult {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let fibre = 0;
  let includedCount = 0;
  const excludedIngredientNames: string[] = [];

  for (const ingredient of ingredients) {
    if (ingredient.pantryStaple) continue;

    const gramsEquivalent =
      ingredient.unit === 'g' || ingredient.unit === 'mL' ? ingredient.quantity : null;
    const productName = ingredient.productId ? getProductName(ingredient.productId) : undefined;
    const nutrition = productName ? nutritionByProductName.get(productName) : null;

    if (gramsEquivalent == null || !nutrition) {
      excludedIngredientNames.push(ingredient.name);
      continue;
    }

    includedCount += 1;
    const factor = gramsEquivalent / 100;
    calories += (nutrition.calories ?? 0) * factor;
    protein += (nutrition.protein ?? 0) * factor;
    carbs += (nutrition.carbs ?? 0) * factor;
    fat += (nutrition.fat ?? 0) * factor;
    fibre += (nutrition.fibre ?? 0) * factor;
  }

  if (includedCount === 0) {
    return { perServing: null, includedCount, excludedIngredientNames };
  }

  return {
    perServing: {
      calories: calories / servings,
      protein: protein / servings,
      carbs: carbs / servings,
      fat: fat / servings,
      fibre: fibre / servings,
    },
    includedCount,
    excludedIngredientNames,
  };
}
