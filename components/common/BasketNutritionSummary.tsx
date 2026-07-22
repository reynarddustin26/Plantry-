'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { fetchNutritionByNames } from '@/lib/supabase/nutrition';
import { parsePackageSize } from '@/lib/nutrition';
import { useProfileStore } from '@/store/profileStore';
import { Card } from '@/components/ui/Card';
import type { CartLineItem } from '@/lib/cart';

const DEFAULT_CALORIE_TARGET = 2000;
const DEFAULT_PROTEIN_TARGET = 50;

interface Totals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  incomplete: boolean;
}

function barColor(percent: number): string {
  if (percent > 150) return 'var(--color-danger)';
  if (percent > 100) return 'var(--amber)';
  return 'var(--emerald)';
}

function ProgressBar({ label, value, unit, target }: { label: string; value: number; unit: string; target: number }) {
  const percent = target > 0 ? (value / target) * 100 : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold">
          {value.toFixed(0)}
          {unit} <span className="font-normal text-muted-foreground">/ {target}{unit}</span>
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
// Line items with no matching nutrition data (or a non-weight package size,
// e.g. "12pk") are excluded from the sum and flagged via `incomplete`.
export function BasketNutritionSummary({ lineItems }: { lineItems: CartLineItem[] }) {
  const profile = useProfileStore((s) => s.profile);
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
      let incomplete = false;

      for (const { product, quantity } of lineItems) {
        const nutrition = nutritionByName.get(product.name);
        const parsed = parsePackageSize(product.packageSize);
        if (!nutrition || parsed?.totalGrams === undefined) {
          incomplete = true;
          continue;
        }
        const factor = (parsed.totalGrams / 100) * quantity;
        calories += (nutrition.calories ?? 0) * factor;
        protein += (nutrition.protein ?? 0) * factor;
        carbs += (nutrition.carbs ?? 0) * factor;
        fat += (nutrition.fat ?? 0) * factor;
        if (nutrition.calories == null || nutrition.protein == null) incomplete = true;
      }

      setTotals({ calories, protein, carbs, fat, incomplete });
    });

    return () => {
      cancelled = true;
    };
  }, [lineItems]);

  if (!totals) return null;

  const calorieTarget = profile.calorieTarget || DEFAULT_CALORIE_TARGET;
  const proteinTarget = profile.proteinTarget || DEFAULT_PROTEIN_TARGET;

  return (
    <Card className="flex flex-col gap-3">
      <p className="font-semibold">Basket nutrition total</p>
      <ProgressBar label="Calories" value={totals.calories} unit="kcal" target={calorieTarget} />
      <ProgressBar label="Protein" value={totals.protein} unit="g" target={proteinTarget} />
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Carbs</span>
        <span className="font-bold">{totals.carbs.toFixed(0)}g</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Fat</span>
        <span className="font-bold">{totals.fat.toFixed(0)}g</span>
      </div>
      {totals.incomplete && (
        <p className="text-xs italic text-muted-foreground">
          Nutrition estimate — some items lack complete data.
        </p>
      )}
    </Card>
  );
}
