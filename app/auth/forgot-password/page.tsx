'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { requestPasswordReset } from '@/lib/actions/auth';

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, undefined);

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Reset your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send a reset link.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="min-h-[44px] rounded-lg border border-border bg-card px-3 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          />
        </label>

        {state?.message && (
          <p className="rounded-lg border border-primary bg-muted px-3 py-2 text-sm text-foreground">
            {state.message}
          </p>
        )}

        <Button type="submit" disabled={pending}>
          {pending ? 'Sending…' : 'Send reset link'}
        </Button>

        <Link href="/auth/signin" className="text-center text-sm font-semibold text-primary hover:underline">
          ← Back to sign in
        </Link>
      </form>
    </div>
  );
}
