// Shared shapes for the Phase 6 offline ingestion pipeline. These are
// deliberately independent of lib/types.ts's frontend `Recipe`/`Product`
// types: the frontend keeps reading lib/seed-data.ts / lib/recipes-data.ts
// through this phase (see PLAN.md Section G's scope note), so nothing here
// needs to match those types field-for-field — it only needs to match what
// supabase/migrations/0001_init.sql's `products`/`recipes` columns accept.
//
// The website NEVER imports anything from this directory at request time —
// only scripts/ingest.mjs (run offline, manually or on a schedule) does.

export interface IngestedNutrition {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fibre: number | null;
}

export interface IngestedProduct {
  name: string;
  brand: string | null;
  category: string;
  allergens: string[];
  nutritionPer100g: IngestedNutrition | null;
  /** Which provider produced the base row — 'curated' for every product here. */
  source: string;
  /** Which provider (if any) supplied nutritionPer100g, e.g. 'open_food_facts'. Null if nutrition stayed unenriched. */
  nutritionSource: string | null;
  stores: Array<{
    store: 'Coles' | 'Woolworths' | 'IGA';
    packageSize: string;
    priceAud: number;
  }>;
}

export interface IngestedRecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface IngestedRecipe {
  title: string;
  course: 'breakfast' | 'main' | 'snack' | 'dessert' | 'drink' | 'meal_prep';
  tags: string[];
  method: string[];
  allergens: string[];
  source: string;
  sourceId: string | null;
  totalMinutes: number | null;
  servings: number | null;
  instructions: string[];
  equipment: string[];
  storageNotes: string | null;
  costPerServingAud: number | null;
  ingredients: IngestedRecipeIngredient[];
}

export interface RetailDataProvider {
  name: string;
  fetchProducts(): Promise<IngestedProduct[]>;
}

export interface RecipeDataProvider {
  name: string;
  fetchRecipes(): Promise<IngestedRecipe[]>;
}
