import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/config';

// service_role bypasses RLS — only ever call this from trusted, narrowly
// scoped server actions/route handlers that have ALREADY verified which
// user is making the request via the normal session-bound client (see
// lib/supabase/server.ts). Never accept a user id from client input here.
export function createAdminClient() {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
