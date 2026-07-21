'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { authFormSchema, type AuthFormState } from '@/lib/auth-validation';

const SUPABASE_UNAVAILABLE_MESSAGE =
  'Accounts are unavailable right now — continue with the Demo Profile instead.';

export async function signUp(
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

  const { error } = await supabase.auth.signUp(validated.data);
  if (error) {
    return { message: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/profile');
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

  const { error } = await supabase.auth.signInWithPassword(validated.data);
  if (error) {
    return { message: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/profile');
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
