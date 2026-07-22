'use client';

import { useActionState, useState } from 'react';
import { saveOnboarding } from '@/lib/actions/onboarding';
import { Button } from '@/components/ui/Button';
import { SelectableCard } from '@/components/ui/Card';
import type { Intent, Store } from '@/lib/types';

interface Allergy {
  id: string;
  name: string;
}

// The Intent enum only has 4 values (budget/health/quick/convenience — set
// long before this wizard existed), but the wizard has 4 *different*
// goals to offer. "Eat healthier" doesn't have a clean home, so it borrows
// 'convenience' — the label shown to the user is accurate either way; only
// this stored enum value is an imperfect fit, and it only feeds the derived
// shopping strategy (lib/hooks/useProfile.ts), which treats quick/convenience
// identically ("balanced").
const GOALS: { id: Intent; emoji: string; label: string }[] = [
  { id: 'health', emoji: '💪', label: 'Hit protein/calorie targets' },
  { id: 'budget', emoji: '💰', label: 'Save money on groceries' },
  { id: 'convenience', emoji: '🥗', label: 'Eat healthier' },
  { id: 'quick', emoji: '⚡', label: 'Save time on meal planning' },
];

const ALLERGY_EMOJI: Record<string, string> = {
  peanut: '🥜',
  gluten: '🌾',
  dairy: '🥛',
  egg: '🥚',
  'tree nut': '🌳',
  fish: '🐟',
  shellfish: '🦐',
  soy: '🫘',
  sesame: '🌱',
  lupin: '🌼',
};

const DIETARY_OPTIONS: { id: 'none' | 'vegetarian' | 'vegan' | 'keto' | 'gluten_free'; label: string }[] = [
  { id: 'none', label: 'No restrictions' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'keto', label: 'Keto' },
  { id: 'gluten_free', label: 'Gluten-free' },
];

const COOKING_TIME_OPTIONS: { label: string; minutes: number | null }[] = [
  { label: 'Under 15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: 'No limit', minutes: null },
];

const STORES: Store[] = ['Coles', 'Woolworths', 'IGA', 'ALDI'];

const inputClass =
  'min-h-[44px] rounded-lg border border-border bg-card px-3 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring';

export function OnboardingWizard({ allergies }: { allergies: Allergy[] }) {
  const [state, formAction, pending] = useActionState(saveOnboarding, undefined);
  const [step, setStep] = useState(1);

  const [displayName, setDisplayName] = useState('');
  const [weeklyBudget, setWeeklyBudget] = useState(80);
  const [primaryGoal, setPrimaryGoal] = useState<Intent | null>(null);
  const [allergyIds, setAllergyIds] = useState<Set<string>>(new Set());
  const [dietaryPreference, setDietaryPreference] = useState<(typeof DIETARY_OPTIONS)[number]['id']>('none');
  const [cookingMinutes, setCookingMinutes] = useState<number | null>(30);
  const [preferredStores, setPreferredStores] = useState<Set<Store>>(new Set());
  const [proteinTarget, setProteinTarget] = useState(120);

  function toggleAllergy(id: string) {
    setAllergyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleStore(store: Store) {
    setPreferredStores((prev) => {
      const next = new Set(prev);
      if (next.has(store)) next.delete(store);
      else next.add(store);
      return next;
    });
  }

  const canContinueStep1 = displayName.trim().length > 0 && primaryGoal !== null;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className="h-1.5 flex-1 rounded-full"
            style={{ background: s <= step ? 'var(--emerald)' : 'var(--color-border, #e2e8f0)' }}
          />
        ))}
      </div>

      <form action={formAction} className="flex flex-col gap-6">
        {/* All fields stay mounted across steps (just hidden) so a single
            FormData submit on the final step carries everything. */}
        <input type="hidden" name="displayName" value={displayName} />
        <input type="hidden" name="weeklyBudget" value={weeklyBudget} />
        <input type="hidden" name="primaryGoal" value={primaryGoal ?? ''} />
        {Array.from(allergyIds).map((id) => (
          <input key={id} type="hidden" name="allergyIds" value={id} />
        ))}
        <input type="hidden" name="dietaryPreference" value={dietaryPreference} />
        <input type="hidden" name="maxCookingMinutes" value={cookingMinutes ?? ''} />
        {Array.from(preferredStores).map((s) => (
          <input key={s} type="hidden" name="preferredStores" value={s} />
        ))}
        {primaryGoal === 'health' && <input type="hidden" name="proteinTarget" value={proteinTarget} />}

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-2xl font-extrabold">Tell us about your goals</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                We&apos;ll use this to personalise every recommendation.
              </p>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold">Display name</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className={inputClass}
                placeholder="What should we call you?"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold">
                Your weekly grocery budget: ${weeklyBudget}
              </span>
              <input
                type="range"
                min={40}
                max={200}
                step={5}
                value={weeklyBudget}
                onChange={(e) => setWeeklyBudget(Number(e.target.value))}
                className="h-2 w-full accent-[var(--emerald)]"
              />
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">Primary goal</span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {GOALS.map((goal) => (
                  <SelectableCard
                    key={goal.id}
                    selected={primaryGoal === goal.id}
                    onClick={() => setPrimaryGoal(goal.id)}
                  >
                    <span className="text-2xl">{goal.emoji}</span>
                    <p className="mt-1 text-sm font-semibold">{goal.label}</p>
                  </SelectableCard>
                ))}
              </div>
            </div>

            <Button type="button" disabled={!canContinueStep1} onClick={() => setStep(2)} className="self-end">
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-2xl font-extrabold">Any dietary needs?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Allergen conflicts are hard-blocked everywhere in Plantry — never just a warning.
              </p>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-semibold">Allergens</legend>
              <div className="flex flex-wrap gap-2">
                {allergies.map((allergy) => (
                  <button
                    key={allergy.id}
                    type="button"
                    onClick={() => toggleAllergy(allergy.id)}
                    className={`flex min-h-[44px] items-center gap-1.5 rounded-full border-2 px-3 text-sm font-semibold capitalize transition-colors ${
                      allergyIds.has(allergy.id)
                        ? 'border-danger bg-danger-bg text-danger-text'
                        : 'border-border bg-card text-foreground hover:border-danger/50'
                    }`}
                  >
                    {ALLERGY_EMOJI[allergy.name] ?? '⚠️'} {allergy.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAllergyIds(new Set())}
                  className={`flex min-h-[44px] items-center gap-1.5 rounded-full border-2 px-3 text-sm font-semibold transition-colors ${
                    allergyIds.size === 0
                      ? 'border-[var(--emerald)] bg-[var(--emerald)] text-white'
                      : 'border-border bg-card text-foreground hover:border-primary/50'
                  }`}
                >
                  ✅ None of the above
                </button>
              </div>
            </fieldset>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">Dietary preference</span>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDietaryPreference(option.id)}
                    className={`flex min-h-[44px] items-center rounded-full border-2 px-4 text-sm font-semibold transition-colors ${
                      dietaryPreference === option.id
                        ? 'border-[var(--emerald)] bg-[var(--emerald)] text-white'
                        : 'border-border bg-card text-foreground hover:border-primary/50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">Max cooking time</span>
              <div className="flex flex-wrap gap-2">
                {COOKING_TIME_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setCookingMinutes(option.minutes)}
                    className={`flex min-h-[44px] items-center rounded-full border-2 px-4 text-sm font-semibold transition-colors ${
                      cookingMinutes === option.minutes
                        ? 'border-[var(--emerald)] bg-[var(--emerald)] text-white'
                        : 'border-border bg-card text-foreground hover:border-primary/50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="button" onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-2xl font-extrabold">Where do you shop?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick every store you&apos;re happy to shop at — we&apos;ll compare prices across all of them.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STORES.map((s) => (
                <SelectableCard key={s} selected={preferredStores.has(s)} onClick={() => toggleStore(s)}>
                  <p className="text-center font-semibold">{s}</p>
                </SelectableCard>
              ))}
            </div>

            {primaryGoal === 'health' && (
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Protein target: {proteinTarget}g/day</span>
                <input
                  type="range"
                  min={50}
                  max={250}
                  step={5}
                  value={proteinTarget}
                  onChange={(e) => setProteinTarget(Number(e.target.value))}
                  className="h-2 w-full accent-[var(--emerald)]"
                />
              </label>
            )}

            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted py-8 text-center">
              <p className="text-2xl">🌱</p>
              <p className="font-semibold">Plantry is ready for you</p>
            </div>

            {state?.message && (
              <p className="rounded-lg border border-danger bg-danger-bg px-3 py-2 text-sm text-danger-text">
                {state.message}
              </p>
            )}

            <div className="flex justify-between">
              <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? 'Saving…' : 'Start shopping'}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
