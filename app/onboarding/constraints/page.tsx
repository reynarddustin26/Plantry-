'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useProfileStore } from '@/store/profileStore';

const ALLERGEN_OPTIONS = [
  'dairy',
  'gluten',
  'peanut',
  'tree nut',
  'soy',
  'egg',
];

export default function ConstraintsPage() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const markConstraintsComplete = useProfileStore(
    (s) => s.markConstraintsComplete,
  );

  function toggleAllergen(allergen: string) {
    const has = profile.allergies.includes(allergen);
    updateProfile({
      allergies: has
        ? profile.allergies.filter((a) => a !== allergen)
        : [...profile.allergies, allergen],
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">A few constraints</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This is your Demo Profile — everything here works offline, no
          account needed.
        </p>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">Weekly budget (AUD)</span>
        <input
          type="number"
          min={1}
          step={0.01}
          value={profile.weeklyBudget}
          onChange={(e) =>
            updateProfile({ weeklyBudget: Number(e.target.value) })
          }
          className="min-h-[44px] rounded-lg border border-border bg-card px-3 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">
          Max cooking time (minutes)
        </span>
        <input
          type="number"
          min={1}
          value={profile.maxCookingMinutes}
          onChange={(e) =>
            updateProfile({ maxCookingMinutes: Number(e.target.value) })
          }
          className="min-h-[44px] rounded-lg border border-border bg-card px-3 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold">Allergies</legend>
        <div className="flex flex-wrap gap-2">
          {ALLERGEN_OPTIONS.map((allergen) => {
            const selected = profile.allergies.includes(allergen);
            return (
              <button
                key={allergen}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleAllergen(allergen)}
                className={`min-h-[44px] rounded-full border-2 px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  selected
                    ? 'border-danger bg-danger-bg text-danger-text'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}
              >
                {allergen}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex justify-between gap-3">
        <Button variant="ghost" onClick={() => router.push('/')}>
          Back
        </Button>
        <Button
          onClick={() => {
            markConstraintsComplete();
            router.push('/store-selection');
          }}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
