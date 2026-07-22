'use client';

import { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useProfile } from '@/lib/hooks/useProfile';
import { fetchSupabaseCart, syncCartToSupabase } from '@/lib/actions/cart';
import type { CartItem } from '@/lib/types';

function mergeCarts(local: CartItem[], remote: CartItem[]): CartItem[] {
  const byId = new Map<string, number>();
  for (const item of local) byId.set(item.productId, (byId.get(item.productId) ?? 0) + item.quantity);
  for (const item of remote) byId.set(item.productId, (byId.get(item.productId) ?? 0) + item.quantity);
  return Array.from(byId.entries()).map(([productId, quantity]) => ({ productId, quantity }));
}

// Signed-out: cart stays localStorage-only (unchanged existing behaviour).
// Signed-in: every local change is pushed to Supabase (debounced); the
// transition from signed-out to signed-in merges whatever was in
// localStorage with whatever was already saved to the account, keeping
// every item from both rather than one silently overwriting the other.
export function CartSupabaseSync() {
  const { profile } = useProfile();
  const items = useCartStore((s) => s.items);
  const setItems = useCartStore((s) => s.setItems);
  const wasSignedIn = useRef(false);
  const mergedForUser = useRef<string | null>(null);

  useEffect(() => {
    if (!profile) {
      wasSignedIn.current = false;
      return;
    }

    const justSignedIn = !wasSignedIn.current && mergedForUser.current !== profile.userId;
    wasSignedIn.current = true;

    if (justSignedIn) {
      mergedForUser.current = profile.userId;
      fetchSupabaseCart().then((remote) => {
        if (remote === null) return; // not configured, or migration 0003 not applied yet
        const merged = mergeCarts(useCartStore.getState().items, remote);
        setItems(merged);
        syncCartToSupabase(merged);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.userId]);

  useEffect(() => {
    if (!profile) return;
    const t = setTimeout(() => {
      syncCartToSupabase(items);
    }, 800);
    return () => clearTimeout(t);
  }, [profile, items]);

  return null;
}
