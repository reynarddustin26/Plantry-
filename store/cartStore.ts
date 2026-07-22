import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/lib/types';

interface CartState {
  items: CartItem[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  setItems: (items: CartItem[]) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (productId) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            };
          }
          return { items: [...state.items, { productId, quantity: 1 }] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      setQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.productId !== productId) };
          }
          const existing = state.items.find((i) => i.productId === productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === productId ? { ...i, quantity } : i,
              ),
            };
          }
          // Upsert: a product not already in the cart (e.g. the optimiser's
          // swap target) must still be added, not silently dropped — a
          // .map() alone never matches a productId that isn't there yet.
          return { items: [...state.items, { productId, quantity }] };
        }),
      setItems: (items) => set({ items }),
      clear: () => set({ items: [] }),
    }),
    // Rehydrated explicitly post-mount (see CartHydrator) to avoid an
    // SSR/client hydration mismatch between the server's empty cart and
    // whatever is already in localStorage on the client.
    { name: 'plantry-cart', skipHydration: true },
  ),
);
