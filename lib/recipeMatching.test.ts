import { describe, expect, it } from 'vitest';
import {
  filterRecipes,
  getIngredientMatchStatus,
  getMatchSummary,
  getMissingIngredients,
} from './recipeMatching';
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

  it('filters by tag', () => {
    expect(filterRecipes(recipes, { tag: 'vegan' }).map((r) => r.id)).toEqual(['r2']);
  });

  it('filters by method', () => {
    expect(filterRecipes(recipes, { method: 'one_pot' }).map((r) => r.id)).toEqual(['r1']);
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
