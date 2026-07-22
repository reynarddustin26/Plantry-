'use server';

import { createClient } from '@/lib/supabase/server';
import type { CartItem } from '@/lib/types';

// cart_items.product_id is a NOT NULL uuid FK against the (separately
// ingested, uuid-keyed) Supabase products table — see
// supabase/migrations/0003_cart_pantry_local_product_ids.sql, not yet
// applied (no DDL access from this session). Every call here fails
// gracefully (returns false, logs once) until that migration runs; the
// caller (components/common/CartSupabaseSync.tsx) treats that as "stay
// local-only for this session" rather than surfacing an error to the user —
// the cart itself, backed by localStorage, keeps working regardless.

export async function fetchSupabaseCart(): Promise<CartItem[] | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from('cart_items').select('product_id, quantity').eq('user_id', user.id);
  if (error) {
    console.error('fetchSupabaseCart failed (migration 0003 likely not applied yet):', error.message);
    return null;
  }

  return (data ?? []).map((row) => ({ productId: row.product_id, quantity: row.quantity }));
}

// Replaces the signed-in user's whole Supabase cart with `items` —
// simplest-correct approach for a cart this small, avoids reconciling
// per-row diffs.
export async function syncCartToSupabase(items: CartItem[]): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error: deleteError } = await supabase.from('cart_items').delete().eq('user_id', user.id);
  if (deleteError) {
    console.error('syncCartToSupabase delete failed (migration 0003 likely not applied yet):', deleteError.message);
    return false;
  }

  if (items.length === 0) return true;

  const { error: insertError } = await supabase.from('cart_items').insert(
    items.map((item) => ({ user_id: user.id, product_id: item.productId, quantity: item.quantity })),
  );
  if (insertError) {
    console.error('syncCartToSupabase insert failed (migration 0003 likely not applied yet):', insertError.message);
    return false;
  }

  return true;
}
