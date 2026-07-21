-- Plantry Phase 5: initial schema, RLS.
-- Blueprint refs: docs/PLANTRY_MASTER_BLUEPRINT.md §5/§7, PLAN.md Section A.5.
--
-- Design notes (deviations from the blueprint's table list, documented not silent):
-- - `carts` is not a separate header table: the app has no multi-cart concept
--   (one active cart per user, matching the existing Zustand cartStore behaviour),
--   so `cart_items.user_id` alone stands in for it. Adding an unused `carts` row
--   per user would be an abstraction with no behaviour behind it.
-- - `store_products` holds no source/captured_at columns — provenance lives only
--   in `data_provenance`, per PLAN.md Section A.5's explicit note.
-- - `recipes.allergens text[]` is added beyond the blueprint's §7 delta snippet
--   because `lib/types.ts`'s `Recipe.allergens` already depends on it and the
--   delta snippet only shows changed columns, not a fully exhaustive table.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles (one row per authenticated user; Demo Profile never touches this)
-- ---------------------------------------------------------------------------
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  weekly_budget numeric(10,2),
  calorie_target integer,
  protein_target numeric(8,2),
  carb_target numeric(8,2),
  fat_target numeric(8,2),
  fibre_target numeric(8,2),
  max_cooking_minutes integer,
  default_intent text check (default_intent in ('budget','health','quick','convenience')),
  shopping_strategy text not null default 'balanced'
    check (shopping_strategy in ('balanced','budget_first','health_first')),
  preferred_stores text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles: owner select" on profiles
  for select using (auth.uid() = user_id);
create policy "profiles: owner insert" on profiles
  for insert with check (auth.uid() = user_id);
create policy "profiles: owner update" on profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profiles: owner delete" on profiles
  for delete using (auth.uid() = user_id);

-- Auto-create a profile row the moment someone signs up, so the app never has
-- to handle an authenticated user with no profile.
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------------------------------------------------------------------------
-- allergies: controlled vocabulary + aliases (safety-critical hard gate,
-- see lib/allergens.ts — names below match the strings already used in
-- lib/seed-data.ts / data/pricing-worksheet.csv so existing logic keeps working)
-- ---------------------------------------------------------------------------
create table allergies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  aliases text[] not null default '{}'
);

alter table allergies enable row level security;
create policy "allergies: public read" on allergies for select using (true);

insert into allergies (name, aliases) values
  ('dairy', array['milk', 'lactose']),
  ('gluten', array['wheat']),
  ('peanut', array['peanuts']),
  ('soy', array['soya', 'soybean']),
  ('tree nut', array['tree nuts', 'nuts']),
  ('egg', array['eggs']),
  ('fish', array['finfish']),
  ('shellfish', array['crustacean', 'crustaceans']),
  ('sesame', array['sesame seed']),
  ('lupin', array['lupine']);

create table profile_allergies (
  user_id uuid not null references auth.users(id) on delete cascade,
  allergy_id uuid not null references allergies(id) on delete cascade,
  primary key (user_id, allergy_id)
);

-- No index needed on user_id: it's the leading column of the composite
-- primary key above, so it's already indexed.

alter table profile_allergies enable row level security;
create policy "profile_allergies: owner select" on profile_allergies
  for select using (auth.uid() = user_id);
create policy "profile_allergies: owner insert" on profile_allergies
  for insert with check (auth.uid() = user_id);
create policy "profile_allergies: owner delete" on profile_allergies
  for delete using (auth.uid() = user_id);
-- No update policy: allergy_id is part of the primary key, so changing a
-- selection is a delete+insert (lib/actions/profile.ts's updateProfile does
-- exactly this) rather than an update — there's nothing to update in place.

-- ---------------------------------------------------------------------------
-- products / store_products: master catalog. Populated by Phase 6 ingestion
-- (service_role bypasses RLS); empty until then. The app keeps reading
-- lib/seed-data.ts locally through Phase 5 — see PLAN.md Section F.
-- ---------------------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  category text not null,
  allergens text[] not null default '{}',
  nutrition_per_100g jsonb,
  created_at timestamptz not null default now()
);

alter table products enable row level security;
create policy "products: public read" on products for select using (true);

create table store_products (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  store text not null check (store in ('Coles', 'Woolworths', 'IGA')),
  package_size text not null,
  price_aud numeric(10,2) not null check (price_aud > 0)
);

create index store_products_product_id_idx on store_products(product_id);
create index store_products_store_idx on store_products(store);

alter table store_products enable row level security;
create policy "store_products: public read" on store_products for select using (true);

-- ---------------------------------------------------------------------------
-- recipes / recipe_ingredients (blueprint §7; populated by curated data now,
-- Phase 6 recipe API later)
-- ---------------------------------------------------------------------------
create table recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  course text check (course in ('breakfast','main','snack','dessert','drink','meal_prep')),
  tags text[] not null default '{}',
  method text[] not null default '{}',
  allergens text[] not null default '{}',
  source text,
  source_id text,
  total_minutes integer,
  servings integer,
  instructions text[],
  equipment text[],
  storage_notes text,
  cost_per_serving numeric(10,2),
  created_at timestamptz not null default now()
);

alter table recipes enable row level security;
create policy "recipes: public read" on recipes for select using (true);

create table recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  name text not null,
  quantity numeric(10,2) not null,
  unit text not null,
  product_id uuid references products(id) on delete set null,
  pantry_staple boolean not null default false
);

create index recipe_ingredients_recipe_id_idx on recipe_ingredients(recipe_id);
create index recipe_ingredients_product_id_idx on recipe_ingredients(product_id);

alter table recipe_ingredients enable row level security;
create policy "recipe_ingredients: public read" on recipe_ingredients for select using (true);

-- ---------------------------------------------------------------------------
-- cart_items / pantry_items: the user-owned tables this phase's RLS gate
-- proves isolation on.
-- ---------------------------------------------------------------------------
create table cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  added_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table cart_items enable row level security;
create policy "cart_items: owner select" on cart_items
  for select using (auth.uid() = user_id);
create policy "cart_items: owner insert" on cart_items
  for insert with check (auth.uid() = user_id);
create policy "cart_items: owner update" on cart_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cart_items: owner delete" on cart_items
  for delete using (auth.uid() = user_id);

create table pantry_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name text not null,
  quantity numeric(10,2),
  unit text,
  added_at timestamptz not null default now()
);

create index pantry_items_user_id_idx on pantry_items(user_id);

alter table pantry_items enable row level security;
create policy "pantry_items: owner select" on pantry_items
  for select using (auth.uid() = user_id);
create policy "pantry_items: owner insert" on pantry_items
  for insert with check (auth.uid() = user_id);
create policy "pantry_items: owner update" on pantry_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "pantry_items: owner delete" on pantry_items
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- saved_journeys / recommendation_events: user-owned, schema-only this phase
-- (no UI yet — saved_journeys is Phase 2/Should backlog, recommendation_events
-- is a future analytics log per PLAN.md Section A.7)
-- ---------------------------------------------------------------------------
create table saved_journeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  intent text,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create index saved_journeys_user_id_idx on saved_journeys(user_id);

alter table saved_journeys enable row level security;
create policy "saved_journeys: owner select" on saved_journeys
  for select using (auth.uid() = user_id);
create policy "saved_journeys: owner insert" on saved_journeys
  for insert with check (auth.uid() = user_id);
create policy "saved_journeys: owner update" on saved_journeys
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "saved_journeys: owner delete" on saved_journeys
  for delete using (auth.uid() = user_id);

-- user_id is nullable (unlike every other user-owned table here) so
-- service_role ingestion/analytics code can log system-level events not tied
-- to a specific user; the "owner select/insert" policies below still gate
-- every regular authenticated client to auth.uid() = user_id, so a null-user
-- row is only ever visible to service_role, never to another user.
create table recommendation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index recommendation_events_user_id_idx on recommendation_events(user_id);

alter table recommendation_events enable row level security;
create policy "recommendation_events: owner select" on recommendation_events
  for select using (auth.uid() = user_id);
create policy "recommendation_events: owner insert" on recommendation_events
  for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- data_provenance: ingestion audit trail (blueprint §7, verbatim). Only
-- service_role (Phase 6 ingestion scripts) writes here; it bypasses RLS.
-- ---------------------------------------------------------------------------
create table data_provenance (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('product', 'recipe', 'store_product')),
  entity_id uuid not null,
  source text not null,
  captured_at timestamptz not null default now(),
  is_demo_data boolean not null default true
);

create index data_provenance_entity_idx on data_provenance(entity_type, entity_id);

alter table data_provenance enable row level security;
create policy "data_provenance: public read" on data_provenance for select using (true);
