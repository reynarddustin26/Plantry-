import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { Button } from '@/components/ui/Button';

export default async function OnboardingSetupPage() {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold">Accounts unavailable</h1>
        <p className="text-sm text-muted-foreground">
          Supabase isn&apos;t configured in this environment.
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

  const { data: allergies } = await supabase.from('allergies').select('id, name').order('name');

  return <OnboardingWizard allergies={allergies ?? []} />;
}
