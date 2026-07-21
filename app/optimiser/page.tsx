'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useProfileStore } from '@/store/profileStore';
import { SEED_PRODUCTS, getProductById } from '@/lib/seed-data';
import { findSwapCandidates } from '@/lib/optimisation';
import { formatAud } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function OptimiserPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const profile = useProfileStore((s) => s.profile);

  const swaps = findSwapCandidates(items, SEED_PRODUCTS, profile);

  const swappedProductIds = new Set(swaps.map((s) => s.cartProductId));
  const keptItems = items.filter((i) => !swappedProductIds.has(i.productId));

  function applySwap(cartProductId: string, suggestedProductId: string) {
    const quantity = items.find((i) => i.productId === cartProductId)?.quantity ?? 1;
    removeItem(cartProductId);
    setQuantity(suggestedProductId, quantity);
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold">Basket optimiser</h1>
        <p className="text-sm text-muted-foreground">
          Add items to your cart first, then come back here for swap suggestions.
        </p>
        <Link href="/shop">
          <Button>Go to shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Basket optimiser</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explainable swaps within the same category — never to a product that
          conflicts with your allergies.
        </p>
      </div>

      {swaps.length > 0 ? (
        <div className="flex flex-col gap-3">
          {swaps.map((swap) => {
            const current = getProductById(swap.cartProductId);
            const suggested = getProductById(swap.suggestedProductId);
            if (!current || !suggested) return null;
            return (
              <Card key={swap.cartProductId} className="flex flex-col gap-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Swap</span>{' '}
                  <span className="font-semibold">{current.name}</span>{' '}
                  <span className="text-muted-foreground">for</span>{' '}
                  <span className="font-semibold">{suggested.name}</span>
                </p>
                <p className="text-sm text-primary">{swap.reason}</p>
                <p className="text-lg font-bold text-primary">
                  Save {formatAud(swap.savingsAud)}
                </p>
                <Button
                  variant="secondary"
                  onClick={() => applySwap(swap.cartProductId, swap.suggestedProductId)}
                >
                  Apply swap
                </Button>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-muted-foreground">
            No safe alternative found for your current items — everything in
            your cart is already kept as-is.
          </p>
        </Card>
      )}

      {keptItems.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold">Kept as-is</p>
          <div className="flex flex-col gap-2">
            {keptItems.map((item) => {
              const product = getProductById(item.productId);
              if (!product) return null;
              return (
                <p key={item.productId} className="text-sm text-muted-foreground">
                  {product.name} — no safe alternative found
                </p>
              );
            })}
          </div>
        </div>
      )}

      <Link
        href="/savings-dashboard"
        className="text-sm text-muted-foreground hover:text-primary"
      >
        View savings dashboard →
      </Link>
    </div>
  );
}
