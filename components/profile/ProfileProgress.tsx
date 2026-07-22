'use client';

import { useCartStore } from '@/store/cartStore';
import { SEED_PRODUCTS } from '@/lib/seed-data';
import { RECIPES } from '@/lib/recipes-data';
import { getCartSummary } from '@/lib/cart';
import { filterRecipes } from '@/lib/recipeMatching';
import { formatAud } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

interface ProfileProgressProps {
  weeklyBudget: number | null;
  proteinTarget: number | null;
}

// Every ring/stat here is either a real live computation (cart spend vs.
// budget, recipes matchable right now) or a real stated target
// (weeklyBudget, proteinTarget) — never a fabricated "progress toward"
// number for something this app has no way to measure. There's no food
// diary / consumption log anywhere in Plantry, so "protein consumed this
// week" doesn't exist as real data; showing the target alone (not a made-up
// percentage of it) is the honest version of this stat.
export function ProfileProgress({ weeklyBudget, proteinTarget }: ProfileProgressProps) {
  const items = useCartStore((s) => s.items);
  const cartProductIds = items.map((i) => i.productId);
  const summary = getCartSummary(items, SEED_PRODUCTS);
  const makeableCount = filterRecipes(RECIPES, { canMakeNow: true, cartProductIds }).length;

  const spent = summary.totalPriceAud;
  const pct = weeklyBudget && weeklyBudget > 0 ? Math.min(100, Math.round((spent / weeklyBudget) * 100)) : 0;

  return (
    <Card className="flex flex-col gap-4">
      <p className="font-semibold">Your progress</p>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-sm">
          <span>Budget this week</span>
          <span className="text-muted-foreground">
            {weeklyBudget != null ? `${formatAud(spent)} / ${formatAud(weeklyBudget)}` : 'Not set'}
          </span>
        </div>
        {weeklyBudget != null && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: pct > 100 ? 'var(--amber)' : 'var(--emerald)' }}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span>Protein target</span>
        <span className="text-muted-foreground">
          {proteinTarget != null ? `${proteinTarget}g/day` : 'Not set'}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span>Recipes you can make right now</span>
        <span className="font-semibold" style={{ color: 'var(--emerald)' }}>
          {makeableCount}
        </span>
      </div>
    </Card>
  );
}
