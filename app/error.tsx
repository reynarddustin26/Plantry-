'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

// Wraps every page/loading/not-found file in app/ (Next.js 16 error.tsx
// convention — it does NOT cover app/layout.tsx itself, see global-error.tsx
// for that). One boundary here is the "every page" requirement in practice:
// error.tsx is inherited by every nested route segment, so 17 near-identical
// per-route files would be pure duplication with no extra coverage.
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error('Route error boundary caught:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-extrabold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        This page hit an unexpected error. Your Demo Profile, cart, and
        everything else stayed intact — nothing here relies on a network call
        that could have caused this.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => unstable_retry()}>Try again</Button>
        <Link href="/">
          <Button variant="ghost">Go home</Button>
        </Link>
      </div>
    </div>
  );
}
