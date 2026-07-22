'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { authFormSchema, signUpFormSchema, type AuthFormState } from '@/lib/auth-validation';

const SUPABASE_UNAVAILABLE_MESSAGE = 'Accounts are unavailable right now — please try again later.';

// Where to send a just-authenticated user: onboarding if they haven't
// finished it (no display_name yet), /shop otherwise. Never assumes a
// profile row is missing — the handle_new_user trigger (migration 0001)
// guarantees one exists the instant an account is created.
async function postSignInRedirect(supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>, userId: string) {
  const { data } = await supabase.from('profiles').select('display_name').eq('user_id', userId).single();
  redirect(data?.display_name ? '/shop' : '/onboarding');
}

export async function signUp(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validated = signUpFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { message: SUPABASE_UNAVAILABLE_MESSAGE };
  }

  const { error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
  });
  if (error) {
    return { message: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/onboarding');
}

export async function signIn(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validated = authFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { message: SUPABASE_UNAVAILABLE_MESSAGE };
  }

  const { data, error } = await supabase.auth.signInWithPassword(validated.data);
  if (error) {
    return { message: error.message };
  }

  revalidatePath('/', 'layout');
  await postSignInRedirect(supabase, data.user.id);
}

export async function requestPasswordReset(
  _state: { message: string } | undefined,
  formData: FormData,
): Promise<{ message: string } | undefined> {
  const email = formData.get('email');
  if (typeof email !== 'string' || !email.trim()) {
    return { message: 'Enter your email address first.' };
  }

  const supabase = await createClient();
  if (!supabase) return { message: SUPABASE_UNAVAILABLE_MESSAGE };

  // Never reveal whether an account exists for this email — same success
  // message either way.
  await supabase.auth.resetPasswordForEmail(email.trim());
  return { message: 'If an account exists for that email, a reset link is on its way.' };
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    // Redirect home either way — a failed signOut shouldn't strand the user
    // on an account page; the cookie/session will simply still be present.
    if (error) console.error('signOut failed:', error.message);
  }
  revalidatePath('/', 'layout');
  redirect('/');
}
