-- Phase 10: adds the dietary-preference field the new onboarding wizard
-- collects (No restrictions/Vegetarian/Vegan/Keto/Gluten-free). Stored as an
-- array (one element in practice today) rather than a single text column so
-- it can hold more than one preference later without another migration.
--
-- NOT YET APPLIED to the live project as of this commit — this session has
-- no direct Postgres connection or Supabase Management API token, only the
-- anon/service-role API keys, none of which can run DDL. Run this file in
-- the Supabase SQL Editor (or `supabase db push` once linked) before
-- dietary preferences will actually persist. Until then, lib/hooks/useProfile.ts
-- and lib/actions/onboarding.ts degrade gracefully: the column is simply
-- absent from `select('*')`/omitted from the update payload on failure,
-- everything else about the profile still saves and loads correctly.
alter table profiles
  add column if not exists dietary_preferences text[] not null default '{}';
