// Surgical nutrition backfill — UPDATEs existing `products` rows that are
// missing `nutrition_per_100g`, rather than re-running scripts/ingest.ts
// (which only ever INSERTs and has no cleanup step, so re-running it against
// an already-populated `products` table would duplicate every row rather
// than backfilling it).
//
// Tries Open Food Facts first, then USDA FoodData Central (DEMO_KEY, or
// USDA_API_KEY from the environment if set) for anything OFF couldn't
// confidently match. Genuinely-unmatched products are left null — never a
// fabricated zero.
//
// Run: node --env-file=.env.local scripts/backfill-nutrition.ts

import { createClient } from '@supabase/supabase-js';
import { lookupNutritionByName } from '../lib/providers/openFoodFactsNutrition.ts';
import { lookupNutritionByNameUsda, wasRateLimited } from '../lib/providers/usdaNutrition.ts';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USDA_API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in the environment.');
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const CAPTURED_AT = new Date().toISOString();

async function main() {
  const { data: missing, error } = await db
    .from('products')
    .select('id, name')
    .is('nutrition_per_100g', null);

  if (error) {
    console.error('Failed to read products:', error.message);
    process.exit(1);
  }

  console.log(`${missing.length} products missing nutrition_per_100g. Backfilling…\n`);

  let viaOff = 0;
  let viaUsda = 0;
  let stillMissing = 0;

  for (const product of missing) {
    let nutrition = await lookupNutritionByName(product.name);
    let source: 'open_food_facts' | 'usda' | null = nutrition ? 'open_food_facts' : null;
    await sleep(250); // polite to OFF's free public API

    if (!nutrition && !wasRateLimited()) {
      nutrition = await lookupNutritionByNameUsda(product.name, USDA_API_KEY);
      if (nutrition) source = 'usda';
      await sleep(1200); // USDA's DEMO_KEY quota is tight — stay well under it
    }

    if (!nutrition || !source) {
      stillMissing += 1;
      console.log(`  — ${product.name}: no confident match`);
      continue;
    }

    const { error: updateError } = await db
      .from('products')
      .update({ nutrition_per_100g: nutrition })
      .eq('id', product.id);

    if (updateError) {
      console.error(`  ! ${product.name}: update failed — ${updateError.message}`);
      stillMissing += 1;
      continue;
    }

    await db.from('data_provenance').insert({
      entity_type: 'product',
      entity_id: product.id,
      source,
      captured_at: CAPTURED_AT,
      is_demo_data: false,
    });

    if (source === 'open_food_facts') viaOff += 1;
    else viaUsda += 1;
    console.log(`  ✓ ${product.name}: matched via ${source}`);

    if (wasRateLimited()) {
      console.log('\nUSDA DEMO_KEY rate limit hit — stopping USDA lookups for the rest of this run.');
    }
  }

  console.log(
    `\nDone. ${viaOff} enriched via Open Food Facts, ${viaUsda} via USDA, ` +
      `${stillMissing} still have no confident match (left null, not zero).`,
  );
}

main().catch((err) => {
  console.error('backfill-nutrition.ts crashed:', err);
  process.exit(1);
});
