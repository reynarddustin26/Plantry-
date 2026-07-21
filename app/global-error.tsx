'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';

// Catches errors thrown by app/layout.tsx itself, which app/error.tsx cannot
// (it wraps everything BELOW the layout, not the layout). Must define its
// own <html>/<body> — it fully replaces the root layout when active, so no
// metadata export is supported here.
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error('Root layout error boundary caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '1rem',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Plantry hit a problem</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '28rem' }}>
          Something went wrong loading the app shell itself. Reloading usually
          fixes this — it does not affect your saved cart or profile data.
        </p>
        <button
          onClick={() => unstable_retry()}
          style={{
            minHeight: 44,
            padding: '0.5rem 1.25rem',
            borderRadius: '0.5rem',
            background: '#059669',
            color: '#fff',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
