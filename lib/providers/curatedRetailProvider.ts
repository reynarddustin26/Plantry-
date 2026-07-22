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
      // lib/types.ts's Store union added 'ALDI' in Phase 10 (a real
      // onboarding/profile store *preference*, not a catalog source) — no
      // SEED_PRODUCTS row is actually store: 'ALDI', and this ingestion
      // pipeline's own store_products.store DB check constraint (migration
      // 0001) still only allows Coles/Woolworths/IGA, so this guard keeps
      // that true rather than silently widening what gets ingested.
      if (p.store === 'ALDI') continue;

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
