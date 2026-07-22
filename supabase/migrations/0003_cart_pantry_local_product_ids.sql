-- Phase 10: cart_items.product_id and pantry_items.product_id were defined
-- against `products(id)` (uuid) on the assumption the Supabase `products`
-- table would be the app's live catalog. In practice the app still sources
-- its catalog from lib/seed-data.ts (stable string ids like
-- "prod-coles-chicken-breast-fillets"), and the real ingested `products`
-- rows (Phase 6) use generated uuids with no shared key — see
-- lib/supabase/nutrition.ts, which bridges the two by product *name*
-- instead. Cart/pantry persistence needs to store the local catalog's real
-- id, so the uuid foreign key has to be relaxed to a plain text column.
--
-- NOT YET APPLIED to the live project — same reason as 0002 (no DDL access
-- from this session). Until this runs, lib/actions/cart.ts and
-- lib/actions/pantry.ts will fail their Supabase write (uuid-vs-text type
-- error) and fall back to local-only persistence (localStorage for cart,
-- an honest "couldn't save — try again" for pantry) rather than crashing.
alter table cart_items drop constraint if exists cart_items_product_id_fkey;
alter table cart_items alter column product_id type text using product_id::text;

alter table pantry_items drop constraint if exists pantry_items_product_id_fkey;
alter table pantry_items alter column product_id type text using product_id::text;
