import type { DemoProfile, Product, Store } from './types';
import { demoProfileSchema, productSchema } from './validation.ts';

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

// The full curated AU pricing dataset (data/pricing-worksheet.csv, 62 rows —
// blueprint §5's "curated, manually-verified AU pricing dataset"), transcribed
// here as typed rows. capturedAt/allergens/prices are the CSV's real values.
// nutritionPer100g is null for all of these — no nutrition columns exist in
// the curated CSV; real nutrition data lands in Phase 6 via USDA FoodData
// Central. Unknown values stay null, never fabricated (blueprint §5).
type RawRow = [
  store: Store,
  name: string,
  category: string,
  packageSize: string,
  priceAud: number,
  allergens: string[],
];

const CAPTURED_AT = '2026-07-21';

const RAW_ROWS: RawRow[] = [
  ['Coles', 'Chicken Breast Fillets', 'Protein', '500g', 8.5, []],
  ['Woolworths', 'Chicken Breast Fillets', 'Protein', '500g', 8.75, []],
  ['Coles', 'Free Range Eggs 12pk', 'Protein', '700g', 7.5, []],
  ['Woolworths', 'Free Range Eggs 12pk', 'Protein', '700g', 7.8, []],
  ['Coles', 'Canned Tuna in Springwater', 'Protein', '4x95g', 6.0, []],
  ['Woolworths', 'Canned Tuna in Springwater', 'Protein', '4x95g', 6.2, []],
  ['Coles', 'Extra Firm Tofu', 'Protein', '300g', 3.5, ['soy']],
  ['IGA', 'Beef Mince 5 Star', 'Protein', '500g', 7.0, []],
  ['Woolworths', 'Greek Style Natural Yoghurt', 'Protein', '1kg', 6.5, ['dairy']],
  ['Coles', 'Canned Chickpeas', 'Protein', '400g', 1.4, []],
  ['Coles', 'Full Cream Milk', 'Dairy', '2L', 3.6, ['dairy']],
  ['Woolworths', 'Full Cream Milk', 'Dairy', '2L', 3.6, ['dairy']],
  ['Coles', 'Tasty Cheese Block', 'Dairy', '500g', 7.5, ['dairy']],
  ['Woolworths', 'Almond Milk Unsweetened', 'Dairy', '1L', 3.0, ['tree nut']],
  ['IGA', 'Salted Butter', 'Dairy', '250g', 5.5, ['dairy']],
  ['Coles', 'Vanilla Yoghurt Tub', 'Dairy', '1kg', 6.0, ['dairy']],
  ['Woolworths', 'Oat Milk', 'Dairy', '1L', 3.2, []],
  ['IGA', 'Shredded Mozzarella', 'Dairy', '250g', 5.0, ['dairy']],
  ['Coles', 'Basmati Rice', 'Grains & Pantry', '1kg', 4.0, []],
  ['Woolworths', 'Basmati Rice', 'Grains & Pantry', '1kg', 4.2, []],
  ['Coles', 'Rolled Oats', 'Grains & Pantry', '750g', 3.5, ['gluten']],
  ['Coles', 'Wholemeal Bread Loaf', 'Grains & Pantry', '700g', 4.2, ['gluten']],
  ['Woolworths', 'Spaghetti Pasta', 'Grains & Pantry', '500g', 1.8, ['gluten']],
  ['IGA', 'Plain Flour', 'Grains & Pantry', '1kg', 2.5, ['gluten']],
  ['Coles', 'Quinoa', 'Grains & Pantry', '500g', 6.5, []],
  ['Woolworths', 'Wholemeal Bread Loaf', 'Grains & Pantry', '700g', 4.3, ['gluten']],
  ['Coles', 'Bananas (per kg)', 'Produce', '1kg', 3.9, []],
  ['Woolworths', 'Bananas (per kg)', 'Produce', '1kg', 4.0, []],
  ['Coles', 'Baby Spinach', 'Produce', '120g', 3.5, []],
  ['Woolworths', 'Roma Tomatoes (per kg)', 'Produce', '1kg', 5.9, []],
  ['IGA', 'Brushed Potatoes (per kg)', 'Produce', '1kg', 3.5, []],
  ['Coles', 'Frozen Mixed Vegetables', 'Produce', '1kg', 4.0, []],
  ['Woolworths', 'Frozen Peas', 'Produce', '500g', 3.0, []],
  ['Coles', 'Avocado (each)', 'Produce', '1 each', 2.0, []],
  ['Coles', 'Mixed Salted Nuts', 'Snacks', '200g', 5.5, ['tree nut']],
  ['Woolworths', 'Peanut Butter Smooth', 'Snacks', '375g', 4.5, ['peanut']],
  ['Coles', 'Rice Cakes', 'Snacks', '130g', 2.8, []],
  ['Woolworths', 'Protein Bar Box', 'Snacks', '5x60g', 9.0, ['tree nut']],
  ['IGA', 'Salted Crackers', 'Snacks', '250g', 3.5, ['gluten']],
  ['Coles', 'Hummus Dip', 'Snacks', '200g', 3.0, []],
  ['Woolworths', 'Trail Mix', 'Snacks', '300g', 6.0, ['tree nut']],
  ['Coles', 'Popcorn Lightly Salted', 'Snacks', '100g', 2.5, []],
  ['Coles', 'Chocolate Block', 'Desserts', '180g', 5.0, ['dairy']],
  ['Woolworths', 'Vanilla Ice Cream Tub', 'Desserts', '2L', 7.0, ['dairy']],
  ['IGA', 'Chocolate Chip Cookies', 'Desserts', '200g', 4.0, ['gluten']],
  ['Coles', 'Fruit Yoghurt Pouches', 'Desserts', '6x90g', 5.5, ['dairy']],
  ['Woolworths', 'Chocolate Mousse Cups', 'Desserts', '4x60g', 4.5, ['dairy']],
  ['Coles', 'Frozen Berries', 'Desserts', '500g', 6.5, []],
  ['Woolworths', 'Custard Tub', 'Desserts', '600g', 4.0, ['dairy']],
  ['Coles', 'Orange Juice', 'Drinks', '2L', 5.0, []],
  ['Woolworths', 'Orange Juice', 'Drinks', '2L', 5.2, []],
  ['Coles', 'Sparkling Water 10pk', 'Drinks', '10x375mL', 7.0, []],
  ['IGA', 'Instant Coffee', 'Drinks', '200g', 10.0, []],
  ['Woolworths', 'Whey Protein Powder', 'Drinks', '1kg', 45.0, ['dairy']],
  ['Coles', 'Green Tea Bags', 'Drinks', '25pk', 4.0, []],
  ['Coles', '2 Minute Noodles 5pk', 'Budget/Student', '5x85g', 3.5, ['gluten']],
  ['Woolworths', '2 Minute Noodles 5pk', 'Budget/Student', '5x85g', 3.5, ['gluten']],
  ['Coles', 'Canned Baked Beans', 'Budget/Student', '420g', 1.6, []],
  ['Woolworths', 'Canned Tomato Soup', 'Budget/Student', '420g', 1.8, []],
  ['IGA', 'Home Brand White Bread', 'Budget/Student', '700g', 2.0, ['gluten']],
  ['Coles', 'Home Brand Pasta', 'Budget/Student', '500g', 1.2, ['gluten']],
  ['Coles', 'Instant Mashed Potato', 'Budget/Student', '200g', 2.5, []],
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const rawSeedProducts: Product[] = RAW_ROWS.map(
  ([store, name, category, packageSize, priceAud, allergens]) => ({
    id: `prod-${store.toLowerCase()}-${slugify(name)}`,
    name,
    category,
    packageSize,
    priceAud,
    allergens,
    store,
    source: 'curated',
    capturedAt: CAPTURED_AT,
    nutritionPer100g: null,
  }),
);

export const SEED_PRODUCTS: Product[] = rawSeedProducts.map((p) =>
  productSchema.parse(p),
);

export function getSeedProducts(store?: Product['store']): Product[] {
  return store ? SEED_PRODUCTS.filter((p) => p.store === store) : SEED_PRODUCTS;
}

export function getProductById(id: string): Product | undefined {
  return SEED_PRODUCTS.find((p) => p.id === id);
}

export const CATEGORIES: string[] = Array.from(
  new Set(SEED_PRODUCTS.map((p) => p.category)),
).sort();
