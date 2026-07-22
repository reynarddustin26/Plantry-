import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth/AuthForm';
import { signUp } from '@/lib/actions/auth';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export default async function SignUpPage() {
  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect('/dashboard');
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-8">
      <div>
        <h1 className="text-2xl font-extrabold">Create an account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Save your profile, cart, and pantry across devices.
        </p>
      </div>

      {!isSupabaseConfigured() && (
        <p className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
          Accounts aren&apos;t configured in this environment — the Demo
          Profile works fully without one.
        </p>
      )}

      <AuthForm mode="signup" action={signUp} />
    </div>
  );
}
