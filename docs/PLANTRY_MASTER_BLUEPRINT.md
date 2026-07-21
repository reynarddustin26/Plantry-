# Plantry — Master Blueprint (v2, supersedes SmartBasket v3/v4/v5)

Plantry: personalised grocery, nutrition, budgeting and meal-planning assistant.
Playful name, mascot-friendly brand — professional, trustworthy execution.

This document is the single source of truth going forward. It replaces the three
prior PDFs (v3 hackathon guide, v4 addendum, v5 expansion) — their good ideas are
folded in here, their contradictions resolved, and the scope changes below applied
throughout. Keep this file in `/docs/PLANTRY_MASTER_BLUEPRINT.md` and treat it as
canonical for Claude Code.

---

## 1. What changed from the old SmartBasket docs

| # | Old (SmartBasket) | New (Plantry) |
|---|---|---|
| 1 | Google OAuth via Supabase Auth | **Supabase Auth only** — email/password (+ optional magic link). No Google Cloud Console setup, no OAuth consent screen. Demo Profile still always works offline. |
| 2 | Custom domain purchase + DNS + registrar steps | **No purchase.** Ship on the free `*.vercel.app` domain. All domain/registrar sections are removed from the plan. |
| 3 | Curated seed data only, "avoid live scraping" | Real, professional data sources wired in from day one (see §5) — packaged product data from Open Food Facts, nutrient reference from USDA, AU pricing from a curated/manually-verified dataset, and a **swappable data-provider interface** so a licensed feed or retailer partnership can be dropped in later without touching the app. Cookbook uses a real recipe API, not placeholder text. |
| 4 | Website-first, native app "future phase" | Same, made explicit: **website is the deliverable that must work.** PWA/mobile wrapper is a stretch goal only if time remains — never at the cost of the website's stability. |
| 5 | Name: SmartBasket | **Plantry.** Brand tone: fun, a little goofy, plant/pantry pun — but the actual UI reads as professional and trustworthy (health + money data needs to feel credible, not cartoonish). |
| 6 | v3's screen mockups treated as the design | Those mockups are now **reference inspiration only.** Full creative authority on layout, IA, and visual system belongs to Claude Code, using 21st.dev + UI/UX Promax + the frontend-design skill. Brand direction is given in §4, not a locked layout. |
| 7 | Split across 3 documents with contradictions | This single document is canonical. |
| 8 | Hackathon-demo tolerance for fake data / broken edges | Every feature listed as "Must" in §8 has to actually work against a live Supabase backend on a real deployed URL — not just look right in a click-through. |

Everything else not called out above (deterministic calculations, AI-grounding
rules, RLS, safety-first allergen gating, savings transparency, etc.) carries over
unchanged from the original blueprint's principles.

---

## 2. Product vision

Plantry is an AI grocery decision engine. Give it a budget, body goals, allergies,
and available time — it compares real products, ranks them transparently, builds a
basket, and turns that basket into real meals from a genuinely useful cookbook.

**One-line pitch:** *"Tell Plantry your budget and your goals — it turns groceries
into a basket, and a basket into meals."*

**Personas** (unchanged from original): budget student, gym user, busy shopper,
allergy-sensitive user, health-conscious shopper.

---

## 3. Scope: website-primary, app-bonus

- **Primary deliverable**: a production-quality, fully responsive Next.js web app,
  deployed and reachable at a public `*.vercel.app` URL, backed by a real Supabase
  project. This must survive real use, not just a rehearsed demo path.
- **Bonus, time-permitting**: convert to an installable PWA. Do this only after every
  "Must" item in §8 is done and stable.
- **Out of scope for this build**: native iOS/Android app, custom domain, multi-store
  admin dashboards, semantic search (pgvector), payment/checkout. These stay as
  backlog notes, not tasks.

---

## 4. Brand & design direction (not a locked spec — creative authority is yours)

- **Name**: Plantry. Consider a simple plant/seedling mark as a wordmark accent —
  optional, not required.
- **Tone**: playful and warm in copy/microcopy (button labels, empty states, the
  savings dashboard) — but never at the expense of clarity for money/health/allergy
  information, which must always read as precise and trustworthy.
- **Visual system**: build your own — don't reproduce the v3 mockups verbatim. Use
  them only to understand *what information each screen needs to contain*, not how
  it should look. Use the UI/UX Promax skill and 21st.dev components to make actual
  design decisions (palette, type scale, spacing, card system, iconography). A
  loose starting point: fresh, natural greens/mints for trust and "grocery," warm
  accent for personalization/savings, red reserved strictly for allergy/safety
  warnings — but treat this as a suggestion, not a constraint, if a stronger system
  emerges.
- **Non-negotiables regardless of visual direction**: allergy warnings must be
  unmissable and never rely on color alone; every recommendation shows its reason,
  not just a score; minimum 44×44px touch targets; usable at phone width as a first-
  class experience, not a shrunk desktop layout.

---

## 5. Data strategy (real data, not placeholders — but legitimately sourced)

Build a `RetailDataProvider` / `RecipeDataProvider` interface so the source behind
each can be swapped without touching UI or business logic.

**Products & pricing**
- Packaged product metadata (ingredients, allergens, nutrition, barcode, images):
  **Open Food Facts API** — real, public, ToS-compliant.
- Nutrient reference data: **USDA FoodData Central API**.
- AU retail pricing (Coles/Woolworths/IGA): live scraping of these sites is against
  their Terms of Service and is fragile (selector changes, IP blocks) — not a solid
  foundation for something meant to work in real life. Instead: build a curated,
  manually-verified AU pricing dataset (60+ real products, real observed prices,
  each tagged with a `captured_at` date and a "demo data" label) as the default
  provider. Leave the provider interface ready to accept a licensed feed or retailer
  partnership later — that's a business step, not an engineering one, and it can
  happen after the hackathon without any frontend changes.
- The website **never** calls retailers directly. It only ever reads from Supabase,
  which is populated by whichever provider is configured.

**Cookbook / recipes**
- Use a real recipe API as the primary source rather than scraping recipe sites —
  this is both more "professional and accurate" and avoids copyright/ToS issues with
  recipe-site scraping. Good options: **Spoonacular API**, **Edamam Recipe API**, or
  **TheMealDB** (free, no key needed, smaller catalogue — good fallback/demo source).
  Normalize whichever is chosen into Plantry's own recipe schema (§7) and store in
  Supabase; the app never calls the recipe API live.
- Supplement with first-party curated recipes to fill gaps (e.g. Plantry-specific
  budget/student recipes) — label clearly which recipes are sourced vs. curated.
- **Cookbook categories** (this needs to be genuinely broad, not a token 4 tabs):
  - **Course**: breakfast, main, snack, dessert, drink, meal-prep
  - **Diet/tags**: vegan, vegetarian, gluten-free, dairy-free, keto, high-protein,
    low-calorie, budget, student, family, no-cook
  - **Method/occasion**: air-fryer, BBQ, one-pot, quick (<30 min), use-soon (pantry-
    match), can-make-now
  - Recipes carry `course` + `tags[]` + `method[]` so the same recipe can surface
    under multiple relevant filters (e.g. a vegan no-cook high-protein breakfast).
- Every recipe: ingredients with quantities, prep steps, prep/cook time, servings,
  nutrition per serving, allergens, equipment, substitutions, cost per serving,
  storage/leftover notes.

**Validation rules** (unchanged from original, still enforced): positive prices/
sizes, per-serving vs per-100g nutrition explicitly labeled, unknown values stay
`null` (never coerced to 0), controlled allergen vocabulary with aliases, image
fallback placeholders required.

---

## 6. Architecture

- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS.
- Backend: Next.js Route Handlers.
- Database: Supabase Postgres.
- Auth: **Supabase Auth, email/password only** (magic link optional bonus). No
  Google OAuth. Demo Profile always available as a fallback, independent of Auth/DB
  availability.
- State: Zustand for cart/profile; Zod for all request/response validation.
- Hosting: Vercel, free `*.vercel.app` URL. No custom domain.
- Images: Supabase Storage.
- AI: Claude/OpenAI API, server-side only, explanation-only and fully grounded (see
  §9) — never used for factual calculation.
- Data ingestion: a standalone script/pipeline (can run manually or on a schedule)
  that populates Supabase from the providers in §5. The website only ever reads
  from Supabase.

---

## 7. Database schema (delta from original — full schema still applies otherwise)

```sql
-- profiles: drop google-specific fields, keep everything else
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  weekly_budget numeric(10,2),
  calorie_target integer,
  protein_target numeric(8,2),
  carb_target numeric(8,2),
  fat_target numeric(8,2),
  fibre_target numeric(8,2),
  max_cooking_minutes integer,
  default_intent text,
  shopping_strategy text default 'balanced',
  created_at timestamptz default now()
);

-- recipes: broadened category system
create table recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  course text check (
    course in ('breakfast','main','snack','dessert','drink','meal_prep')
  ),
  tags text[] default '{}',       -- vegan, vegetarian, gluten_free, dairy_free,
                                    -- keto, high_protein, low_calorie, budget,
                                    -- student, family, no_cook
  method text[] default '{}',      -- air_fryer, bbq, one_pot, quick
  source text,                     -- 'spoonacular' | 'edamam' | 'themealdb' | 'curated'
  source_id text,                  -- external id for dedupe/refresh
  total_minutes integer,
  servings integer,
  instructions text[],
  equipment text[],
  storage_notes text,
  cost_per_serving numeric(10,2),
  created_at timestamptz default now()
);

-- retail_data_source: tracks which provider populated a given row, for auditability
create table data_provenance (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,       -- 'product' | 'recipe' | 'store_product'
  entity_id uuid not null,
  source text not null,
  captured_at timestamptz default now(),
  is_demo_data boolean default true
);
```

All other tables (`products`, `store_products`, `cart_items`, `pantry_items`,
`recipe_ingredients`, `allergies`, `profile_allergies`, `saved_journeys`,
`recommendation_events`) carry over from the original schema unchanged. Row Level
Security is mandatory on every user-owned table.

---

## 8. Feature scope (Definition of Done)

**Must (website, real backend, real deploy):**
- Intent-first opening ("What are you shopping for today?") → constraints → store
  selection → personalised feed.
- Search, filter, compare (up to 3 products), live cart totals (price + nutrition).
- Allergy conflict detection — hard gate, visually unmissable, not color-only.
- Cookbook spanning all categories in §5, with available/missing ingredient
  matching against the live cart/pantry.
- Basket optimiser proposing at least one real, explainable swap with $ savings.
- Transparent time/money savings dashboard (show the methodology, not a mystery
  number).
- Supabase Auth (email/password) with working sign-up/sign-in/sign-out, RLS proven
  to isolate users' data, and Demo Profile as an always-available fallback.
- Deployed to a public `*.vercel.app` URL, working in an incognito window.

**Should:**
- Pantry ("use what I have") mode.
- Magic-link sign-in as an Auth option.
- Grounded AI explanations on the comparison screen (see §9).

**Could (bonus):**
- PWA installability.
- A thin mobile companion view — bonus only, never displaces website work.

**Not in scope right now** (v5-style backlog — leave as `// TODO (backlog):`):
multi-retailer expansion beyond Coles/Woolworths/IGA, admin dashboards, pgvector
semantic search, deep analytics, licensed retailer feed integration, custom domain.

---

## 9. AI rules (unchanged principle, restated for clarity)

- All prices, nutrition totals, allergen detection, scores, and recipe matching are
  deterministic code — never delegated to the LLM.
- The AI model only ever receives already-calculated structured facts (profile +
  product/cart JSON + calculation JSON) and explains them in plain language, in
  ≤120 words, grounded strictly in what it was given.
- Validate AI output against a schema; on failure retry once with a stricter
  prompt, then fall back to a deterministic template. Never let a broken AI call
  break the app — deterministic features must work with the AI API key removed.

---

## 10. Reliability requirements (must actually hold up)

| Failure | Required behavior |
|---|---|
| AI API unavailable | Deterministic template explanation, no visible breakage |
| Supabase unavailable | Demo Profile + local seed data still usable |
| Recipe/product data source unavailable | Last-synced Supabase data still serves the site (ingestion is offline from the request path, so this should rarely matter) |
| Product image fails | Neutral placeholder, layout unaffected |
| Auth fails | Clear retry option + Demo Profile |
| Optimiser finds no safe swap | Explicit "no safe alternative found," current item kept |

---

## 11. Build phases

1. **Foundation & brand system** — Next.js/TS/Tailwind scaffold, Plantry visual
   identity (own design, using 21st.dev + UI/UX Promax), global layout/nav, intent-
   first opening + store-selection screens, Demo Profile, local seed data only.
2. **Core shopping flow** — product/recipe/cart types, real seed dataset (§5),
   search/filter/compare/cart, all with local data still (no Supabase yet).
3. **Deterministic intelligence** — scoring, unit price, protein-per-dollar,
   allergen gating, comparison explanations from calculated values, unit tests.
4. **Cookbook & optimiser** — full category system (§5), ingredient matching,
   basket optimiser, transparent savings dashboard.
5. **Supabase integration** — schema from §7 + original, RLS, **Supabase Auth
   email/password**, Demo Profile fallback proven to work with Supabase disabled.
6. **Data ingestion pipeline** — standalone script(s) implementing the
   `RetailDataProvider`/`RecipeDataProvider` interfaces against Open Food Facts,
   USDA, curated AU pricing, and the chosen recipe API; populates Supabase.
7. **Grounded AI explanations** — server-only route, schema-validated, timeout +
   fallback, rate-limited.
8. **Polish, reliability, deploy** — responsive pass, failure-matrix (§10)
   implemented, full acceptance checklist, deploy to `*.vercel.app`, verify in
   incognito.
9. **Bonus** — PWA conversion, only after 1–8 are stable.

---

## 12. Acceptance checklist

- `npm run build` succeeds.
- Every nav item opens a real, working page.
- Full journey: intent → store → search/compare → cart → cookbook → optimiser →
  savings, works end to end on a live deploy.
- Allergen conflicts are visible and excluded from auto-recommendations.
- Cookbook covers all categories in §5 with real recipe data, not lorem-ipsum.
- At least one optimiser swap changes cost and explains why.
- Sign-up/sign-in/sign-out work via Supabase Auth; a second test user cannot see
  the first user's cart/pantry (RLS proven).
- Demo Profile works with Supabase env vars removed.
- No factual value in AI output is unsupported by the calculation JSON sent to it.
- Mobile width (375px) is fully usable, not just "doesn't break."
- Production URL (`*.vercel.app`) works in an incognito browser.
