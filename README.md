# Plantry

Personalised grocery, nutrition, budgeting and meal-planning assistant. See
`docs/PLANTRY_MASTER_BLUEPRINT.md` for the full product spec and `PLAN.md` for
the implementation plan and phase-by-phase progress.

**Current status:** Phases 1–8 are code-complete and committed. Two things are
blocked on external input — see `BLOCKED.md` — before the app is fully live:
applying `supabase/migrations/0001_init.sql` to the real Supabase project, and
adding a git remote so this can be pushed/deployed. Everything else (shopping
flow, cookbook/optimiser, Supabase Auth, the data ingestion pipeline, the
grounded AI explanation endpoint, and the visual polish pass) works today.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The Demo Profile and full
62-product catalog work entirely offline — no environment variables or network
access required, ever (this is a hard reliability requirement, not just true
for early phases).

To exercise the Supabase-backed features (accounts, `/profile`, `/pantry`,
rate-limited state for `/api/ai/explain`), copy your Supabase project's URL +
anon key + service_role key into `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

For real AI-generated explanations instead of the deterministic fallback, also
set `GEMINI_API_KEY` (optional — the app is fully usable without it; get a
free key at https://aistudio.google.com/apikey).

## Scripts

```bash
npm run dev         # start the dev server
npm run build       # production build
npm run lint        # eslint (scoped to app/, components/, lib/, store/)
npm run test        # vitest (unit tests)
npm run e2e         # playwright (E2E, see E2E_TESTING.md)
npm run verify-rls   # proves cart_items/pantry_items RLS isolation against the real Supabase project
npm run ingest       # populates Supabase products/recipes from curated CSV + Open Food Facts + TheMealDB
```

`verify-rls` and `ingest` both require `.env.local` and a Supabase project
with the Phase 5 migration already applied.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4 + Zustand + Zod +
Framer Motion + Supabase (Postgres, Auth, RLS). See `PLAN.md` for the
full phase-by-phase build log and every scope decision made along the way.
