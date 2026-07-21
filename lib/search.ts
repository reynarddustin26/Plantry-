import type { Product, Store } from './types';

export interface ProductFilters {
  query?: string;
  category?: string;
  store?: Store;
  excludeAllergens?: string[];
}

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  const query = filters.query?.trim().toLowerCase();

  return products.filter((p) => {
    if (query && !p.name.toLowerCase().includes(query)) return false;
    if (filters.category && p.category !== filters.category) return false;
    if (filters.store && p.store !== filters.store) return false;
    if (
      filters.excludeAllergens?.length &&
      p.allergens.some((a) => filters.excludeAllergens!.includes(a))
    ) {
      return false;
    }
    return true;
  });
}
