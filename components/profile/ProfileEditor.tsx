'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { updateProfile, deleteAccount } from '@/lib/actions/profile';
import { requestPasswordReset, signOut } from '@/lib/actions/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Intent, Store } from '@/lib/types';

interface ProfileRow {
  display_name: string | null;
  weekly_budget: number | null;
  protein_target: number | null;
  max_cooking_minutes: number | null;
  default_intent: Intent | null;
  preferred_stores: string[];
  dietary_preferences?: string[];
}

interface Allergy {
  id: string;
  name: string;
}

const STORES: Store[] = ['Coles', 'Woolworths', 'IGA', 'ALDI'];

const GOAL_OPTIONS: { id: Intent; label: string }[] = [
  { id: 'health', label: 'Hit protein/calorie targets' },
  { id: 'budget', label: 'Save money on groceries' },
  { id: 'convenience', label: 'Eat healthier' },
  { id: 'quick', label: 'Save time on meal planning' },
];

const DIETARY_OPTIONS: { id: string; label: string }[] = [
  { id: 'none', label: 'No restrictions' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'keto', label: 'Keto' },
  { id: 'gluten_free', label: 'Gluten-free' },
];

const inputClass =
  'min-h-[44px] rounded-lg border border-border bg-card px-3 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring';

function initialsFor(displayName: string | null, email: string): string {
  if (displayName?.trim()) {
    return displayName.trim().split(/\s+/).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('');
  }
  return email.charAt(0).toUpperCase();
}

export function ProfileEditor({
  profile,
  email,
  createdAt,
  allergies,
  selectedAllergyIds,
}: {
  profile: ProfileRow;
  email: string;
  createdAt: string;
  allergies: Allergy[];
  selectedAllergyIds: string[];
}) {
  const [state, formAction] = useActionState(updateProfile, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const [showSaved, setShowSaved] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(profile.display_name ?? '');
  const [weeklyBudget, setWeeklyBudget] = useState(profile.weekly_budget ?? 80);
  const [primaryGoal, setPrimaryGoal] = useState<Intent | ''>(profile.default_intent ?? '');
  const [proteinTarget, setProteinTarget] = useState(profile.protein_target ?? 120);
  const [maxCookingMinutes, setMaxCookingMinutes] = useState(profile.max_cooking_minutes ?? 30);
  const [dietaryPreference, setDietaryPreference] = useState(profile.dietary_preferences?.[0] ?? 'none');
  const [selectedAllergies, setSelectedAllergies] = useState<Set<string>>(new Set(selectedAllergyIds));
  const [preferredStores, setPreferredStores] = useState<Set<string>>(new Set(profile.preferred_stores));

  const [passwordState, passwordAction, passwordPending] = useActionState(requestPasswordReset, undefined);
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteAccount, undefined);
  const [confirmText, setConfirmText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Autosave: any field change re-submits the same form after a short
  // debounce, reusing the exact server-validated action a manual "Save"
  // button would call — there just isn't one.
  useEffect(() => {
    const t = setTimeout(() => formRef.current?.requestSubmit(), 700);
    return () => clearTimeout(t);
  }, [displayName, weeklyBudget, primaryGoal, proteinTarget, maxCookingMinutes, dietaryPreference, selectedAllergies, preferredStores]);

  useEffect(() => {
    if (state?.message !== 'Profile updated.') return;
    const t = setTimeout(() => setShowSaved(false), 2000);
    queueMicrotask(() => setShowSaved(true));
    return () => clearTimeout(t);
  }, [state]);

  function toggleAllergy(id: string) {
    setSelectedAllergies((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleStore(store: string) {
    setPreferredStores((prev) => {
      const next = new Set(prev);
      if (next.has(store)) next.delete(store);
      else next.add(store);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {showSaved && (
        <div
          className="fixed right-4 top-20 z-50 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg"
          style={{ background: 'var(--emerald)' }}
        >
          Saved ✓
        </div>
      )}

      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
          style={{ background: 'var(--emerald)' }}
        >
          {initialsFor(displayName, email)}
        </div>
        <div className="min-w-0 flex-1">
          {editingName ? (
            <input
              autoFocus
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={() => setEditingName(false)}
              className={inputClass}
            />
          ) : (
            <h1 className="truncate text-xl font-extrabold">{displayName || 'Add your name'}</h1>
          )}
          <p className="text-sm text-muted-foreground">{email}</p>
          <p className="text-xs text-muted-foreground">
            Member since {new Date(createdAt).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button variant="ghost" onClick={() => setEditingName((v) => !v)}>
          {editingName ? 'Done' : 'Edit'}
        </Button>
      </div>

      {/* Hidden form drives every autosave submit; every field below is a
          controlled input mirrored into a hidden input so the same
          server-validated FormData shape as onboarding is reused. */}
      <form ref={formRef} action={formAction} className="hidden">
        <input name="displayName" value={displayName} readOnly />
        <input name="weeklyBudget" value={weeklyBudget} readOnly />
        <input name="proteinTarget" value={proteinTarget} readOnly />
        <input name="maxCookingMinutes" value={maxCookingMinutes} readOnly />
        <input name="defaultIntent" value={primaryGoal} readOnly />
        <input name="dietaryPreference" value={dietaryPreference} readOnly />
        {Array.from(preferredStores).map((s) => (
          <input key={s} name="preferredStores" value={s} readOnly />
        ))}
        {Array.from(selectedAllergies).map((id) => (
          <input key={id} name="allergyIds" value={id} readOnly />
        ))}
      </form>

      <Card className="flex flex-col gap-4">
        <p className="font-semibold">Goals</p>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Weekly budget: ${weeklyBudget} / week</span>
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
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Primary goal</span>
          <select value={primaryGoal} onChange={(e) => setPrimaryGoal(e.target.value as Intent)} className={inputClass}>
            <option value="">Not set</option>
            {GOAL_OPTIONS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Protein target: {proteinTarget}g/day</span>
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
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Max cooking time (minutes)</span>
          <input
            type="number"
            min={5}
            value={maxCookingMinutes}
            onChange={(e) => setMaxCookingMinutes(Number(e.target.value))}
            className={inputClass}
          />
        </label>
      </Card>

      <Card className="flex flex-col gap-4">
        <div>
          <p className="font-semibold">Dietary &amp; allergens</p>
          <p className="text-xs text-muted-foreground">
            These settings affect every recommendation Plantry makes for you.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {allergies.map((allergy) => {
            const active = selectedAllergies.has(allergy.id);
            return (
              <button
                key={allergy.id}
                type="button"
                onClick={() => toggleAllergy(allergy.id)}
                className={`flex min-h-[36px] items-center gap-1.5 rounded-full border-2 px-3 text-xs font-semibold capitalize ${
                  active ? 'border-danger bg-danger-bg text-danger-text' : 'border-border bg-card text-muted-foreground hover:border-danger/50'
                }`}
              >
                {allergy.name}
                <span aria-hidden="true">{active ? '✕' : '+'}</span>
              </button>
            );
          })}
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Dietary preference</span>
          <select value={dietaryPreference} onChange={(e) => setDietaryPreference(e.target.value)} className={inputClass}>
            {DIETARY_OPTIONS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="font-semibold">Preferred stores</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STORES.map((store) => {
            const active = preferredStores.has(store);
            return (
              <button
                key={store}
                type="button"
                onClick={() => toggleStore(store)}
                className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border-2 px-3 text-sm font-semibold ${
                  active ? 'border-[var(--emerald)] bg-[var(--emerald)] text-white' : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}
              >
                {active && <span aria-hidden="true">✓</span>} {store}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="font-semibold">Account</p>

        <form action={passwordAction} className="flex flex-col gap-2">
          <input type="hidden" name="email" value={email} />
          <Button type="submit" variant="ghost" disabled={passwordPending} className="self-start">
            {passwordPending ? 'Sending…' : 'Change password'}
          </Button>
          {passwordState?.message && <p className="text-xs text-muted-foreground">{passwordState.message}</p>}
        </form>

        <form action={signOut}>
          <Button type="submit" variant="ghost" className="self-start text-danger">
            Sign out
          </Button>
        </form>

        {!showDeleteConfirm ? (
          <Button type="button" variant="ghost" className="self-start text-danger" onClick={() => setShowDeleteConfirm(true)}>
            Delete account
          </Button>
        ) : (
          <form action={deleteFormAction} className="flex flex-col gap-2 rounded-lg border border-danger bg-danger-bg p-3">
            <p className="text-sm text-danger-text">
              This permanently deletes your account and all data. Type <strong>DELETE</strong> to confirm.
            </p>
            <input
              name="confirmation"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className={inputClass}
            />
            {deleteState?.message && <p className="text-xs text-danger-text">{deleteState.message}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={confirmText !== 'DELETE' || deletePending} className="bg-danger hover:bg-danger/90">
                {deletePending ? 'Deleting…' : 'Permanently delete'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setShowDeleteConfirm(false); setConfirmText(''); }}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
