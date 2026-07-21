import { SEED_PRODUCTS } from '../seed-data.ts';
import type { IngestedProduct, RetailDataProvider } from './types';

// Wraps the existing curated AU pricing dataset (data/pricing-worksheet.csv,
// via lib/seed-data.ts) as a RetailDataProvider. This is the base source of
// truth for real AU product listings — Open Food Facts (openFoodFactsNutritionProvider.ts)
// only enriches these rows with nutrition, it never originates a product
// listing itself, because none of these 62 rows carry a barcode (verified:
// `awk -F',' 'NR>1 && $8!=""' data/pricing-worksheet.csv` returns 0 rows), so
// there's no reliable join key for Open Food Facts to be a primary source here.
export const curatedRetailProvider: RetailDataProvider = {
  name: 'curated',
  async fetchProducts(): Promise<IngestedProduct[]> {
    const byName = new Map<string, IngestedProduct>();

    for (const p of SEED_PRODUCTS) {
      const existing = byName.get(p.name);
      if (existing) {
        existing.stores.push({ store: p.store, packageSize: p.packageSize, priceAud: p.priceAud });
        for (const allergen of p.allergens) {
          if (!existing.allergens.includes(allergen)) existing.allergens.push(allergen);
        }
        continue;
      }
      byName.set(p.name, {
        name: p.name,
        brand: p.brand ?? null,
        category: p.category,
        allergens: [...p.allergens],
        nutritionPer100g: null,
        source: 'curated',
        nutritionSource: null,
        stores: [{ store: p.store, packageSize: p.packageSize, priceAud: p.priceAud }],
      });
    }

    return Array.from(byName.values());
  },
};
