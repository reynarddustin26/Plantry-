'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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
    proteinTarget: formData.get('proteinTarget') ?? '',
    maxCookingMinutes: formData.get('maxCookingMinutes') ?? '',
    defaultIntent: formData.get('defaultIntent') ?? '',
    dietaryPreference: formData.get('dietaryPreference') ?? 'none',
    preferredStores: formData.getAll('preferredStores'),
    allergyIds: formData.getAll('allergyIds'),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { allergyIds, dietaryPreference, ...profileFields } = validated.data;

  const baseUpdate = {
    display_name: profileFields.displayName,
    weekly_budget: profileFields.weeklyBudget,
    protein_target: profileFields.proteinTarget,
    max_cooking_minutes: profileFields.maxCookingMinutes,
    default_intent: profileFields.defaultIntent,
    preferred_stores: profileFields.preferredStores,
  };

  // dietary_preferences isn't on the live profiles table yet (see
  // supabase/migrations/0002_profile_dietary_preferences.sql) — try with it,
  // fall back to without it so the rest of the profile still saves.
  const withDietary = await supabase
    .from('profiles')
    .update({ ...baseUpdate, dietary_preferences: [dietaryPreference] })
    .eq('user_id', user.id);

  if (withDietary.error) {
    const { error } = await supabase.from('profiles').update(baseUpdate).eq('user_id', user.id);
    if (error) {
      console.error('updateProfile: profiles update failed:', error.message);
      return { message: GENERIC_DB_ERROR };
    }
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

export async function deleteAccount(
  _state: { message: string } | undefined,
  formData: FormData,
): Promise<{ message: string } | undefined> {
  const supabase = await createClient();
  if (!supabase) return { message: 'Accounts are unavailable right now.' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/signin');

  if (formData.get('confirmation') !== 'DELETE') {
    return { message: 'Type DELETE to confirm.' };
  }

  // Row deletion (profiles, profile_allergies, cart_items, pantry_items) all
  // cascade from auth.users via "on delete cascade" FKs (migration 0001) —
  // deleting the auth user via the admin API removes everything else.
  // Identity is verified above via the normal session-bound client BEFORE
  // the elevated service-role client is ever touched, and only that
  // already-verified user's own id is ever passed to it.
  const admin = createAdminClient();
  if (!admin) return { message: 'Account deletion is unavailable right now.' };

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error('deleteAccount failed:', error.message);
    return { message: 'Could not delete your account. Please try again.' };
  }

  redirect('/');
}
