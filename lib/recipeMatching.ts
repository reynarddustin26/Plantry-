import type { Recipe, RecipeCourse, RecipeIngredient, RecipeMethod, RecipeTag } from './types';

export interface IngredientMatchStatus {
  ingredient: RecipeIngredient;
  inCart: boolean;
}

export function getIngredientMatchStatus(
  recipe: Recipe,
  cartProductIds: string[],
): IngredientMatchStatus[] {
  return recipe.ingredients.map((ingredient) => ({
    ingredient,
    inCart: Boolean(
      ingredient.pantryStaple ||
        (ingredient.productId && cartProductIds.includes(ingredient.productId)),
    ),
  }));
}

export function getMissingIngredients(
  recipe: Recipe,
  cartProductIds: string[],
): RecipeIngredient[] {
  return getIngredientMatchStatus(recipe, cartProductIds)
    .filter((s) => !s.inCart)
    .map((s) => s.ingredient);
}

export function getMatchSummary(
  recipe: Recipe,
  cartProductIds: string[],
): { matched: number; total: number } {
  const nonStaple = recipe.ingredients.filter((i) => !i.pantryStaple);
  const matched = nonStaple.filter(
    (i) => i.productId && cartProductIds.includes(i.productId),
  ).length;
  return { matched, total: nonStaple.length };
}

export interface RecipeFilters {
  course?: RecipeCourse;
  // Multi-select, AND semantics: a recipe must carry every selected tag/
  // method, not just one of them (e.g. Vegan + Budget only matches a recipe
  // tagged with both). Course stays single-select — a recipe has exactly
  // one course, so "combining" courses would mean OR, a different UX than
  // the AND semantics tags/methods use.
  tags?: RecipeTag[];
  methods?: RecipeMethod[];
  query?: string;
  // "can make now" is computed live against the cart (blueprint §5's
  // pantry-match filter) rather than stored on the recipe.
  canMakeNow?: boolean;
  cartProductIds?: string[];
}

export function filterRecipes(recipes: Recipe[], filters: RecipeFilters): Recipe[] {
  const query = filters.query?.trim().toLowerCase();

  return recipes.filter((r) => {
    if (filters.course && r.course !== filters.course) return false;
    if (filters.tags && filters.tags.length > 0 && !filters.tags.every((t) => r.tags.includes(t))) {
      return false;
    }
    if (
      filters.methods &&
      filters.methods.length > 0 &&
      !filters.methods.every((m) => r.method.includes(m))
    ) {
      return false;
    }
    if (query && !r.title.toLowerCase().includes(query)) return false;
    if (filters.canMakeNow) {
      const missing = getMissingIngredients(r, filters.cartProductIds ?? []);
      if (missing.length > 0) return false;
    }
    return true;
  });
}
