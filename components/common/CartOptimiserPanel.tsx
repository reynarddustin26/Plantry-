'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useProfileStore } from '@/store/profileStore';
import { SEED_PRODUCTS, getProductById } from '@/lib/seed-data';
import { findSwapCandidates } from '@/lib/optimisation';
import { formatAud } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

export function CartOptimiserPanel({ onClose }: { onClose: () => void }) {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const profile = useProfileStore((s) => s.profile);

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [accepted, setAccepted] = useState<{ productId: string; savingsAud: number }[]>([]);

  const swaps = findSwapCandidates(items, SEED_PRODUCTS, profile).filter(
    (swap) => !dismissed.has(swap.cartProductId) && !accepted.some((a) => a.productId === swap.cartProductId),
  );

  function acceptSwap(cartProductId: string, suggestedProductId: string, savingsAud: number) {
    const quantity = items.find((i) => i.productId === cartProductId)?.quantity ?? 1;
    removeItem(cartProductId);
    setQuantity(suggestedProductId, quantity);
    setAccepted((prev) => [...prev, { productId: cartProductId, savingsAud }]);
  }

  const totalAcceptedSavings = accepted.reduce((sum, a) => sum + a.savingsAud, 0);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Basket optimiser</p>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-muted-foreground hover:text-foreground"
          aria-label="Close optimiser panel"
        >
          ✕
        </button>
      </div>

      {swaps.length === 0 && accepted.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No safe cheaper alternatives were found for your current cart.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {swaps.map((swap) => {
          const current = getProductById(swap.cartProductId);
          const suggested = getProductById(swap.suggestedProductId);
          if (!current || !suggested) return null;
          return (
            <div key={swap.cartProductId} className="rounded-lg border border-border p-3">
              <p className="text-sm">
                <span className="font-semibold">{current.name}</span>
                <span className="text-muted-foreground"> → </span>
                <span className="font-semibold">{suggested.name}</span>
              </p>
              <p className="mt-1 text-sm font-bold" style={{ color: 'var(--emerald)' }}>
                Save {formatAud(swap.savingsAud)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{swap.reason}</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => acceptSwap(swap.cartProductId, swap.suggestedProductId, swap.savingsAud)}
                  className="flex min-h-[36px] flex-1 items-center justify-center rounded-lg text-sm font-semibold text-white"
                  style={{ background: 'var(--emerald)' }}
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => setDismissed((prev) => new Set(prev).add(swap.cartProductId))}
                  className="flex min-h-[36px] flex-1 items-center justify-center rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted"
                >
                  Skip
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {accepted.length > 0 && (
        <div
          className="rounded-lg px-3 py-2 text-center text-sm font-bold"
          style={{ background: 'var(--amber)', color: 'var(--text-dark)' }}
        >
          Total saved: {formatAud(totalAcceptedSavings)}
        </div>
      )}
    </Card>
  );
}
