import type { NutritionPer100g } from '@/lib/types';

const ROWS: Array<{ key: keyof NutritionPer100g; label: string; unit: string; digits: number }> = [
  { key: 'calories', label: 'Calories', unit: 'kcal', digits: 0 },
  { key: 'protein', label: 'Protein', unit: 'g', digits: 1 },
  { key: 'carbs', label: 'Carbs', unit: 'g', digits: 1 },
  { key: 'fat', label: 'Fat', unit: 'g', digits: 1 },
  { key: 'fibre', label: 'Fibre', unit: 'g', digits: 1 },
];

// Only per-100g values exist in the ingested data (no serving-size field),
// so this is honestly labelled "per 100g" rather than implying a serving
// size the app doesn't actually have.
export function NutritionPanel({ nutrition }: { nutrition: NutritionPer100g | null }) {
  if (!nutrition) {
    return (
      <p className="text-xs text-muted-foreground">
        Nutrition info not available for this product.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold text-muted-foreground">Nutrition per 100g</p>
      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        {ROWS.map(({ key, label, unit, digits }) => {
          const value = nutrition[key];
          return (
            <div
              key={key}
              className="flex items-center justify-between border-l-4 bg-card px-3 py-1.5 text-sm"
              style={{ borderLeftColor: 'var(--emerald)' }}
            >
              <span className="text-muted-foreground">{label}</span>
              <span className="font-bold">
                {value == null ? '—' : `${value.toFixed(digits)}${unit}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
