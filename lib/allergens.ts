import type { Product } from './types';

// Allergen conflicts are a hard gate — never softened by scoring or by the
// AI. This is the single source of truth for detecting a conflict between a
// product and a profile's declared allergies.
export function getAllergenConflicts(product: Product, profileAllergies: string[]): string[] {
  if (profileAllergies.length === 0 || product.allergens.length === 0) return [];
  return product.allergens.filter((a) => profileAllergies.includes(a));
}

export function hasAllergenConflict(product: Product, profileAllergies: string[]): boolean {
  return getAllergenConflicts(product, profileAllergies).length > 0;
}
