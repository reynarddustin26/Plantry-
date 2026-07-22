'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useProfile } from '@/lib/hooks/useProfile';
import { SEED_PRODUCTS } from '@/lib/seed-data';
import { getCartSummary } from '@/lib/cart';
import { formatAud } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { PlantryMascot } from '@/components/common/PlantryMascot';
import { CartOptimiserPanel } from '@/components/common/CartOptimiserPanel';
import { BasketNutritionSummary } from '@/components/common/BasketNutritionSummary';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const { profile } = useProfile();
  const summary = getCartSummary(items, SEED_PRODUCTS);
  const [showOptimiser, setShowOptimiser] = useState(false);
  const budgetPercent =
    profile?.weeklyBudget && profile.weeklyBudget > 0
      ? Math.round((summary.totalPriceAud / profile.weeklyBudget) * 100)
      : null;

  if (summary.lineItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <PlantryMascot className="h-32 w-32" />
        <h1 className="text-2xl font-extrabold">Your basket is empty</h1>
        <p className="text-sm text-muted-foreground">
          Add products from the shop to see them here.
        </p>
        <Link
          href="/shop"
          className="font-semibold hover:underline"
          style={{ color: 'var(--emerald)' }}
        >
          Start shopping →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold">Your cart</h1>

      <div className="flex flex-col gap-3">
        {summary.lineItems.map(({ product, quantity, lineTotalAud }) => (
          <Card
            key={product.id}
            className="group flex flex-col gap-3 border-l-4 border-l-[var(--emerald)] sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-semibold">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                {product.store} · {formatAud(product.priceAud)} each
              </p>
            </div>
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${product.name}`}
                  onClick={() => setQuantity(product.id, quantity - 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 text-lg font-semibold hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  style={{ borderColor: 'var(--emerald)' }}
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold">{quantity}</span>
                <button
                  type="button"
                  aria-label={`Increase quantity of ${product.name}`}
                  onClick={() => setQuantity(product.id, quantity + 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 text-lg font-semibold hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  style={{ borderColor: 'var(--emerald)' }}
                >
                  +
                </button>
              </div>
              <p className="w-16 text-right font-semibold">
                {formatAud(lineTotalAud)}
              </p>
              <button
                type="button"
                aria-label={`Remove ${product.name} from cart`}
                onClick={() => removeItem(product.id)}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-danger opacity-100 transition-opacity hover:bg-danger-bg focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:opacity-0 sm:group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {summary.itemCount} item{summary.itemCount === 1 ? '' : 's'}
          </p>
        </div>
        <p className="text-xl font-bold" style={{ color: 'var(--forest)' }}>
          {formatAud(summary.totalPriceAud)}
        </p>
      </Card>

      {budgetPercent != null && profile?.weeklyBudget && (
        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Weekly budget</span>
            <span className="font-bold">
              {budgetPercent}% of your {formatAud(profile.weeklyBudget)} weekly budget
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-[width]"
              style={{
                width: `${Math.min(budgetPercent, 100)}%`,
                background: budgetPercent > 150 ? 'var(--color-danger)' : budgetPercent > 100 ? 'var(--amber)' : 'var(--emerald)',
              }}
            />
          </div>
        </Card>
      )}

      <BasketNutritionSummary lineItems={summary.lineItems} />

      <button
        type="button"
        onClick={() => setShowOptimiser((prev) => !prev)}
        className="flex min-h-[52px] items-center justify-center rounded-xl text-base font-bold transition-[filter] hover:brightness-110"
        style={{
          background: 'linear-gradient(135deg, var(--amber), var(--gold))',
          color: 'var(--forest)',
        }}
      >
        Optimise my basket
      </button>

      {showOptimiser && <CartOptimiserPanel onClose={() => setShowOptimiser(false)} />}

      <Link href="/shop" className="text-sm text-muted-foreground hover:text-primary">
        ← Continue shopping
      </Link>
    </div>
  );
}
