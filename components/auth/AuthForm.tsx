'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import type { AuthFormState } from '@/lib/auth-validation';

const inputClass =
  'min-h-[44px] rounded-lg border border-border bg-card px-3 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring';

interface AuthFormProps {
  mode: 'signup' | 'signin';
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
}

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isSignUp = mode === 'signup';

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">Email</span>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
        />
        {state?.errors?.email && (
          <p className="text-xs text-danger-text">{state.errors.email[0]}</p>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">Password</span>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          required
          className={inputClass}
        />
        {isSignUp && (
          <p className="text-xs text-muted-foreground">At least 8 characters.</p>
        )}
        {state?.errors?.password && (
          <p className="text-xs text-danger-text">{state.errors.password[0]}</p>
        )}
      </label>

      {isSignUp && (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Confirm password</span>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className={inputClass}
          />
          {state?.errors?.confirmPassword && (
            <p className="text-xs text-danger-text">{state.errors.confirmPassword[0]}</p>
          )}
        </label>
      )}

      {!isSignUp && (
        <Link href="/auth/forgot-password" className="self-end text-xs font-semibold text-primary hover:underline">
          Forgot password?
        </Link>
      )}

      {state?.message && (
        <p className="rounded-lg border border-danger bg-danger-bg px-3 py-2 text-sm text-danger-text">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? 'Please wait…' : isSignUp ? 'Sign up' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
        <Link
          href={isSignUp ? '/auth/signin' : '/auth/signup'}
          className="font-semibold text-primary hover:underline"
        >
          {isSignUp ? 'Sign in' : 'Sign up'}
        </Link>
      </p>
    </form>
  );
}
