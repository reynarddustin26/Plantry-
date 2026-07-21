// Phase 5 gate proof: "Two test users' carts/pantry provably isolated (RLS)".
//
// Creates two real, disposable test users against the actual Supabase
// project, seeds two dummy catalog products (service_role, bypasses RLS),
// writes cart_items + pantry_items as each user via their OWN session (anon
// key + password, i.e. subject to RLS like the real app), then asserts each
// user can only ever see their own rows — including when explicitly querying
// for the other user's user_id, which proves this is enforced by Postgres
// RLS and not just incidental app-level filtering. Cleans up after itself.
//
// Run: node --env-file=.env.local scripts/verify-rls.mjs

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY in the environment.',
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let failures = 0;
function assert(condition, message) {
  if (condition) {
    console.log(`  PASS  ${message}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${message}`);
  }
}

async function createTestUser(email, password) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`Failed to create test user ${email}: ${error.message}`);
  return data.user;
}

async function signInAs(email, password) {
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Failed to sign in as ${email}: ${error.message}`);
  return client;
}

async function main() {
  const stamp = Date.now();
  const emailA = `plantry-rls-test-a-${stamp}@example.com`;
  const emailB = `plantry-rls-test-b-${stamp}@example.com`;
  const password = 'Test-Password-123!';

  console.log('Creating two disposable test users…');
  const userA = await createTestUser(emailA, password);
  const userB = await createTestUser(emailB, password);

  console.log('Seeding two dummy products via service_role…');
  const { data: products, error: productError } = await admin
    .from('products')
    .insert([
      { name: 'RLS Test Product A', category: 'Test', allergens: [] },
      { name: 'RLS Test Product B', category: 'Test', allergens: [] },
    ])
    .select('id');
  if (productError) throw new Error(`Failed to seed products: ${productError.message}`);
  const [productA, productB] = products;

  try {
    console.log('Signing in as each test user…');
    const clientA = await signInAs(emailA, password);
    const clientB = await signInAs(emailB, password);

    console.log('Writing cart_items + pantry_items as each user…');
    const { error: cartAError } = await clientA
      .from('cart_items')
      .insert({ user_id: userA.id, product_id: productA.id, quantity: 2 });
    assert(!cartAError, `user A can insert their own cart_items (${cartAError?.message ?? 'ok'})`);

    const { error: cartBError } = await clientB
      .from('cart_items')
      .insert({ user_id: userB.id, product_id: productB.id, quantity: 3 });
    assert(!cartBError, `user B can insert their own cart_items (${cartBError?.message ?? 'ok'})`);

    const { error: pantryAError } = await clientA
      .from('pantry_items')
      .insert({ user_id: userA.id, name: 'A-only pantry item' });
    assert(!pantryAError, `user A can insert their own pantry_items (${pantryAError?.message ?? 'ok'})`);

    const { error: pantryBError } = await clientB
      .from('pantry_items')
      .insert({ user_id: userB.id, name: 'B-only pantry item' });
    assert(!pantryBError, `user B can insert their own pantry_items (${pantryBError?.message ?? 'ok'})`);

    console.log('Checking cart_items isolation…');
    const { data: cartAOwn } = await clientA.from('cart_items').select('*');
    assert(
      cartAOwn.length === 1 && cartAOwn[0].product_id === productA.id,
      'user A sees exactly their own cart_items row via unfiltered select',
    );

    const { data: cartACrossQuery } = await clientA
      .from('cart_items')
      .select('*')
      .eq('user_id', userB.id);
    assert(
      cartACrossQuery.length === 0,
      "user A explicitly querying user B's user_id returns zero rows (RLS, not app filtering)",
    );

    const { data: cartBOwn } = await clientB.from('cart_items').select('*');
    assert(
      cartBOwn.length === 1 && cartBOwn[0].product_id === productB.id,
      'user B sees exactly their own cart_items row via unfiltered select',
    );

    console.log('Checking pantry_items isolation…');
    const { data: pantryAOwn } = await clientA.from('pantry_items').select('*');
    assert(
      pantryAOwn.length === 1 && pantryAOwn[0].name === 'A-only pantry item',
      'user A sees exactly their own pantry_items row',
    );

    const { data: pantryACrossQuery } = await clientA
      .from('pantry_items')
      .select('*')
      .eq('user_id', userB.id);
    assert(
      pantryACrossQuery.length === 0,
      "user A explicitly querying user B's pantry_items user_id returns zero rows",
    );

    const { data: pantryBOwn } = await clientB.from('pantry_items').select('*');
    assert(
      pantryBOwn.length === 1 && pantryBOwn[0].name === 'B-only pantry item',
      'user B sees exactly their own pantry_items row',
    );

    console.log('Checking profiles isolation (auto-created by trigger)…');
    const { data: profileAOwn } = await clientA.from('profiles').select('user_id');
    assert(
      profileAOwn.length === 1 && profileAOwn[0].user_id === userA.id,
      "user A's profiles select returns only their own row",
    );

    console.log('Checking cross-user delete/update are no-ops, not errors…');
    const { error: deleteAttemptError, count: deleteCount } = await clientA
      .from('cart_items')
      .delete({ count: 'exact' })
      .eq('user_id', userB.id);
    assert(
      !deleteAttemptError && deleteCount === 0,
      "user A's delete targeting user B's cart_items affects zero rows",
    );
  } finally {
    console.log('Cleaning up test users and dummy products…');
    await admin.auth.admin.deleteUser(userA.id);
    await admin.auth.admin.deleteUser(userB.id);
    await admin.from('products').delete().in('id', [productA.id, productB.id]);
  }

  console.log('');
  if (failures === 0) {
    console.log(`All RLS isolation checks passed.`);
    process.exit(0);
  } else {
    console.error(`${failures} RLS isolation check(s) FAILED.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('verify-rls.mjs crashed:', err);
  process.exit(1);
});
