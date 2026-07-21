import type { DemoProfile, Product } from './types';
import { demoProfileSchema, productSchema } from './validation';

// Demo Profile: the always-available, zero-network fallback (blueprint's single
// most important reliability requirement).
const rawDemoProfile: DemoProfile = {
  id: 'demo-001',
  displayName: 'Jamie (Demo User)',
  weeklyBudget: 80,
  calorieTarget: 2200,
  proteinTarget: 150,
  carbTarget: 275,
  fatTarget: 73,
  fibreTarget: 30,
  maxCookingMinutes: 45,
  defaultIntent: 'health',
  shoppingStrategy: 'balanced',
  allergies: ['dairy', 'tree nut'],
  preferredStores: ['Coles', 'Woolworths'],
};

export const DEMO_PROFILE: DemoProfile = demoProfileSchema.parse(rawDemoProfile);

// A small hand-picked subset of real rows from data/pricing-worksheet.csv,
// enough to demonstrate ProductCard/AllergyWarning — including allergen
// examples (soy, dairy, tree nut, gluten, peanut). Full CSV ingestion into a
// real catalog is Phase 2 work.
const rawSeedProducts: Product[] = [
  {
    id: 'prod-coles-chicken-breast-fillets',
    name: 'Chicken Breast Fillets',
    category: 'Protein',
    packageSize: '500g',
    priceAud: 8.5,
    allergens: [],
    store: 'Coles',
    source: 'curated',
    capturedAt: '2026-07-21',
  },
  {
    id: 'prod-coles-free-range-eggs-12pk',
    name: 'Free Range Eggs 12pk',
    category: 'Protein',
    packageSize: '700g',
    priceAud: 7.5,
    allergens: [],
    store: 'Coles',
    source: 'curated',
    capturedAt: '2026-07-21',
  },
  {
    id: 'prod-coles-extra-firm-tofu',
    name: 'Extra Firm Tofu',
    category: 'Protein',
    packageSize: '300g',
    priceAud: 3.5,
    allergens: ['soy'],
    store: 'Coles',
    source: 'curated',
    capturedAt: '2026-07-21',
  },
  {
    id: 'prod-woolworths-greek-style-natural-yoghurt',
    name: 'Greek Style Natural Yoghurt',
    category: 'Protein',
    packageSize: '1kg',
    priceAud: 6.5,
    allergens: ['dairy'],
    store: 'Woolworths',
    source: 'curated',
    capturedAt: '2026-07-21',
  },
  {
    id: 'prod-coles-full-cream-milk',
    name: 'Full Cream Milk',
    category: 'Dairy',
    packageSize: '2L',
    priceAud: 3.6,
    allergens: ['dairy'],
    store: 'Coles',
    source: 'curated',
    capturedAt: '2026-07-21',
  },
  {
    id: 'prod-woolworths-almond-milk-unsweetened',
    name: 'Almond Milk Unsweetened',
    category: 'Dairy',
    packageSize: '1L',
    priceAud: 3.0,
    allergens: ['tree nut'],
    store: 'Woolworths',
    source: 'curated',
    capturedAt: '2026-07-21',
  },
  {
    id: 'prod-coles-wholemeal-bread-loaf',
    name: 'Wholemeal Bread Loaf',
    category: 'Grains & Pantry',
    packageSize: '700g',
    priceAud: 4.2,
    allergens: ['gluten'],
    store: 'Coles',
    source: 'curated',
    capturedAt: '2026-07-21',
  },
  {
    id: 'prod-coles-bananas',
    name: 'Bananas (per kg)',
    category: 'Produce',
    packageSize: '1kg',
    priceAud: 3.9,
    allergens: [],
    store: 'Coles',
    source: 'curated',
    capturedAt: '2026-07-21',
  },
  {
    id: 'prod-woolworths-peanut-butter-smooth',
    name: 'Peanut Butter Smooth',
    category: 'Snacks',
    packageSize: '375g',
    priceAud: 4.5,
    allergens: ['peanut'],
    store: 'Woolworths',
    source: 'curated',
    capturedAt: '2026-07-21',
  },
  {
    id: 'prod-coles-avocado',
    name: 'Avocado (each)',
    category: 'Produce',
    packageSize: '1 each',
    priceAud: 2.0,
    allergens: [],
    store: 'Coles',
    source: 'curated',
    capturedAt: '2026-07-21',
  },
];

export const SEED_PRODUCTS: Product[] = rawSeedProducts.map((p) =>
  productSchema.parse(p),
);

export function getSeedProducts(store?: Product['store']): Product[] {
  return store ? SEED_PRODUCTS.filter((p) => p.store === store) : SEED_PRODUCTS;
}
