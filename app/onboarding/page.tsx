import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export default async function OnboardingPage() {
  const supabase = await createClient();
  if (!supabase) redirect('/auth/signin');

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/signin');

  const { data: allergies } = await supabase.from('allergies').select('id, name').order('name');

  return <OnboardingWizard allergies={allergies ?? []} />;
}
