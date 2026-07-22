'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { fetchNutritionByNames } from '@/lib/supabase/nutrition';
import { parsePackageSize } from '@/lib/nutrition';
import { useProfile } from '@/lib/hooks/useProfile';
import { Card } from '@/components/ui/Card';
import type { CartLineItem } from '@/lib/cart';

const DEFAULT_CALORIE_TARGET = 2000;
const DEFAULT_PROTEIN_TARGET = 50;

interface Totals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  itemsWithData: number;
  totalItems: number;
}

function barColor(percent: number): string {
  if (percent > 150) return 'var(--color-danger)';
  if (percent > 100) return 'var(--amber)';
  return 'var(--emerald)';
}

// value === null means "no cart item contributed any real data for this
// nutrient" — genuinely unknown, never rendered as a misleading 0.
function ProgressBar({
  label,
  value,
  unit,
  target,
}: {
  label: string;
  value: number | null;
  unit: string;
  target: number;
}) {
  const percent = value != null && target > 0 ? (value / target) * 100 : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold">
          {value != null ? value.toFixed(0) : '—'}
          {value != null && unit} <span className="font-normal text-muted-foreground">/ {target}{unit}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${Math.min(percent, 100)}%`, background: barColor(percent) }}
        />
      </div>
    </div>
  );
}

// Basket totals are real, computed from actual ingested nutrition_per_100g
// values × each product's parsed package weight × quantity — never a guess.
// A line item with no matching nutrition data (or a non-weight package
// size, e.g. "12pk") contributes nothing to the sum and is counted toward
// `totalItems` but not `itemsWithData` — when NO item has any data, the
// total itself is unknown ("—"), not a fabricated 0.
export function BasketNutritionSummary({ lineItems }: { lineItems: CartLineItem[] }) {
  const { profile } = useProfile();
  const [totals, setTotals] = useState<Totals | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    if (!supabase || lineItems.length === 0) return;

    fetchNutritionByNames(
      supabase,
      lineItems.map((li) => li.product.name),
    ).then((nutritionByName) => {
      if (cancelled) return;

      let calories = 0;
      let protein = 0;
      let carbs = 0;
      let fat = 0;
      let itemsWithData = 0;

      for (const { product, quantity } of lineItems) {
        const nutrition = nutritionByName.get(product.name);
        const parsed = parsePackageSize(product.packageSize);
        if (!nutrition || parsed?.totalGrams === undefined) continue;

        itemsWithData += 1;
        const factor = (parsed.totalGrams / 100) * quantity;
        calories += (nutrition.calories ?? 0) * factor;
        protein += (nutrition.protein ?? 0) * factor;
        carbs += (nutrition.carbs ?? 0) * factor;
        fat += (nutrition.fat ?? 0) * factor;
      }

      setTotals({ calories, protein, carbs, fat, itemsWithData, totalItems: lineItems.length });
    });

    return () => {
      cancelled = true;
    };
  }, [lineItems]);

  if (!totals) return null;

  const calorieTarget = DEFAULT_CALORIE_TARGET;
  const proteinTarget = profile?.proteinTarget || DEFAULT_PROTEIN_TARGET;
  const hasAnyData = totals.itemsWithData > 0;
  const isIncomplete = totals.itemsWithData < totals.totalItems;

  return (
    <Card className="flex flex-col gap-3">
      <p className="font-semibold">Basket nutrition total</p>
      <ProgressBar
        label="Calories"
        value={hasAnyData ? totals.calories : null}
        unit="kcal"
        target={calorieTarget}
      />
      <ProgressBar
        label="Protein"
        value={hasAnyData ? totals.protein : null}
        unit="g"
        target={proteinTarget}
      />
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Carbs</span>
        <span className="font-bold">{hasAnyData ? `${totals.carbs.toFixed(0)}g` : '—'}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Fat</span>
        <span className="font-bold">{hasAnyData ? `${totals.fat.toFixed(0)}g` : '—'}</span>
      </div>
      {isIncomplete && (
        <p className="text-xs italic text-muted-foreground">
          ⚠️ Estimate based on {totals.itemsWithData} of {totals.totalItems} items — some
          products lack complete nutrition data.
        </p>
      )}
    </Card>
  );
}
