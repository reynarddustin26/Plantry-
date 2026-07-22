'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const onboardingSchema = z.object({
  weeklyBudget: z.coerce.number().positive(),
  allergyIds: z.array(z.string()),
  preferredStores: z.array(z.enum(['Coles', 'Woolworths', 'IGA'])),
});

export type OnboardingState = { message: string } | undefined;

// Only saves the real fields this step actually collects (budget,
// allergens, stores) — calorie/protein/carb/fat/fibre targets, max cooking
// minutes, and default intent stay whatever they already were (null for a
// brand new profile) rather than being silently overwritten with guessed
// values. The user fills those in later via /profile.
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
    weeklyBudget: formData.get('weeklyBudget'),
    allergyIds: formData.getAll('allergyIds'),
    preferredStores: formData.getAll('preferredStores'),
  });
  if (!validated.success) {
    return { message: 'Please check your budget and try again.' };
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      weekly_budget: validated.data.weeklyBudget,
      preferred_stores: validated.data.preferredStores,
    })
    .eq('user_id', user.id);
  if (profileError) {
    console.error('saveOnboarding: profiles update failed:', profileError.message);
    return { message: 'Could not save your profile. Please try again.' };
  }

  const { error: deleteError } = await supabase
    .from('profile_allergies')
    .delete()
    .eq('user_id', user.id);
  if (deleteError) {
    console.error('saveOnboarding: profile_allergies delete failed:', deleteError.message);
    return { message: 'Could not save your allergies. Please try again.' };
  }

  if (validated.data.allergyIds.length > 0) {
    const { error: insertError } = await supabase
      .from('profile_allergies')
      .insert(validated.data.allergyIds.map((allergyId) => ({ user_id: user.id, allergy_id: allergyId })));
    if (insertError) {
      console.error('saveOnboarding: profile_allergies insert failed:', insertError.message);
      return { message: 'Could not save your allergies. Please try again.' };
    }
  }

  redirect('/dashboard');
}
