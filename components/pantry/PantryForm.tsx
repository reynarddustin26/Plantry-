'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { addPantryItem } from '@/lib/actions/pantry';
import { SEED_PRODUCTS } from '@/lib/seed-data';

const inputClass =
  'min-h-[44px] rounded-lg border border-border bg-card px-3 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring';

// Real product names from the catalog, deduplicated — a native <datalist>
// gives a real search-and-select experience (type to filter, pick a match)
// without a custom autocomplete component. Users can still type a name not
// in the catalog (e.g. a homegrown ingredient); that's a feature, not a bug.
const PRODUCT_NAMES = Array.from(new Set(SEED_PRODUCTS.map((p) => p.name))).sort();

export function PantryForm() {
  const [state, formAction, pending] = useActionState(addPantryItem, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex flex-1 flex-col gap-1">
        <span className="text-sm font-semibold">Item</span>
        <input
          name="name"
          list="pantry-product-options"
          placeholder="Search products…"
          required
          className={inputClass}
        />
        <datalist id="pantry-product-options">
          {PRODUCT_NAMES.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </label>
      <label className="flex w-24 flex-col gap-1">
        <span className="text-sm font-semibold">Qty</span>
        <input type="number" step="0.1" name="quantity" className={inputClass} />
      </label>
      <label className="flex w-24 flex-col gap-1">
        <span className="text-sm font-semibold">Unit</span>
        <input name="unit" placeholder="kg" className={inputClass} />
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? 'Adding…' : 'Add'}
      </Button>
      {state?.errors?.name && (
        <p className="text-xs text-danger-text">{state.errors.name[0]}</p>
      )}
      {state?.message && <p className="text-xs text-danger-text">{state.message}</p>}
    </form>
  );
}
