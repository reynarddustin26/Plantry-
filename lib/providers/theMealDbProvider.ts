import { deriveTags, inferAllergensFromIngredients, mapCourse, parseMeasure } from './recipeMapping.ts';
import type { IngestedRecipe, RecipeDataProvider } from './types';

// TheMealDB free tier (API key "1" — no registration needed, per their docs).
const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
const TIMEOUT_MS = 8000;

// A representative spread across our course taxonomy — TheMealDB has no
// drink/meal_prep category, so those stay curated-only for now.
const CATEGORIES = ['Breakfast', 'Dessert', 'Starter', 'Side', 'Vegetarian', 'Vegan', 'Chicken', 'Seafood', 'Pasta'];
const RECIPES_PER_CATEGORY = 3;

interface MealSummary {
  idMeal: string;
}

interface MealDetail {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strInstructions: string;
  [key: `strIngredient${number}`]: string | undefined;
  [key: `strMeasure${number}`]: string | undefined;
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function extractIngredients(meal: MealDetail): { name: string; quantity: number; unit: string }[] {
  const ingredients: { name: string; quantity: number; unit: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}` as const]?.trim();
    const measure = meal[`strMeasure${i}` as const]?.trim() ?? '';
    if (!name) continue;
    const { quantity, unit } = parseMeasure(measure);
    ingredients.push({ name, quantity, unit });
  }
  return ingredients;
}

export const theMealDbProvider: RecipeDataProvider = {
  name: 'themealdb',
  async fetchRecipes(): Promise<IngestedRecipe[]> {
    const recipes: IngestedRecipe[] = [];

    for (const category of CATEGORIES) {
      const filterData = (await fetchJson(
        `${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`,
      )) as { meals?: MealSummary[] } | null;
      const summaries = (filterData?.meals ?? []).slice(0, RECIPES_PER_CATEGORY);

      for (const { idMeal } of summaries) {
        const lookupData = (await fetchJson(`${BASE_URL}/lookup.php?i=${idMeal}`)) as {
          meals?: MealDetail[];
        } | null;
        const meal = lookupData?.meals?.[0];
        if (!meal) continue;

        const ingredients = extractIngredients(meal);
        recipes.push({
          title: meal.strMeal,
          course: mapCourse(meal.strCategory ?? category),
          tags: deriveTags(meal.strCategory ?? category),
          method: [],
          allergens: inferAllergensFromIngredients(ingredients.map((i) => i.name)),
          source: 'themealdb',
          sourceId: meal.idMeal,
          totalMinutes: null,
          servings: null,
          instructions: (meal.strInstructions ?? '')
            .split(/\r?\n/)
            .map((s) => s.trim())
            .filter(Boolean),
          equipment: [],
          storageNotes: null,
          costPerServingAud: null,
          ingredients,
        });
      }
    }

    return recipes;
  },
};
