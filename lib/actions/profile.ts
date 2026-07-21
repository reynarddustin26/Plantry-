'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { profileFormSchema, type ProfileFormState } from '@/lib/profile-validation';

// Postgres/PostgREST error messages can include column or constraint names —
// unlike Supabase Auth's curated user-facing error strings, they aren't meant
// for display. Log the real error server-side, show a generic one to the user.
const GENERIC_DB_ERROR = 'Something went wrong saving your profile. Please try again.';

export async function updateProfile(
  _state: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createClient();
  if (!supabase) {
    return { message: 'Accounts are unavailable right now.' };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/signin');

  const validated = profileFormSchema.safeParse({
    displayName: formData.get('displayName') ?? '',
    weeklyBudget: formData.get('weeklyBudget') ?? '',
    calorieTarget: formData.get('calorieTarget') ?? '',
    proteinTarget: formData.get('proteinTarget') ?? '',
    carbTarget: formData.get('carbTarget') ?? '',
    fatTarget: formData.get('fatTarget') ?? '',
    fibreTarget: formData.get('fibreTarget') ?? '',
    maxCookingMinutes: formData.get('maxCookingMinutes') ?? '',
    defaultIntent: formData.get('defaultIntent') ?? '',
    shoppingStrategy: formData.get('shoppingStrategy') ?? 'balanced',
    preferredStores: formData.getAll('preferredStores'),
    allergyIds: formData.getAll('allergyIds'),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { allergyIds, ...profileFields } = validated.data;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      display_name: profileFields.displayName,
      weekly_budget: profileFields.weeklyBudget,
      calorie_target: profileFields.calorieTarget,
      protein_target: profileFields.proteinTarget,
      carb_target: profileFields.carbTarget,
      fat_target: profileFields.fatTarget,
      fibre_target: profileFields.fibreTarget,
      max_cooking_minutes: profileFields.maxCookingMinutes,
      default_intent: profileFields.defaultIntent,
      shopping_strategy: profileFields.shoppingStrategy,
      preferred_stores: profileFields.preferredStores,
    })
    .eq('user_id', user.id);

  if (profileError) {
    console.error('updateProfile: profiles update failed:', profileError.message);
    return { message: GENERIC_DB_ERROR };
  }

  const { error: deleteError } = await supabase
    .from('profile_allergies')
    .delete()
    .eq('user_id', user.id);
  if (deleteError) {
    console.error('updateProfile: profile_allergies delete failed:', deleteError.message);
    return { message: GENERIC_DB_ERROR };
  }

  if (allergyIds.length > 0) {
    const { error: insertError } = await supabase
      .from('profile_allergies')
      .insert(allergyIds.map((allergyId) => ({ user_id: user.id, allergy_id: allergyId })));
    if (insertError) {
      console.error('updateProfile: profile_allergies insert failed:', insertError.message);
      return { message: GENERIC_DB_ERROR };
    }
  }

  revalidatePath('/profile');
  return { message: 'Profile updated.' };
}
