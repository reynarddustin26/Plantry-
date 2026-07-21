// Supabase is optional infrastructure: Demo Profile and all local-seed-data
// features must keep working with these env vars entirely absent (blueprint
// §10 "Supabase unavailable" reliability requirement). Every Supabase call
// site checks this first instead of letting createClient() throw.
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
