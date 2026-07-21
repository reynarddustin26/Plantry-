'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { updateProfile } from '@/lib/actions/profile';

const inputClass =
  'min-h-[44px] rounded-lg border border-border bg-card px-3 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring';

interface ProfileRow {
  display_name: string | null;
  weekly_budget: number | null;
  calorie_target: number | null;
  protein_target: number | null;
  carb_target: number | null;
  fat_target: number | null;
  fibre_target: number | null;
  max_cooking_minutes: number | null;
  default_intent: 'budget' | 'health' | 'quick' | 'convenience' | null;
  shopping_strategy: 'balanced' | 'budget_first' | 'health_first';
  preferred_stores: string[];
}

interface Allergy {
  id: string;
  name: string;
}

const STORES = ['Coles', 'Woolworths', 'IGA'] as const;

export function ProfileForm({
  profile,
  allergies,
  selectedAllergyIds,
}: {
  profile: ProfileRow;
  allergies: Allergy[];
  selectedAllergyIds: string[];
}) {
  const [state, formAction, pending] = useActionState(updateProfile, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">Display name</span>
        <input
          name="displayName"
          defaultValue={profile.display_name ?? ''}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">Weekly budget (AUD)</span>
        <input
          type="number"
          step="0.01"
          name="weeklyBudget"
          defaultValue={profile.weekly_budget ?? ''}
          className={inputClass}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Calorie target</span>
          <input
            type="number"
            name="calorieTarget"
            defaultValue={profile.calorie_target ?? ''}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Protein target (g)</span>
          <input
            type="number"
            step="0.1"
            name="proteinTarget"
            defaultValue={profile.protein_target ?? ''}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Carb target (g)</span>
          <input
            type="number"
            step="0.1"
            name="carbTarget"
            defaultValue={profile.carb_target ?? ''}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Fat target (g)</span>
          <input
            type="number"
            step="0.1"
            name="fatTarget"
            defaultValue={profile.fat_target ?? ''}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Fibre target (g)</span>
          <input
            type="number"
            step="0.1"
            name="fibreTarget"
            defaultValue={profile.fibre_target ?? ''}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Max cooking time (min)</span>
          <input
            type="number"
            name="maxCookingMinutes"
            defaultValue={profile.max_cooking_minutes ?? ''}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">Default intent</span>
        <select
          name="defaultIntent"
          defaultValue={profile.default_intent ?? ''}
          className={inputClass}
        >
          <option value="">No preference</option>
          <option value="budget">Budget</option>
          <option value="health">Health</option>
          <option value="quick">Quick</option>
          <option value="convenience">Convenience</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">Shopping strategy</span>
        <select
          name="shoppingStrategy"
          defaultValue={profile.shopping_strategy}
          className={inputClass}
        >
          <option value="balanced">Balanced</option>
          <option value="budget_first">Budget first</option>
          <option value="health_first">Health first</option>
        </select>
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold">Preferred stores</legend>
        <div className="flex flex-wrap gap-3">
          {STORES.map((store) => (
            <label key={store} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="preferredStores"
                value={store}
                defaultChecked={profile.preferred_stores.includes(store)}
                className="h-5 w-5"
              />
              {store}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold">Allergies</legend>
        <div className="flex flex-wrap gap-3">
          {allergies.map((allergy) => (
            <label key={allergy.id} className="flex items-center gap-2 text-sm capitalize">
              <input
                type="checkbox"
                name="allergyIds"
                value={allergy.id}
                defaultChecked={selectedAllergyIds.includes(allergy.id)}
                className="h-5 w-5"
              />
              {allergy.name}
            </label>
          ))}
        </div>
      </fieldset>

      {state?.message && (
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${
            state.message === 'Profile updated.'
              ? 'border-primary bg-muted text-foreground'
              : 'border-danger bg-danger-bg text-danger-text'
          }`}
        >
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}
