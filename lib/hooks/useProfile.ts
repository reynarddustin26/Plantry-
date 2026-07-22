'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import type { ShoppingStrategy, UserProfile } from '@/lib/types';

interface ProfileRow {
  display_name: string | null;
  weekly_budget: number | null;
  protein_target: number | null;
  max_cooking_minutes: number | null;
  default_intent: 'budget' | 'health' | 'quick' | 'convenience' | null;
  preferred_stores: string[];
  created_at: string;
  // Only present once supabase/migrations/0002_profile_dietary_preferences.sql
  // has been applied — see PLAN.md. `.select('*')` simply omits unknown
  // columns rather than erroring, so this stays undefined gracefully until then.
  dietary_preferences?: string[];
}

function deriveShoppingStrategy(intent: ProfileRow['default_intent']): ShoppingStrategy {
  if (intent === 'budget') return 'budget_first';
  if (intent === 'health') return 'health_first';
  return 'balanced';
}

// Real, account-backed profile only — returns null for signed-out users or
// when Supabase isn't configured. Never falls back to fabricated/demo data;
// callers that need an unauthenticated default must say so explicitly.
export function useProfile(): { profile: UserProfile | null; loading: boolean; refetch: () => void } {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // Not-configured means no async work will ever run for this hook, so
  // there's nothing to "load" — start already-settled rather than flipping
  // loading to false from inside the effect below.
  const [loading, setLoading] = useState(() => isSupabaseConfigured());
  const [refreshKey, setRefreshKey] = useState(0);
  // Sign-in/sign-up/sign-out happen via Server Actions (lib/actions/auth.ts),
  // which mutate the session cookie directly rather than going through the
  // browser Supabase client's own signIn/signOut methods — so its
  // onAuthStateChange listener never fires for them. A component mounted
  // once at the layout root (e.g. Header's account menu) would otherwise
  // stay on stale pre-sign-in state through the post-sign-in redirect.
  // Re-checking on every pathname change catches that transition for free,
  // since every one of those actions redirects to a different route.
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    if (!supabase) return;

    async function load() {
      const {
        data: { user },
      } = await supabase!.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const [profileResult, allergiesResult] = await Promise.all([
        supabase!.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase!.from('profile_allergies').select('allergies(name)').eq('user_id', user.id),
      ]);

      if (cancelled) return;

      if (profileResult.error || !profileResult.data) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const row = profileResult.data as ProfileRow;
      const allergyNames = (allergiesResult.data ?? [])
        .map((r) => (r as unknown as { allergies: { name: string } | null }).allergies?.name)
        .filter((name): name is string => Boolean(name));

      setProfile({
        userId: user.id,
        email: user.email ?? '',
        displayName: row.display_name,
        weeklyBudget: row.weekly_budget,
        proteinTarget: row.protein_target,
        maxCookingMinutes: row.max_cooking_minutes,
        defaultIntent: row.default_intent,
        shoppingStrategy: deriveShoppingStrategy(row.default_intent),
        dietaryPreferences: (row.dietary_preferences ?? []) as UserProfile['dietaryPreferences'],
        allergies: allergyNames,
        preferredStores: (row.preferred_stores ?? []) as UserProfile['preferredStores'],
        createdAt: row.created_at,
      });
      setLoading(false);
    }

    load();
    const { data: subscription } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, [refreshKey, pathname]);

  return { profile, loading, refetch: () => setRefreshKey((k) => k + 1) };
}
