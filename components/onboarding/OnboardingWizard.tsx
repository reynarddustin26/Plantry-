'use client';

import { useActionState, useMemo, useState } from 'react';
import { saveOnboarding } from '@/lib/actions/onboarding';
import { rankByPersonalScore } from '@/lib/scoring';
import { SEED_PRODUCTS, DEMO_PROFILE } from '@/lib/seed-data';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/common/ProductCard';
import type { Store } from '@/lib/types';

const GOALS = [
  'Save money on groceries',
  'Hit my protein/calorie goals',
  'Avoid allergens safely',
  'Plan meals for the week',
];

const ALLERGEN_NAMES = ['dairy', 'gluten', 'peanut', 'tree nut', 'egg', 'seafood'];
const STORES: Store[] = ['Coles', 'Woolworths', 'IGA'];

interface Allergy {
  id: string;
  name: string;
}

export function OnboardingWizard({ allergies }: { allergies: Allergy[] }) {
  const [step, setStep] = useState(1);
  // Client-side only — there's no `goals` column in the profiles schema
  // (see PLAN.md), so this shapes the step-3 preview copy, not saved data.
  const [goals, setGoals] = useState<Set<string>>(new Set());
  const [budget, setBudget] = useState(80);
  const [selectedAllergyIds, setSelectedAllergyIds] = useState<Set<string>>(new Set());
  const [selectedStores, setSelectedStores] = useState<Set<Store>>(new Set(['Coles', 'Woolworths']));

  const [state, formAction, pending] = useActionState(saveOnboarding, undefined);

  const selectedAllergenNames = allergies
    .filter((a) => selectedAllergyIds.has(a.id))
    .map((a) => a.name);

  const preview = useMemo(() => {
    const syntheticProfile = {
      ...DEMO_PROFILE,
      weeklyBudget: budget,
      allergies: selectedAllergenNames,
      preferredStores: Array.from(selectedStores),
    };
    return rankByPersonalScore(SEED_PRODUCTS, syntheticProfile).slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budget, selectedStores, selectedAllergyIds]);

  function toggleSet<T>(set: Set<T>, value: T, setter: (s: Set<T>) => void) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 py-8">
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-1.5 flex-1 rounded-full"
            style={{ background: n <= step ? 'var(--emerald)' : 'var(--surface-light)' }}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-extrabold">What matters most to you?</h1>
          <div className="flex flex-col gap-2">
            {GOALS.map((goal) => (
              <label
                key={goal}
                className="flex min-h-[44px] items-center gap-3 rounded-lg border border-border bg-card px-3"
              >
                <input
                  type="checkbox"
                  checked={goals.has(goal)}
                  onChange={() => toggleSet(goals, goal, setGoals)}
                  className="h-5 w-5"
                />
                {goal}
              </label>
            ))}
          </div>
          <Button onClick={() => setStep(2)}>Continue</Button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5">
          <h1 className="text-2xl font-extrabold">Quick profile</h1>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold">
              Weekly budget: {new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(budget)}
            </span>
            <input
              type="range"
              min={40}
              max={200}
              step={5}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="h-2 w-full accent-[var(--emerald)]"
            />
          </label>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-semibold">Allergens to avoid</legend>
            <div className="flex flex-wrap gap-2">
              {allergies
                .filter((a) => ALLERGEN_NAMES.includes(a.name))
                .map((allergy) => (
                  <label key={allergy.id} className="flex items-center gap-2 text-sm capitalize">
                    <input
                      type="checkbox"
                      checked={selectedAllergyIds.has(allergy.id)}
                      onChange={() => toggleSet(selectedAllergyIds, allergy.id, setSelectedAllergyIds)}
                      className="h-5 w-5"
                    />
                    {allergy.name}
                  </label>
                ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-semibold">Preferred stores</legend>
            <div className="flex flex-wrap gap-3">
              {STORES.map((store) => (
                <label key={store} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedStores.has(store)}
                    onChange={() => toggleSet(selectedStores, store, setSelectedStores)}
                    className="h-5 w-5"
                  />
                  {store}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex justify-between gap-3">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)}>Continue</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form action={formAction} className="flex flex-col gap-5">
          <h1 className="text-2xl font-extrabold">Plantry is ready for you</h1>
          <p className="text-sm text-muted-foreground">Here are your top picks based on your goals →</p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {preview.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <input type="hidden" name="weeklyBudget" value={budget} />
          {Array.from(selectedAllergyIds).map((id) => (
            <input key={id} type="hidden" name="allergyIds" value={id} />
          ))}
          {Array.from(selectedStores).map((store) => (
            <input key={store} type="hidden" name="preferredStores" value={store} />
          ))}

          {state?.message && <p className="text-sm text-danger">{state.message}</p>}

          <div className="flex justify-between gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Take me to my basket'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
