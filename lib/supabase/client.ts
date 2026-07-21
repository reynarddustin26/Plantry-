'use client';

import { createBrowserClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/config';

// Returns null (never throws) when Supabase env vars are absent, so client
// components can fall back to the local Zustand/Demo Profile path instead of
// crashing — see blueprint §10 "Supabase unavailable" requirement.
export function createClient() {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
