'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

// Client-side auth state for pages that are entirely Client Components
// (e.g. /shop). Returns null immediately (not "loading forever") when
// Supabase isn't configured — signed-out and not-configured look the same
// to every caller of this hook, which is the correct behavior: both mean
// "fall back to the unauthenticated experience."
export function useAuthUser(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  return user;
}
