'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { SEED_PRODUCTS } from '@/lib/seed-data';
import { RECIPES } from '@/lib/recipes-data';
import { getCartSummary } from '@/lib/cart';
import { filterRecipes } from '@/lib/recipeMatching';
import { findSwapCandidates, calculateSavingsSummary } from '@/lib/optimisation';
import { formatAud } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import type { DemoProfile } from '@/lib/types';

export function DashboardCartInsights({ profile }: { profile: DemoProfile }) {
  const items = useCartStore((s) => s.items);
  const cartProductIds = items.map((i) => i.productId);
  const summary = getCartSummary(items, SEED_PRODUCTS);

  const spent = summary.totalPriceAud;
  const budget = profile.weeklyBudget;
  const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const overBudget = spent > budget;

  const makeableRecipes = filterRecipes(RECIPES, { canMakeNow: true, cartProductIds });

  const swaps = findSwapCandidates(items, SEED_PRODUCTS, profile);
  const savings = calculateSavingsSummary(swaps, items);

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Weekly budget</span>
          <span className={overBudget ? 'font-semibold text-danger' : 'text-muted-foreground'}>
            {formatAud(spent)} / {formatAud(budget)}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-[width]"
            style={{
              width: `${pct}%`,
              background: overBudget ? 'var(--amber)' : 'var(--emerald)',
            }}
          />
        </div>
      </Card>

      <Card className="flex flex-col gap-2">
        <p className="font-semibold">Meals you can make now</p>
        {makeableRecipes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add a few more ingredients to your cart to unlock recipes.
          </p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {makeableRecipes.slice(0, 5).map((recipe) => (
              <li key={recipe.id}>
                <Link
                  href={`/cookbook/recipes/${recipe.id}`}
                  className="hover:underline"
                  style={{ color: 'var(--emerald)' }}
                >
                  {recipe.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="flex items-center justify-between">
        <p className="font-semibold">This week&apos;s savings</p>
        <p className="text-lg font-bold" style={{ color: 'var(--emerald)' }}>
          {formatAud(savings.totalSavingsAud)}
        </p>
      </Card>
    </div>
  );
}
