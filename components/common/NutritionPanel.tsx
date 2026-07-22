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
//
// isProteinWinner only highlights protein — "more protein is better" is a
// safe, deterministic claim (matches this app's existing protein-per-dollar
// framing); calories/carbs/fat have no universal "better" direction (it
// depends on the user's actual goal), so this deliberately never highlights
// those rows rather than asserting a value judgement it can't justify.
export function NutritionPanel({
  nutrition,
  isProteinWinner = false,
  label = 'Nutrition per 100g',
  emptyMessage = 'Nutrition info not available for this product.',
}: {
  nutrition: NutritionPer100g | null;
  isProteinWinner?: boolean;
  label?: string;
  emptyMessage?: string;
}) {
  if (!nutrition) {
    return <p className="text-xs text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        {ROWS.map(({ key, label, unit, digits }) => {
          const value = nutrition[key];
          const highlight = key === 'protein' && isProteinWinner && value != null;
          return (
            <div
              key={key}
              className="flex items-center justify-between border-l-4 px-3 py-1.5 text-sm"
              style={{
                borderLeftColor: 'var(--emerald)',
                background: highlight ? 'var(--surface-light)' : 'var(--color-card)',
              }}
            >
              <span className="text-muted-foreground">{label}</span>
              <span className="font-bold" style={highlight ? { color: 'var(--forest)' } : undefined}>
                {value == null ? '—' : `${value.toFixed(digits)}${unit}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
