# Blocked items — tonight's Phase 5–8 run

**Status: RESOLVED.** Both items below were fixed later the same night — the
migration was applied via the SQL Editor and verified live (all 12 tables
reachable, `allergies` seeded), and `origin` now points at
`https://github.com/reynarddustin26/Plantry-.git` with `master` pushed and
in sync. `scripts/verify-rls.mjs` (12/12 checks) and `npm run ingest` (53
products, 27 recipes, 90 provenance rows) were both re-run for real against
the live project afterward — see PLAN.md Sections F and G. Left in place as
a record of what was blocked and why, not as an active warning.

Two genuine capability gaps found immediately (not after prolonged flailing) —
documented per that session's instructions rather than guessing or faking
success. Everything NOT blocked by these proceeded normally in that run.

## 1. Cannot apply the Supabase migration myself

`supabase/migrations/0001_init.sql` is written and reviewed (Phase 5), but a
live check just now confirms it has **not** been applied to the real project:

```
supabase.from('profiles').select(...) → PGRST205: Could not find the table 'public.profiles'
```

I only have `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. None of these can execute DDL:
- The service_role key authorizes PostgREST table CRUD, not arbitrary SQL.
- Running the migration via the Supabase CLI (`supabase db push`) or `psql`
  needs the Postgres **connection string/DB password**, which I don't have.
- The Supabase **Management API** (which can run SQL) needs a personal access
  token, also not present.

Earlier in this session you chose to paste the migration into the Supabase
SQL Editor yourself rather than hand me a DB password — that hasn't happened
yet (or didn't complete). **Action needed from you:** paste
`supabase/migrations/0001_init.sql` into the SQL Editor and run it, or give me
a DB connection string.

**Cascading effect:**
- Phase 5's `scripts/verify-rls.mjs` live proof cannot run until this lands —
  the script itself is finished and correct, just unexecuted.
- Phase 6's "populate Supabase products/recipes tables" step cannot write
  anywhere real until this lands. The ingestion pipeline code itself is built
  and correct; only the final live population run is blocked.

## 2. No git remote configured — cannot push to GitHub

```
git remote -v → (empty)
```

Phase 8 asks me to `git push` to a GitHub `main` branch so Vercel can
auto-deploy. There is no remote configured in this repo, and I have no GitHub
credentials to create one on your behalf. **Action needed from you:** add a
remote (`git remote add origin <url>`) and push yourself, or give me the repo
URL and confirm you want me to add it and push.

## What proceeded anyway

Everything not dependent on the above continued in this same run: Phase 5's
code + commit, Phase 6's ingestion pipeline code (buildable/testable, real
network calls to Open Food Facts/TheMealDB, but the final "write to Supabase"
step will only succeed once item 1 above is resolved), Phase 7's AI
explanation endpoint (fully functional in its deterministic-fallback mode,
since no `AI_API_KEY`/`ANTHROPIC_API_KEY` is present either — this is the
correct, required behavior per the blueprint, not a bug), and Phase 8's
polish/build verification (commit made; push skipped per item 2).
