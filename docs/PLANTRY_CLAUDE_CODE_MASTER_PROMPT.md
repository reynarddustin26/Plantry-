# Plantry — Master Build Prompt for Claude Code (ECC-enabled)

Paste this into Claude Code in this repo. Before doing anything else, confirm
`/docs/PLANTRY_MASTER_BLUEPRINT.md` exists (it's the canonical spec — supersedes any
older SmartBasket PDFs still sitting in `/docs`; ignore those if present). If it's
missing, stop and ask me to add it.

You have the ECC plugin installed (67 subagents, workflow skills, slash commands,
rules, hooks). **Use it as intended — delegate, don't do everything inline.** This
prompt tells you which piece of ECC to reach for at each stage.

---

## 0. Orchestration model — how to use ECC for this build

- **Planning**: delegate to the `planner` and `architect` agents before writing
  code for each phase. `planner` turns the phase into a concrete task breakdown;
  `architect` sanity-checks structural/system decisions (schema shape, provider
  interfaces, route structure) against the blueprint.
- **Implementation**: write code directly, but follow `tdd-workflow` skill and the
  `tdd-guide` agent for anything with business logic (scoring, allergen matching,
  optimiser, cart totals) — tests first, per the `common/testing.md` rule (80%
  coverage on this kind of logic is the bar, not a suggestion).
- **Frontend**: use `frontend-patterns` skill + the `frontend-design` skill (built
  into Claude Code) + **21st.dev MCP** for component sourcing + **UI/UX Promax**
  skill for the actual design decisions. Plantry's brand direction is in blueprint
  §4 — you have creative authority on layout, don't reproduce old mockups.
- **Backend/API**: use `backend-patterns` and `api-design` skills for route
  structure, error responses, pagination where relevant.
- **Database**: use `postgres-patterns` and `database-migrations` skills for schema
  work; delegate schema/RLS review to the `database-reviewer` agent before moving
  to the next phase.
- **Code quality**: run `typescript-reviewer` and `code-reviewer` agents at the end
  of every phase, and `security-reviewer` specifically after Phase 5 (auth/RLS) and
  Phase 6 (data ingestion — API keys, rate limits, injection surfaces).
- **Build errors**: hand off to `build-error-resolver` immediately rather than
  hand-debugging — don't burn turns guessing.
- **E2E**: once Phase 2's shopping flow exists, set up Playwright via the
  `e2e-testing` skill and the `e2e-runner` agent for the core user journey (intent
  → cart → cookbook → savings). Re-run this suite at the end of every later phase —
  it's the regression net for the "must actually work in real life" requirement.
- **Docs**: keep `PLAN.md` and any README/setup docs current using `doc-updater`
  after each phase, not as a final cleanup step.
- **Unfamiliar APIs**: before integrating Open Food Facts, USDA FoodData Central,
  or the chosen recipe API (Spoonacular/Edamam/TheMealDB), use the `search-first`
  skill and/or `docs-lookup` agent to confirm current auth method, rate limits, and
  response shape rather than relying on possibly-stale memory of these APIs.
- **Slash commands available**: use `/plan` to kick off each phase, `/code-review`
  before marking a phase done, `/build-fix` on any stuck build error,
  `/quality-gate` as the final check before deploy, `/test-coverage` after Phase 3
  and Phase 4, `/update-docs` after each phase.
- **Rules**: follow `rules/common/*` and `rules/typescript/*` throughout —
  particularly `coding-style.md`, `git-workflow.md` (commit format), `testing.md`,
  and `security.md` (mandatory checks — especially relevant given this app handles
  allergy/health data).

---

## 1. Non-negotiable rules (from the blueprint, restated)

- Stack: Next.js App Router + TypeScript + Tailwind + Supabase (Postgres + **Auth,
  email/password only** — no Google OAuth) + Zustand + Zod.
- No custom domain, no purchases. Deploy target is the free `*.vercel.app` URL.
- Website is the deliverable. PWA is a bonus, only after everything else is stable.
  Native app is out of scope.
- The app never talks to retailers or recipe APIs live — it only reads from
  Supabase. Data ingestion is a separate offline pipeline (Phase 6) behind a
  `RetailDataProvider` / `RecipeDataProvider` interface (blueprint §5) — this is a
  good candidate for `architect` agent review before you build it.
- All factual calculations (price, nutrition, allergens, scores, matching) are
  deterministic code. The AI model only explains already-calculated facts, is
  server-side only, schema-validated, and falls back to a deterministic template if
  it fails or is unavailable.
- Allergen conflicts are a hard gate — never softened by scoring or by the AI.
- Demo Profile must work even with Supabase/Auth/AI entirely unavailable — this is
  the single most important reliability requirement.
- Brand name is **Plantry** everywhere (repo name, package.json, UI copy, README) —
  no leftover "SmartBasket" references.

---

## 2. Working method

1. Read `/docs/PLANTRY_MASTER_BLUEPRINT.md` in full.
2. Delegate to `planner` to produce `PLAN.md`: MVP scope, page list, component
   list, data models, DB tables, this phase list, and an acceptance test per phase.
   No application code yet. Have `architect` review `PLAN.md` before proceeding.
3. Work **one phase at a time** (§3 below). Per phase:
   - `/plan` the phase in detail.
   - Implement with TDD for business logic (`tdd-workflow`, `tdd-guide`).
   - Run `npm run lint` / `npm run build`; if stuck, hand off to
     `build-error-resolver`.
   - Run `code-reviewer` + `typescript-reviewer` (and `database-reviewer` /
     `security-reviewer` where noted in §0).
   - `/update-docs`, then commit per `git-workflow.md`.
   - Give me a short summary + the exact command to run the site locally, and stop
     for my review before the next phase unless I've told you to run ahead.
4. Keep `main` deployable after every phase — never leave it broken.
5. Only interrupt me for things not answerable from the blueprint or this prompt:
   real API keys/credentials, a design tie-break you're genuinely unsure about, or
   a scope question the blueprint doesn't resolve.

---

## 3. Phase plan

**Phase 1 — Foundation & brand system**
Scaffold Next.js/TS/Tailwind/Zustand/Zod. Build Plantry's own visual identity (21st.dev
+ UI/UX Promax + frontend-design skill — not the old mockups). Global layout/nav,
intent-first opening screen, store-selection screen, Demo Profile. Local data only.
*Gate*: `code-reviewer` pass; build green; usable at 375px width.

**Phase 2 — Core shopping flow**
Types, real seed dataset per blueprint §5 (still local at this stage), search,
filters, product cards/detail, comparison, persistent cart. Stand up Playwright via
`e2e-testing`/`e2e-runner` for the core journey.
*Gate*: E2E suite green for intent → cart.

**Phase 3 — Deterministic intelligence**
`lib/scoring.ts`, `lib/nutrition.ts`, `lib/allergens.ts`, `lib/optimisation.ts`.
TDD via `tdd-guide`. Allergen conflict = hard gate.
*Gate*: `/test-coverage` meets `testing.md` bar; `code-reviewer` pass.

**Phase 4 — Cookbook & optimiser**
Full category system from blueprint §5/§7 (course + tags + method). Ingredient
matching, optimiser with explainable swaps, transparent savings dashboard.
*Gate*: E2E suite extended to cover cookbook + optimiser; regression on Phases 1–3.

**Phase 5 — Supabase integration**
Schema from blueprint §7 + original tables. RLS on every user-owned table.
**Supabase Auth, email/password only** — sign-up/sign-in/sign-out, session
handling. Demo Profile proven to work with Supabase env vars removed.
*Gate*: `database-reviewer` + `security-reviewer` pass; RLS isolation test between
two users passes.

**Phase 6 — Data ingestion pipeline**
Standalone script(s) implementing `RetailDataProvider` (Open Food Facts + USDA +
curated AU pricing) and `RecipeDataProvider` (Spoonacular/Edamam/TheMealDB —
confirm current API shape via `search-first`/`docs-lookup` first). Populate
Supabase. Tag every row with provenance (`data_provenance` table) and
`captured_at`/`is_demo_data`.
*Gate*: `security-reviewer` on API key handling + rate limiting; site still reads
only from Supabase, never the live APIs.

**Phase 7 — Grounded AI explanations**
Server-only `/api/ai/explain` route, grounded prompt (blueprint §9), schema
validation, timeout + deterministic fallback, rate limiting, caching for repeated
identical inputs.
*Gate*: app fully usable with `AI_API_KEY` removed.

**Phase 8 — Polish, reliability, deploy**
Responsive pass across the whole app, failure matrix from blueprint §10
implemented, full acceptance checklist (blueprint §12) run and passing, deploy to
the free `*.vercel.app` URL, verify in an incognito window. `/quality-gate` as the
final check.

**Phase 9 — Bonus (only if 1–8 are fully stable)**
PWA conversion. Do not start this while any Phase 1–8 gate is still failing.

*(Backlog — not built now, leave as `// TODO (backlog):`)*: multi-retailer
expansion beyond Coles/Woolworths/IGA, admin dashboards, pgvector semantic search,
deep analytics, licensed retailer feed, custom domain.

---

## 4. Start now

Begin with step 2 in §2 (`planner` → `PLAN.md` → `architect` review), then proceed
to **Phase 1** and stop for my review once Phase 1's gate passes. Don't attempt
multiple phases in one pass.
