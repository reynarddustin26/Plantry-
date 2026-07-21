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
  tag?: RecipeTag;
  method?: RecipeMethod;
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
    if (filters.tag && !r.tags.includes(filters.tag)) return false;
    if (filters.method && !r.method.includes(filters.method)) return false;
    if (query && !r.title.toLowerCase().includes(query)) return false;
    if (filters.canMakeNow) {
      const missing = getMissingIngredients(r, filters.cartProductIds ?? []);
      if (missing.length > 0) return false;
    }
    return true;
  });
}
