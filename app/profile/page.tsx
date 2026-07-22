import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileEditor } from '@/components/profile/ProfileEditor';

export default async function ProfilePage() {
  const supabase = await createClient();
  if (!supabase) redirect('/auth/signin');

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/signin');

  const [profileResult, allergiesResult, profileAllergiesResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('allergies').select('id, name').order('name'),
    supabase.from('profile_allergies').select('allergy_id').eq('user_id', user.id),
  ]);

  if (profileResult.error || !profileResult.data) {
    // The handle_new_user trigger should have created this row on sign-up;
    // its absence means something is genuinely wrong, not a normal case to
    // silently paper over.
    throw new Error(
      `Failed to load profile: ${profileResult.error?.message ?? 'no profile row found'}`,
    );
  }
  if (allergiesResult.error) {
    throw new Error(`Failed to load allergies: ${allergiesResult.error.message}`);
  }
  if (profileAllergiesResult.error) {
    throw new Error(`Failed to load your allergy selections: ${profileAllergiesResult.error.message}`);
  }

  return (
    <ProfileEditor
      profile={profileResult.data}
      email={user.email ?? ''}
      createdAt={profileResult.data.created_at}
      allergies={allergiesResult.data ?? []}
      selectedAllergyIds={(profileAllergiesResult.data ?? []).map((row) => row.allergy_id)}
    />
  );
}
