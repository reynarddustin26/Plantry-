import type { IngestedNutrition } from './types';
import { isConfidentMatch } from './nameMatching.ts';

// Open Food Facts nutrition enrichment. Barcode lookup is the accurate way to
// use this API, but none of the 62 curated rows carry a barcode (see
// curatedRetailProvider.ts), so this falls back to a name search — which
// carries real mismatch risk against a global (largely non-AU) database. See
// nameMatching.ts for the confidence guard shared with the USDA provider.
const SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';
const USER_AGENT = 'Plantry-EducationalProject/0.1 (ingestion script; contact: n/a)';
const TIMEOUT_MS = 8000;

interface OffProduct {
  product_name?: string;
  nutriments?: Record<string, number | undefined>;
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // Network failure, timeout, or malformed JSON — ingestion must continue
    // with null nutrition, never crash the whole run over one lookup.
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function lookupNutritionByName(productName: string): Promise<IngestedNutrition | null> {
  const url = `${SEARCH_URL}?search_terms=${encodeURIComponent(productName)}&search_simple=1&action=process&json=1&page_size=5`;
  const data = (await fetchJson(url)) as { products?: OffProduct[] } | null;
  const candidates = data?.products ?? [];

  const match = candidates.find(
    (c) => c.product_name && isConfidentMatch(productName, c.product_name),
  );
  if (!match?.nutriments) return null;

  const n = match.nutriments;
  const pick = (key: string): number | null => {
    const value = n[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  };

  const nutrition: IngestedNutrition = {
    calories: pick('energy-kcal_100g'),
    protein: pick('proteins_100g'),
    carbs: pick('carbohydrates_100g'),
    fat: pick('fat_100g'),
    fibre: pick('fiber_100g'),
  };

  // If every field came back null, this "match" carries no usable data —
  // treat it the same as no match rather than claiming an empty enrichment.
  const hasAnyValue = Object.values(nutrition).some((v) => v !== null);
  return hasAnyValue ? nutrition : null;
}
