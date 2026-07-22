import { describe, expect, it } from 'vitest';
import {
  filterRecipes,
  getIngredientMatchStatus,
  getMatchSummary,
  getMissingIngredients,
} from './recipeMatching';
import { RECIPES } from './recipes-data';
import type { Recipe } from './types';

const recipe: Recipe = {
  id: 'r1',
  title: 'Test Recipe',
  course: 'main',
  tags: ['budget', 'family'],
  method: ['one_pot'],
  source: 'curated',
  totalMinutes: 20,
  servings: 2,
  ingredients: [
    { name: 'Chicken', quantity: 500, unit: 'g', productId: 'chicken' },
    { name: 'Rice', quantity: 300, unit: 'g', productId: 'rice' },
    { name: 'Salt', quantity: 1, unit: 'pinch', pantryStaple: true },
  ],
  instructions: ['Cook it.'],
  allergens: [],
  costPerServingAud: 3,
};

describe('getIngredientMatchStatus', () => {
  it('marks pantry staples as always in cart', () => {
    const status = getIngredientMatchStatus(recipe, []);
    const salt = status.find((s) => s.ingredient.name === 'Salt');
    expect(salt?.inCart).toBe(true);
  });

  it('marks linked ingredients present in the cart as matched', () => {
    const status = getIngredientMatchStatus(recipe, ['chicken']);
    const chicken = status.find((s) => s.ingredient.name === 'Chicken');
    const rice = status.find((s) => s.ingredient.name === 'Rice');
    expect(chicken?.inCart).toBe(true);
    expect(rice?.inCart).toBe(false);
  });
});

describe('getMissingIngredients', () => {
  it('returns only non-staple ingredients not in the cart', () => {
    const missing = getMissingIngredients(recipe, ['chicken']);
    expect(missing.map((i) => i.name)).toEqual(['Rice']);
  });

  it('returns an empty array when everything needed is available', () => {
    expect(getMissingIngredients(recipe, ['chicken', 'rice'])).toEqual([]);
  });
});

describe('getMatchSummary', () => {
  it('counts matched vs total non-staple ingredients', () => {
    expect(getMatchSummary(recipe, ['chicken'])).toEqual({ matched: 1, total: 2 });
  });
});

describe('filterRecipes', () => {
  const recipes: Recipe[] = [
    recipe,
    {
      ...recipe,
      id: 'r2',
      title: 'Vegan Bowl',
      course: 'breakfast',
      tags: ['vegan'],
      method: ['quick'],
      ingredients: [{ name: 'Tofu', quantity: 200, unit: 'g', productId: 'tofu' }],
    },
  ];

  it('filters by course', () => {
    expect(filterRecipes(recipes, { course: 'breakfast' }).map((r) => r.id)).toEqual(['r2']);
  });

  it('filters by a single tag', () => {
    expect(filterRecipes(recipes, { tags: ['vegan'] }).map((r) => r.id)).toEqual(['r2']);
  });

  it('filters by a single method', () => {
    expect(filterRecipes(recipes, { methods: ['one_pot'] }).map((r) => r.id)).toEqual(['r1']);
  });

  it('combines multiple tags with AND — a recipe must carry every selected tag', () => {
    // r1 has both 'budget' and 'family'; a recipe with only one of the two
    // must not match.
    expect(filterRecipes(recipes, { tags: ['budget', 'family'] }).map((r) => r.id)).toEqual(['r1']);
    expect(filterRecipes(recipes, { tags: ['budget', 'vegan'] })).toEqual([]);
  });

  it('combines a tag and a method with AND', () => {
    expect(
      filterRecipes(recipes, { tags: ['vegan'], methods: ['quick'] }).map((r) => r.id),
    ).toEqual(['r2']);
    expect(filterRecipes(recipes, { tags: ['vegan'], methods: ['one_pot'] })).toEqual([]);
  });

  it('returns an empty array (not a crash) when no recipe satisfies every filter', () => {
    expect(filterRecipes(recipes, { tags: ['budget', 'vegan'], methods: ['one_pot'] })).toEqual([]);
  });

  it('filters by query against the title', () => {
    expect(filterRecipes(recipes, { query: 'vegan' }).map((r) => r.id)).toEqual(['r2']);
  });

  it('filters to only recipes makeable with the current cart when canMakeNow is set', () => {
    const result = filterRecipes(recipes, { canMakeNow: true, cartProductIds: ['chicken', 'rice'] });
    expect(result.map((r) => r.id)).toEqual(['r1']);
  });

  it('returns all recipes when no filters are given', () => {
    expect(filterRecipes(recipes, {})).toHaveLength(2);
  });
});

// The exact combinations from the reported cookbook bug, run against the
// real curated dataset (not the small fixture above) so this proves the
// actual production behavior, not just the filter function in isolation.
describe('filterRecipes against the real curated dataset', () => {
  it('Vegan alone returns results', () => {
    expect(filterRecipes(RECIPES, { tags: ['vegan'] }).length).toBeGreaterThan(0);
  });

  it('Budget alone returns results', () => {
    expect(filterRecipes(RECIPES, { tags: ['budget'] }).length).toBeGreaterThan(0);
  });

  it('Vegan + Budget returns the one recipe tagged with both, not zero', () => {
    const result = filterRecipes(RECIPES, { tags: ['vegan', 'budget'] });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((r) => r.tags.includes('vegan') && r.tags.includes('budget'))).toBe(true);
  });

  it('High Protein + Quick returns results', () => {
    const result = filterRecipes(RECIPES, { tags: ['high_protein'], methods: ['quick'] });
    expect(result.length).toBeGreaterThan(0);
  });

  it('BBQ alone returns results', () => {
    expect(filterRecipes(RECIPES, { methods: ['bbq'] }).length).toBeGreaterThan(0);
  });

  it('BBQ + Budget legitimately returns zero — no curated recipe is both — and that is not a crash', () => {
    expect(() => filterRecipes(RECIPES, { tags: ['budget'], methods: ['bbq'] })).not.toThrow();
    expect(filterRecipes(RECIPES, { tags: ['budget'], methods: ['bbq'] })).toEqual([]);
  });
});
