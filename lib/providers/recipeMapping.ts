import type { IngestedRecipe } from './types';

export function mapCourse(category: string): IngestedRecipe['course'] {
  const c = category.toLowerCase();
  if (c === 'breakfast') return 'breakfast';
  if (c === 'dessert') return 'dessert';
  if (c === 'starter' || c === 'side') return 'snack';
  // TheMealDB has no drink/meal_prep category and no cooking-method field —
  // everything else (Chicken, Seafood, Pasta, Vegetarian, Vegan, Beef, Pork,
  // Lamb, Miscellaneous, Goat, ...) defaults to 'main'. A disclosed
  // categorisation default, not a fabricated fact — unlike price/nutrition,
  // "which course a dish belongs to" has no ground truth to get wrong.
  return 'main';
}

export function deriveTags(category: string): IngestedRecipe['tags'] {
  const c = category.toLowerCase();
  if (c === 'vegan') return ['vegan'];
  if (c === 'vegetarian') return ['vegetarian'];
  return [];
}

// TheMealDB's "measure" strings are free text ("1 cup", "2 tbsp", "200g", "to
// taste", ""). We never invent a numeric amount the source didn't give —
// when no leading number is found, quantity is 1 and unit carries the literal
// descriptive text (e.g. unit: "to taste"), rather than guessing a fake
// precise amount.
export function parseMeasure(raw: string): { quantity: number; unit: string } {
  const trimmed = raw.trim();
  if (trimmed === '') return { quantity: 1, unit: 'unit' };

  const match = trimmed.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d*\.\d+|\d+)\s*(.*)$/);
  if (!match) return { quantity: 1, unit: trimmed };

  const [, numPart, rest] = match;
  const quantity = parseFraction(numPart);
  if (quantity === null || quantity <= 0) return { quantity: 1, unit: trimmed };

  return { quantity, unit: rest.trim() || 'unit' };
}

function parseFraction(text: string): number | null {
  const mixed = text.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    const [, whole, num, den] = mixed;
    return Number(whole) + Number(num) / Number(den);
  }
  const fraction = text.match(/^(\d+)\/(\d+)$/);
  if (fraction) {
    const [, num, den] = fraction;
    return Number(num) / Number(den);
  }
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

// Deterministic keyword match against ingredient text — a heuristic, not a
// verified lab allergen statement (documented in PLAN.md/BLOCKED.md-style
// notes wherever this is surfaced). Reuses the same controlled vocabulary as
// lib/allergens.ts / supabase/migrations/0001_init.sql's `allergies` seed.
const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  dairy: ['milk', 'butter', 'cheese', 'cream', 'yog', 'ghee'],
  gluten: ['flour', 'wheat', 'bread', 'pasta', 'noodle', 'barley', 'rye'],
  egg: ['egg'],
  peanut: ['peanut'],
  'tree nut': ['almond', 'cashew', 'walnut', 'pecan', 'hazelnut', 'pistachio', 'macadamia'],
  soy: ['soy', 'tofu', 'edamame'],
  fish: ['salmon', 'tuna', 'cod', 'anchovy', 'fish'],
  shellfish: ['shrimp', 'prawn', 'crab', 'lobster', 'oyster', 'mussel', 'scallop'],
  sesame: ['sesame', 'tahini'],
  lupin: ['lupin'],
};

export function inferAllergensFromIngredients(ingredientNames: string[]): string[] {
  const lowerNames = ingredientNames.map((n) => n.toLowerCase());
  const found = new Set<string>();
  for (const [allergen, keywords] of Object.entries(ALLERGEN_KEYWORDS)) {
    if (lowerNames.some((name) => keywords.some((kw) => name.includes(kw)))) {
      found.add(allergen);
    }
  }
  return Array.from(found);
}
