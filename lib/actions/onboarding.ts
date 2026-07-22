'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const onboardingSchema = z.object({
  displayName: z.string().trim().min(1, 'Please tell us what to call you.'),
  weeklyBudget: z.coerce.number().positive(),
  primaryGoal: z.enum(['budget', 'health', 'quick', 'convenience']),
  allergyIds: z.array(z.string()),
  dietaryPreference: z.enum(['none', 'vegetarian', 'vegan', 'keto', 'gluten_free']),
  maxCookingMinutes: z.coerce.number().positive().nullable(),
  preferredStores: z.array(z.enum(['Coles', 'Woolworths', 'IGA', 'ALDI'])),
  proteinTarget: z.coerce.number().positive().nullable(),
});

export type OnboardingState = { message: string } | undefined;

// Saves everything the 3-step wizard collects. dietary_preferences is
// wrapped in a try/then-retry-without-it because that column doesn't exist
// on the live profiles table yet — see
// supabase/migrations/0002_profile_dietary_preferences.sql for why (no DDL
// access from this session to apply it). Every other field always saves.
export async function saveOnboarding(
  _state: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const supabase = await createClient();
  if (!supabase) return { message: 'Accounts are unavailable right now.' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/signin');

  const validated = onboardingSchema.safeParse({
    displayName: formData.get('displayName'),
    weeklyBudget: formData.get('weeklyBudget'),
    primaryGoal: formData.get('primaryGoal'),
    allergyIds: formData.getAll('allergyIds'),
    dietaryPreference: formData.get('dietaryPreference'),
    maxCookingMinutes: formData.get('maxCookingMinutes') || null,
    preferredStores: formData.getAll('preferredStores'),
    proteinTarget: formData.get('proteinTarget') || null,
  });
  if (!validated.success) {
    return { message: validated.error.issues[0]?.message ?? 'Please check your answers and try again.' };
  }

  const {
    displayName,
    weeklyBudget,
    primaryGoal,
    allergyIds,
    dietaryPreference,
    maxCookingMinutes,
    preferredStores,
    proteinTarget,
  } = validated.data;

  const baseUpdate = {
    display_name: displayName,
    weekly_budget: weeklyBudget,
    default_intent: primaryGoal,
    max_cooking_minutes: maxCookingMinutes,
    preferred_stores: preferredStores,
    protein_target: proteinTarget,
  };

  const withDietary = await supabase
    .from('profiles')
    .update({ ...baseUpdate, dietary_preferences: [dietaryPreference] })
    .eq('user_id', user.id);

  if (withDietary.error) {
    // 42703 = undefined_column — the not-yet-applied migration. Retry
    // without it so the rest of a brand-new profile still saves correctly.
    const { error } = await supabase.from('profiles').update(baseUpdate).eq('user_id', user.id);
    if (error) {
      console.error('saveOnboarding: profiles update failed:', error.message);
      return { message: 'Could not save your profile. Please try again.' };
    }
  }

  const { error: deleteError } = await supabase
    .from('profile_allergies')
    .delete()
    .eq('user_id', user.id);
  if (deleteError) {
    console.error('saveOnboarding: profile_allergies delete failed:', deleteError.message);
    return { message: 'Could not save your allergies. Please try again.' };
  }

  if (allergyIds.length > 0) {
    const { error: insertError } = await supabase
      .from('profile_allergies')
      .insert(allergyIds.map((allergyId) => ({ user_id: user.id, allergy_id: allergyId })));
    if (insertError) {
      console.error('saveOnboarding: profile_allergies insert failed:', insertError.message);
      return { message: 'Could not save your allergies. Please try again.' };
    }
  }

  redirect('/shop');
}
