import { describe, expect, it } from 'vitest';
import { RECIPES, getRecipeById } from './recipes-data';
import { getProductById } from './seed-data';

describe('recipes data', () => {
  it('has a genuinely broad course/tag/method matrix, not a token 4 tabs', () => {
    const courses = new Set(RECIPES.map((r) => r.course));
    expect(courses.size).toBeGreaterThanOrEqual(6);

    const tags = new Set(RECIPES.flatMap((r) => r.tags));
    expect(tags.size).toBeGreaterThanOrEqual(8);

    const methods = new Set(RECIPES.flatMap((r) => r.method));
    expect(methods.size).toBe(4);
  });

  it('has unique recipe ids', () => {
    const ids = new Set(RECIPES.map((r) => r.id));
    expect(ids.size).toBe(RECIPES.length);
  });

  it('links every non-pantry-staple ingredient to a real catalog product', () => {
    for (const recipe of RECIPES) {
      for (const ingredient of recipe.ingredients) {
        if (ingredient.pantryStaple) continue;
        expect(ingredient.productId, `${recipe.id}: ${ingredient.name}`).toBeDefined();
        const product = getProductById(ingredient.productId!);
        expect(product, `${recipe.id}: ${ingredient.name} -> ${ingredient.productId}`).toBeDefined();
      }
    }
  });

  it('has at least one recipe with no allergens for a clean baseline case', () => {
    expect(RECIPES.some((r) => r.allergens.length === 0)).toBe(true);
  });
});

describe('getRecipeById', () => {
  it('finds a recipe by id', () => {
    expect(getRecipeById('overnight-oats-banana')?.title).toBe('Overnight Oats with Banana');
  });

  it('returns undefined for an unknown id', () => {
    expect(getRecipeById('does-not-exist')).toBeUndefined();
  });
});
