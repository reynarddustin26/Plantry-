'use client';

import { useEffect, useState } from 'react';
import { useAuthUser } from '@/lib/hooks/useAuthUser';
import { useProfileStore } from '@/store/profileStore';
import { createClient } from '@/lib/supabase/client';

export interface ChatUserContext {
  budget: number;
  allergens: string[];
  proteinTarget: number;
  preferredStores: string[];
}

// Real signed-in profile when available (fetched once, lazily, from
// Supabase), demo profile values otherwise — never a fabricated context.
export function useChatUserContext(): ChatUserContext {
  const user = useAuthUser();
  const demoProfile = useProfileStore((s) => s.profile);
  const [realContext, setRealContext] = useState<ChatUserContext | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      queueMicrotask(() => {
        if (!cancelled) setRealContext(null);
      });
      return () => {
        cancelled = true;
      };
    }

    const supabase = createClient();
    if (!supabase) return;

    (async () => {
      const [profileResult, allergiesResult, profileAllergiesResult] = await Promise.all([
        supabase.from('profiles').select('weekly_budget, protein_target, preferred_stores').eq('user_id', user.id).single(),
        supabase.from('allergies').select('id, name'),
        supabase.from('profile_allergies').select('allergy_id').eq('user_id', user.id),
      ]);
      if (cancelled || !profileResult.data) return;

      const nameById = new Map((allergiesResult.data ?? []).map((a) => [a.id, a.name]));
      const allergens = (profileAllergiesResult.data ?? [])
        .map((pa) => nameById.get(pa.allergy_id))
        .filter((name): name is string => Boolean(name));

      setRealContext({
        budget: profileResult.data.weekly_budget ?? demoProfile.weeklyBudget,
        allergens,
        proteinTarget: profileResult.data.protein_target ?? demoProfile.proteinTarget,
        preferredStores: (profileResult.data.preferred_stores as string[] | null) ?? demoProfile.preferredStores,
      });
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (realContext) return realContext;
  return {
    budget: demoProfile.weeklyBudget,
    allergens: demoProfile.allergies,
    proteinTarget: demoProfile.proteinTarget,
    preferredStores: demoProfile.preferredStores,
  };
}
