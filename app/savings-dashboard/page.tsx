'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useProfileStore } from '@/store/profileStore';
import { SEED_PRODUCTS, getProductById } from '@/lib/seed-data';
import { findSwapCandidates, calculateSavingsSummary } from '@/lib/optimisation';
import { getCartSummary } from '@/lib/cart';
import { formatAud } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SavingsDashboardPage() {
  const items = useCartStore((s) => s.items);
  const profile = useProfileStore((s) => s.profile);

  const cartSummary = getCartSummary(items, SEED_PRODUCTS);
  const swaps = findSwapCandidates(items, SEED_PRODUCTS, profile);
  const savings = calculateSavingsSummary(swaps, items);
  const optimizedTotal = cartSummary.totalPriceAud - savings.totalSavingsAud;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold">Savings dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Add items to your cart to see your savings breakdown.
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
        <h1 className="text-2xl font-extrabold">Savings dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Weekly budget: {formatAud(profile.weeklyBudget)}
        </p>
      </div>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current cart total</span>
          <span className="font-semibold">{formatAud(cartSummary.totalPriceAud)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">If you applied every swap</span>
          <span className="font-semibold">{formatAud(optimizedTotal)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm font-semibold">Total identified savings</span>
          <span className="text-xl font-bold text-primary">
            {formatAud(savings.totalSavingsAud)}
          </span>
        </div>
      </Card>

      <Card className="flex flex-col gap-2">
        <p className="text-sm font-semibold">How this is calculated</p>
        <p className="text-xs text-muted-foreground">
          For each item in your cart, we compare its unit price ($ per 100g,
          100mL, or unit) against every other product in the same category.
          If a cheaper option exists that doesn&apos;t conflict with your
          declared allergies, it&apos;s counted as a savings opportunity.
          Nothing here is inferred or estimated — every $ figure comes
          directly from real catalog prices. Products that already have no
          cheaper safe alternative contribute $0.
        </p>
      </Card>

      {savings.swapCount > 0 ? (
        <div>
          <p className="mb-2 text-sm font-semibold">
            Savings by item ({savings.swapCount})
          </p>
          <div className="flex flex-col gap-2">
            {swaps.map((swap) => {
              const current = getProductById(swap.cartProductId);
              if (!current) return null;
              return (
                <div
                  key={swap.cartProductId}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{current.name}</span>
                  <span className="font-semibold text-primary">
                    {formatAud(swap.savingsAud)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No safe cheaper alternatives were found for your current cart.
        </p>
      )}

      <Link href="/optimiser" className="text-sm text-muted-foreground hover:text-primary">
        ← Back to optimiser
      </Link>
    </div>
  );
}
