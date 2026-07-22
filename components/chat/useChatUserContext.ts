'use client';

import { useProfile } from '@/lib/hooks/useProfile';

export interface ChatUserContext {
  budget: number | null;
  allergens: string[];
  proteinTarget: number | null;
  preferredStores: string[];
}

// Real signed-in profile only — returns null for signed-out visitors rather
// than falling back to any placeholder/demo values (never a fabricated
// context, per the app's core rule).
export function useChatUserContext(): ChatUserContext | null {
  const { profile } = useProfile();

  if (!profile) return null;

  return {
    budget: profile.weeklyBudget,
    allergens: profile.allergies,
    proteinTarget: profile.proteinTarget,
    preferredStores: profile.preferredStores,
  };
}
