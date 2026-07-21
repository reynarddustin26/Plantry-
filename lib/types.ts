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
}
