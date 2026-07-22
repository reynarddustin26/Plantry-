import type { SupabaseClient } from '@supabase/supabase-js';
import type { NutritionPer100g } from '@/lib/types';

// Phase 6 ingestion populated real nutrition_per_100g values into Supabase's
// `products` table (Open Food Facts/USDA-sourced), but the app's catalog is
// still the local lib/seed-data.ts (string ids, not the uuids Supabase
// generated) — there is no shared id to join on. Product name is the only
// reliable link between the two, and both were seeded from the same source
// rows, so an exact name match is real, not a guess. Products with no match,
// or a match with a null nutrition_per_100g (ingestion hasn't reached every
// row yet), correctly return null — never fabricated.
export async function fetchNutritionByName(
  supabase: SupabaseClient,
  name: string,
): Promise<NutritionPer100g | null> {
  const { data } = await supabase
    .from('products')
    .select('nutrition_per_100g')
    .eq('name', name)
    .limit(1)
    .maybeSingle();
  return (data?.nutrition_per_100g as NutritionPer100g | null) ?? null;
}

export async function fetchNutritionByNames(
  supabase: SupabaseClient,
  names: string[],
): Promise<Map<string, NutritionPer100g | null>> {
  const result = new Map<string, NutritionPer100g | null>();
  if (names.length === 0) return result;

  const { data } = await supabase
    .from('products')
    .select('name, nutrition_per_100g')
    .in('name', names);

  for (const row of data ?? []) {
    result.set(row.name, (row.nutrition_per_100g as NutritionPer100g | null) ?? null);
  }
  return result;
}
