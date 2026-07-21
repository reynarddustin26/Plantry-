import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/lib/actions/auth';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { Button } from '@/components/ui/Button';

export default async function ProfilePage() {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold">Accounts unavailable</h1>
        <p className="text-sm text-muted-foreground">
          Supabase isn&apos;t configured in this environment. Use the Demo
          Profile instead — it works fully offline.
        </p>
        <Link href="/demo-profile">
          <Button>Go to Demo Profile</Button>
        </Link>
      </div>
    );
  }

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

  const profile = profileResult.data;
  const allergies = allergiesResult.data;
  const profileAllergies = profileAllergiesResult.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="ghost">
            Sign out
          </Button>
        </form>
      </div>

      <ProfileForm
        profile={profile}
        allergies={allergies ?? []}
        selectedAllergyIds={(profileAllergies ?? []).map((row) => row.allergy_id)}
      />
    </div>
  );
}
