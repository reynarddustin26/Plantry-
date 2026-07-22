'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useProfile } from '@/lib/hooks/useProfile';
import { SEED_PRODUCTS, getProductById } from '@/lib/seed-data';
import { findSwapCandidates } from '@/lib/optimisation';
import { ANONYMOUS_SCORING_PROFILE } from '@/lib/scoring';
import { formatAud } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

function PanelHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <p className="font-semibold">💡 Optimiser suggestions</p>
      <button
        type="button"
        onClick={onClose}
        className="text-sm text-muted-foreground hover:text-foreground"
        aria-label="Close optimiser panel"
      >
        ✕
      </button>
    </div>
  );
}

// The optimiser is READ-ONLY on the cart until the user explicitly accepts a
// swap: findSwapCandidates only reads `items` to compute suggestions, it
// never calls removeItem/setQuantity itself. Only acceptSwap/acceptAll (both
// only reachable via an explicit click) touch the cart.
export function CartOptimiserPanel({ onClose }: { onClose: () => void }) {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const { profile } = useProfile();

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  if (items.length === 0) {
    return (
      <Card className="flex flex-col gap-3">
        <PanelHeader onClose={onClose} />
        <p className="text-sm text-muted-foreground">Add items to your cart first.</p>
      </Card>
    );
  }

  const swaps = findSwapCandidates(items, SEED_PRODUCTS, profile ?? ANONYMOUS_SCORING_PROFILE).filter(
    (swap) => !dismissed.has(swap.cartProductId),
  );
  const totalPotentialSavingAud = swaps.reduce((sum, s) => sum + s.savingsAud, 0);

  function acceptSwap(cartProductId: string, suggestedProductId: string, savingsAud: number) {
    const quantity = items.find((i) => i.productId === cartProductId)?.quantity ?? 1;
    removeItem(cartProductId);
    setQuantity(suggestedProductId, quantity);
    setDismissed((prev) => new Set(prev).add(cartProductId));
    setAcceptedCount((c) => c + 1);
    setToast(formatAud(savingsAud));
  }

  function acceptAll() {
    let saved = 0;
    const acceptedIds = new Set<string>();
    for (const swap of swaps) {
      const quantity = items.find((i) => i.productId === swap.cartProductId)?.quantity ?? 1;
      removeItem(swap.cartProductId);
      setQuantity(swap.suggestedProductId, quantity);
      saved += swap.savingsAud;
      acceptedIds.add(swap.cartProductId);
    }
    setDismissed((prev) => new Set([...prev, ...acceptedIds]));
    setAcceptedCount((c) => c + acceptedIds.size);
    setToast(formatAud(saved));
  }

  return (
    <Card className="flex flex-col gap-4">
      <PanelHeader onClose={onClose} />

      {toast && (
        <div
          className="rounded-lg px-3 py-2 text-center text-sm font-bold"
          style={{ background: 'var(--amber)', color: 'var(--text-dark)' }}
        >
          Saved {toast}
        </div>
      )}

      {swaps.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {acceptedCount > 0
            ? 'No more suggestions right now.'
            : 'Your basket is already well optimised! 🌱'}
        </p>
      )}

      {swaps.length > 0 && (
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
                    Accept swap
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

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total potential saving</span>
            <span className="font-bold" style={{ color: 'var(--emerald)' }}>
              {formatAud(totalPotentialSavingAud)}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={acceptAll}
              className="flex min-h-[40px] flex-1 items-center justify-center rounded-lg text-sm font-semibold text-white"
              style={{ background: 'var(--emerald)' }}
            >
              Accept all
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[40px] flex-1 items-center justify-center rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
