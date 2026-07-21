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
