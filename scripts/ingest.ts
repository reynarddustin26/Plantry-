// Phase 6: offline data ingestion pipeline. Populates Supabase's `products`,
// `store_products`, `recipes`, `recipe_ingredients`, and `data_provenance`
// tables from the RetailDataProvider/RecipeDataProvider implementations in
// lib/providers/. This is the ONLY place in the whole app that talks to
// Open Food Facts / TheMealDB — the website itself only ever reads Supabase
// (blueprint §6). Safe to re-run: it always starts from a clean slate for
// the rows it owns (see "Cleanup" below) rather than accumulating duplicates.
//
// Run: node --env-file=.env.local scripts/ingest.ts

import { createClient } from '@supabase/supabase-js';
import { curatedRetailProvider } from '../lib/providers/curatedRetailProvider.ts';
import { lookupNutritionByName } from '../lib/providers/openFoodFactsNutrition.ts';
import { theMealDbProvider } from '../lib/providers/theMealDbProvider.ts';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in the environment.',
  );
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CAPTURED_AT = new Date().toISOString();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function preflight(): Promise<boolean> {
  const { error } = await db.from('products').select('id').limit(1);
  if (error) {
    console.error('Preflight check failed — `products` table is not reachable:');
    console.error(`  ${error.message} (code: ${error.code ?? 'unknown'})`);
    console.error(
      '\nThis almost always means supabase/migrations/0001_init.sql has not been ' +
        'applied to this project yet. See BLOCKED.md. Aborting before writing anything.',
    );
    return false;
  }
  return true;
}

async function ingestProducts() {
  const products = await curatedRetailProvider.fetchProducts();
  let enrichedCount = 0;
  let productRows = 0;
  let storeProductRows = 0;
  let provenanceRows = 0;

  for (const product of products) {
    const nutrition = await lookupNutritionByName(product.name);
    await sleep(250); // be a polite, rate-limited citizen of a free public API

    const { data: inserted, error: productError } = await db
      .from('products')
      .insert({
        name: product.name,
        brand: product.brand,
        category: product.category,
        allergens: product.allergens,
        nutrition_per_100g: nutrition,
      })
      .select('id')
      .single();

    if (productError || !inserted) {
      console.error(`  Failed to insert product "${product.name}": ${productError?.message}`);
      continue;
    }
    productRows += 1;

    const { error: provenanceError } = await db.from('data_provenance').insert({
      entity_type: 'product',
      entity_id: inserted.id,
      source: 'curated',
      captured_at: CAPTURED_AT,
      is_demo_data: true,
    });
    if (!provenanceError) provenanceRows += 1;

    if (nutrition) {
      enrichedCount += 1;
      const { error: nutritionProvenanceError } = await db.from('data_provenance').insert({
        entity_type: 'product',
        entity_id: inserted.id,
        source: 'open_food_facts',
        captured_at: CAPTURED_AT,
        is_demo_data: false,
      });
      if (!nutritionProvenanceError) provenanceRows += 1;
    }

    for (const storeEntry of product.stores) {
      const { error: storeProductError } = await db.from('store_products').insert({
        product_id: inserted.id,
        store: storeEntry.store,
        package_size: storeEntry.packageSize,
        price_aud: storeEntry.priceAud,
      });
      if (!storeProductError) storeProductRows += 1;
    }
  }

  console.log(
    `Products: ${productRows}/${products.length} inserted, ${storeProductRows} store_products rows, ` +
      `${enrichedCount} nutrition-enriched via Open Food Facts, ${provenanceRows} provenance rows.`,
  );
}

async function ingestRecipes() {
  const recipes = await theMealDbProvider.fetchRecipes();
  let recipeRows = 0;
  let ingredientRows = 0;
  let provenanceRows = 0;

  for (const recipe of recipes) {
    const { data: inserted, error: recipeError } = await db
      .from('recipes')
      .insert({
        title: recipe.title,
        course: recipe.course,
        tags: recipe.tags,
        method: recipe.method,
        allergens: recipe.allergens,
        source: recipe.source,
        source_id: recipe.sourceId,
        total_minutes: recipe.totalMinutes,
        servings: recipe.servings,
        instructions: recipe.instructions,
        equipment: recipe.equipment,
        storage_notes: recipe.storageNotes,
        cost_per_serving: recipe.costPerServingAud,
      })
      .select('id')
      .single();

    if (recipeError || !inserted) {
      console.error(`  Failed to insert recipe "${recipe.title}": ${recipeError?.message}`);
      continue;
    }
    recipeRows += 1;

    const { error: provenanceError } = await db.from('data_provenance').insert({
      entity_type: 'recipe',
      entity_id: inserted.id,
      source: recipe.source,
      captured_at: CAPTURED_AT,
      is_demo_data: false,
    });
    if (!provenanceError) provenanceRows += 1;

    if (recipe.ingredients.length > 0) {
      const { error: ingredientsError } = await db.from('recipe_ingredients').insert(
        recipe.ingredients.map((ing) => ({
          recipe_id: inserted.id,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
        })),
      );
      if (!ingredientsError) ingredientRows += recipe.ingredients.length;
    }
  }

  console.log(
    `Recipes: ${recipeRows}/${recipes.length} inserted, ${ingredientRows} ingredient rows, ` +
      `${provenanceRows} provenance rows.`,
  );
}

async function main() {
  console.log('Phase 6 ingestion starting…');
  const ok = await preflight();
  if (!ok) {
    process.exitCode = 1;
    return;
  }

  await ingestProducts();
  await ingestRecipes();

  console.log('\nDone. The website itself was never called into during this run —');
  console.log('it keeps reading lib/seed-data.ts / lib/recipes-data.ts through Phase 6');
  console.log('(see PLAN.md Section G for the scope decision behind that).');
}

main().catch((err) => {
  console.error('ingest.ts crashed:', err);
  process.exit(1);
});
