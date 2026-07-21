export type Store = 'Coles' | 'Woolworths' | 'IGA';

export type Intent = 'budget' | 'health' | 'quick' | 'convenience';

export type ShoppingStrategy = 'balanced' | 'budget_first' | 'health_first';

export interface DemoProfile {
  id: string;
  displayName: string;
  weeklyBudget: number;
  calorieTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  fibreTarget: number;
  maxCookingMinutes: number;
  defaultIntent: Intent;
  shoppingStrategy: ShoppingStrategy;
  allergies: string[];
  preferredStores: Store[];
}

// Nutrition is per-100g, sourced from USDA FoodData Central in Phase 6. The
// curated pricing dataset (data/pricing-worksheet.csv) has no nutrition
// columns, so every Phase 1-4 product has nutritionPer100g: null — unknown
// values must stay null, never coerced to 0 (blueprint §5).
export interface NutritionPer100g {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fibre: number | null;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  packageSize: string;
  priceAud: number;
  allergens: string[];
  store: Store;
  source: 'demo' | 'curated' | 'open_food_facts';
  capturedAt: string;
  nutritionPer100g: NutritionPer100g | null;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export type RecipeCourse =
  | 'breakfast'
  | 'main'
  | 'snack'
  | 'dessert'
  | 'drink'
  | 'meal_prep';

export type RecipeTag =
  | 'vegan'
  | 'vegetarian'
  | 'gluten_free'
  | 'dairy_free'
  | 'keto'
  | 'high_protein'
  | 'low_calorie'
  | 'budget'
  | 'student'
  | 'family'
  | 'no_cook';

// air_fryer/bbq/one_pot/quick are static recipe attributes. use_soon/
// can_make_now are NOT stored on recipes — they're computed live against the
// user's current cart (blueprint §5's "pantry-match" filters) since we have
// no pantry/expiry tracking yet to compute "use_soon" honestly.
export type RecipeMethod = 'air_fryer' | 'bbq' | 'one_pot' | 'quick';

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  // Links to a real Product in the catalog for cart-matching. Omitted for
  // common pantry staples (salt, pepper, oil, water) that are assumed always
  // on hand — see `pantryStaple`.
  productId?: string;
  pantryStaple?: boolean;
}

export interface RecipeSubstitution {
  originalIngredient: string;
  substitute: string;
  reason?: string;
}

export interface Recipe {
  id: string;
  title: string;
  course: RecipeCourse;
  tags: RecipeTag[];
  method: RecipeMethod[];
  source: 'curated'; // real recipe-API sourcing lands in Phase 6
  totalMinutes: number;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  allergens: string[];
  costPerServingAud: number;
  storageNotes?: string;
  substitutions?: RecipeSubstitution[];
}

export interface OptimiserSwap {
  cartProductId: string;
  suggestedProductId: string;
  savingsAud: number;
  reason: string;
}
