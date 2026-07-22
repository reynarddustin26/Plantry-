import type { IngestedNutrition } from './types';
import { isConfidentMatch } from './nameMatching.ts';

// USDA FoodData Central fallback for products Open Food Facts couldn't
// confidently match (OFF is a global, largely non-AU/non-generic database;
// USDA's "Foundation"/"SR Legacy" data types are the reverse — generic,
// scientifically-described reference foods, e.g. "Oats, whole grain,
// rolled, old fashioned" rather than a specific packaged product). Excludes
// "Branded" results entirely: a name-only match against a specific branded
// product (which may be a wildly different recipe, e.g. a stuffed/breaded
// item under a plain-sounding name) carries too much risk of attaching
// confidently-WRONG nutrition. Same confidence guard as
// openFoodFactsNutrition.ts (see nameMatching.ts).
const SEARCH_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';
const TIMEOUT_MS = 8000;
const DATA_TYPES = 'Foundation,SR Legacy';

// The free DEMO_KEY is limited to ~30 requests/hour by USDA — once that's
// hit, every further request 429s. Rather than retry/crash, this flips a
// module-level flag on the first 429 and skips all subsequent lookups for
// the rest of the run, leaving their nutrition honestly null instead of
// silently hammering an already-exhausted quota.
let rateLimited = false;
export function wasRateLimited(): boolean {
  return rateLimited;
}

interface UsdaFood {
  description?: string;
  dataType?: string;
  foodNutrients?: Array<{ nutrientName?: string; unitName?: string; value?: number }>;
}

async function fetchJson(url: string): Promise<unknown> {
  if (rateLimited) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (res.status === 429) {
      rateLimited = true;
      return null;
    }
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function pickNutrient(
  nutrients: UsdaFood['foodNutrients'],
  name: string,
  unit: string,
): number | null {
  const match = nutrients?.find(
    (n) => n.nutrientName === name && n.unitName?.toUpperCase() === unit,
  );
  return typeof match?.value === 'number' && Number.isFinite(match.value) ? match.value : null;
}

export async function lookupNutritionByNameUsda(
  productName: string,
  apiKey: string,
): Promise<IngestedNutrition | null> {
  const url = `${SEARCH_URL}?query=${encodeURIComponent(productName)}&api_key=${encodeURIComponent(apiKey)}&pageSize=10&dataType=${encodeURIComponent(DATA_TYPES)}`;
  const data = (await fetchJson(url)) as { foods?: UsdaFood[] } | null;
  const candidates = data?.foods ?? [];

  const match = candidates.find(
    (c) => c.description && isConfidentMatch(productName, c.description),
  );
  if (!match?.foodNutrients) return null;

  const nutrition: IngestedNutrition = {
    calories: pickNutrient(match.foodNutrients, 'Energy', 'KCAL'),
    protein: pickNutrient(match.foodNutrients, 'Protein', 'G'),
    carbs: pickNutrient(match.foodNutrients, 'Carbohydrate, by difference', 'G'),
    fat: pickNutrient(match.foodNutrients, 'Total lipid (fat)', 'G'),
    fibre: pickNutrient(match.foodNutrients, 'Fiber, total dietary', 'G'),
  };

  const hasAnyValue = Object.values(nutrition).some((v) => v !== null);
  return hasAnyValue ? nutrition : null;
}
