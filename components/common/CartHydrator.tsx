'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';

// Rehydrates the persisted cart from localStorage after mount — see the
// skipHydration note in store/cartStore.ts for why this isn't automatic.
export function CartHydrator() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  return null;
}
