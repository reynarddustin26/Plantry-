export type Store = 'Coles' | 'Woolworths' | 'IGA' | 'ALDI';

export type Intent = 'budget' | 'health' | 'quick' | 'convenience';

export type ShoppingStrategy = 'balanced' | 'budget_first' | 'health_first';

export type DietaryPreference = 'none' | 'vegetarian' | 'vegan' | 'keto' | 'gluten_free';

// The real, account-backed profile — every field traces to a Supabase
// `profiles` row (or auth.users for email/createdAt) for the signed-in
// user. Nullable fields are genuinely unset, never defaulted to a fabricated
// value; only `shoppingStrategy` is always present because it's derived
// (see lib/hooks/useProfile.ts), not collected directly from the user.
export interface UserProfile {
  userId: string;
  email: string;
  displayName: string | null;
  weeklyBudget: number | null;
  proteinTarget: number | null;
  maxCookingMinutes: number | null;
  defaultIntent: Intent | null;
  shoppingStrategy: ShoppingStrategy;
  dietaryPreferences: DietaryPreference[];
  allergies: string[];
  preferredStores: Store[];
  createdAt: string;
}

// The minimal shape lib/scoring.ts and lib/optimisation.ts actually read —
// a UserProfile always satisfies this structurally. Lets signed-out call
// sites (e.g. product pages before sign-in) pass an explicit "nothing
// known about this visitor" profile instead of a null-check on every call.
export interface ScoringProfile {
  allergies: string[];
  shoppingStrategy: ShoppingStrategy;
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
