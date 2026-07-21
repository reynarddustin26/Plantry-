# Plantry — PLAN.md

> Repo-level project plan. Section A is the full project plan (MVP scope, pages,
> components, data models, DB tables, 9-phase list with acceptance tests,
> backlog) produced by the `planner` agent from `docs/PLANTRY_MASTER_BLUEPRINT.md`
> and reviewed by the `architect` agent. Section B is the concrete kickoff/Phase-1
> execution plan currently being worked.

---

## Section A — Project Plan

### 1. MVP Scope Summary

Plantry is an AI-driven grocery decision engine that converts personalised
constraints (budget, goals, allergies, available time) into transparent product
recommendations, a smart shopping basket, and real meal plans. Users start with
an intent-first question ("What are you shopping for?"), refine their preferences
by store and dietary needs, browse and compare real products with live
price/nutrition totals, receive explainable basket optimisation suggestions with
concrete dollar savings, and then discover recipes that match their cart or
pantry. The app is a production-quality, fully responsive Next.js web app
deployed on a public Vercel URL, backed by real Supabase auth and a curated AU
pricing dataset; PWA conversion is a bonus-only stretch goal after all "Must"
features are stable.

### 2. Full Page / Route List

| Route | Description | Phase | Priority |
|-------|---|---|---|
| `/` | Intent-first home screen ("What are you shopping for?") | 1 | Must |
| `/onboarding/constraints` | Capture budget, calorie/macro/fibre targets, cooking time, allergies | 1 | Must |
| `/onboarding/store-selection` | Choose preferred store(s) (Coles, Woolworths, IGA) | 1 | Must |
| `/demo-profile` | Demo Profile viewer/setup — always available, zero network calls | 1 | Must |
| `/shop` | Main product browsing feed, filtered by store/intent/allergies | 2 | Must |
| `/shop/search` | Full-page search results with refine/filter controls | 2 | Must |
| `/shop/compare` | Side-by-side comparison of up to 3 products | 2 | Must |
| `/shop/product/:id` | Single product detail (ingredients, allergens, nutrition, price) | 2 | Must |
| `/cart` | Full cart view with live totals (price/cals/macros) | 2 | Must |
| `/cookbook` | Recipe browser with course/diet/method/occasion filters | 4 | Must |
| `/cookbook/recipes/:id` | Recipe detail (ingredients vs. cart, steps, nutrition, substitutions) | 4 | Must |
| `/optimiser` | Basket optimiser: proposed swaps with reasons + savings | 4 | Must |
| `/savings-dashboard` | Transparent savings/time breakdown with methodology shown | 4 | Must |
| `/pantry` | "Use what I have" mode | 2 | Should |
| `/profile/saved-journeys` | Saved shopping sessions for quick re-run | 2 | Should |
| `/auth/signup` | Supabase Auth email/password sign-up | 5 | Must |
| `/auth/signin` | Supabase Auth email/password sign-in (+ optional magic link) | 5 | Must |
| `/profile` | View/edit user profile, targets, allergies | 5 | Must |
| `/help` | FAQ, methodology notes, privacy | 8 | Polish |
| `/404` | Not found page | 8 | Polish |

### 3. Full Component List

- **UI primitives**: Button, Input, Select, Checkbox, Radio, Toggle, Modal,
  Toast, Skeleton, Badge, Icon, Spinner.
- **Layout/nav**: Header, Navigation, SidebarCart, Footer, LayoutMain,
  MobileMenu.
- **Auth**: SignUpForm, SignInForm, SignOutButton, AuthGuard,
  DemoProfileSetup, DemoProfileBadge.
- **Search/filter**: SearchBar, FilterPanel, SortSelector, AllergyWarning,
  CategoryTabs.
- **Product**: ProductCard, ProductImage, ProductNutritionBadge, AllergenList,
  PriceComparison, ProductDetails.
- **Cart**: CartItemRow, CartSummary, CartButton, CartEmpty, CartPromoAlert.
- **Cookbook**: RecipeCard, RecipeGrid, RecipeDetail, RecipeIngredientList,
  RecipeSubstitutions, RecipeCookTimeDisplay, RecipeNutritionFacts,
  RecipeFilterTabs.
- **Optimiser**: OptimiserProposal, OptimiserSummary, OptimiserSwapCard,
  OptimiserEmptyState, OptimiserDashboard.
- **Dashboards**: SavingsDashboard, NutritionSummary, AllergySummary,
  CartNutritionTotals, BudgetMeter, TimeEstimator, CostPerServing.
- **Pantry**: PantryItemForm, PantryItemList, PantryMatchStatus,
  PantryUploadModal (bonus).
- **Misc/feedback**: LoadingSpinner, ErrorBoundary, OfflineIndicator,
  AIExplanationBlock, FallbackTemplate, SuccessMessage, RetryButton.

Phase 1 builds only the primitives, layout, DemoProfileBadge, and the
`AllergyWarning`/`ReasoningSlot`(→ becomes part of AIExplanationBlock later)
slots — everything else lands in its associated phase above.

### 4. Data Models (core TypeScript types)

`DemoProfile`, `AuthUser`, `UserProfile`, `Product`, `StoreProduct`,
`NutritionInfo`, `DataProvenance`, `Cart`, `CartItem`, `PantryItem`, `Recipe`,
`RecipeIngredient`, `RecipeSubstitution`, `OptimiserSwap`,
`RecommendationEvent`, `Allergen`, `ProfileAllergen`, `SavingsSummary`,
`SavedJourney`, plus API request/response types (`IntentInput`,
`ConstraintsInput`, `ComparisonRequest`, `AIExplanationRequest`,
`AIExplanationResponse`). Full field-level shapes live in `lib/types.ts` as they
get built phase by phase — Phase 1 only needs `DemoProfile` and a minimal
`Product`.

### 5. Database Tables (Supabase Postgres, Phase 5+)

| Table | Purpose |
|---|---|
| `auth.users` | Supabase Auth users |
| `profiles` | User profile: budget, nutrition targets, preferences |
| `products` | Master product catalog |
| `store_products` | Price per store per product (provenance/capture metadata lives in `data_provenance`, not here) |
| `carts` / `cart_items` | Shopping basket and line items |
| `pantry_items` | User's pantry contents |
| `recipes` | Recipe catalog (course, tags[], method[]) |
| `recipe_ingredients` | Recipe ingredient list with quantities |
| `allergies` | Controlled allergen vocabulary + aliases |
| `profile_allergies` | User's allergen selections |
| `saved_journeys` | Saved shopping sessions |
| `recommendation_events` | Activity log for future analytics |
| `data_provenance` | Source/capture audit trail for every ingested row |

RLS mandatory on every user-owned table (Phase 5 gate).

### 6. Build Phases & Acceptance Tests

| Phase | Scope | Acceptance Test |
|---|---|---|
| 1: Foundation & Brand | Next.js/Tailwind scaffold, brand system, intent-first → constraints → store-selection screens, Demo Profile, local seed data only | `npm run build` green; home/constraints/store-selection/demo-profile navigable with zero network calls; usable at 375px; code-reviewer pass |
| 2: Core Shopping Flow | Product/cart types, real seed dataset, search/filter/compare (3-way), persistent cart | E2E: intent → search → compare → cart totals correct; cart persists on refresh |
| 3: Deterministic Intelligence | `lib/scoring.ts`, `lib/nutrition.ts`, `lib/allergens.ts`, `lib/optimisation.ts`, TDD, 80%+ coverage | Allergen-conflicted products hard-gated (never auto-recommended); unit price/protein-per-$ correct; all tests green |
| 4: Cookbook & Optimiser | Full course/tag/method category system, ingredient matching, optimiser, savings dashboard | Recipe filters all functional; ≥1 optimiser swap with $ delta and reason; savings dashboard shows methodology, not a bare number |
| 5: Supabase Integration | Schema (§5 above), RLS, Supabase Auth email/password, Demo Profile fallback proven | Two test users' carts/pantry provably isolated (RLS); Demo Profile still works with Supabase env vars removed |
| 6: Data Ingestion Pipeline | `RetailDataProvider`/`RecipeDataProvider` scripts against Open Food Facts, USDA, curated AU pricing (`data/pricing-worksheet.csv`), chosen recipe API | Supabase populated with provenance-tagged rows; site never calls these APIs live, only reads Supabase |
| 7: Grounded AI Explanations | Server-only `/api/ai/explain`, schema-validated, timeout + deterministic fallback, rate-limited | App fully usable with `AI_API_KEY` removed; no unsupported factual claims in AI output |
| 8: Polish, Reliability, Deploy | Responsive pass, failure matrix (blueprint §10), full acceptance checklist (§12), deploy to `*.vercel.app` | Full journey works end-to-end on live deploy in incognito; every failure-matrix case degrades gracefully |

**Phase 8 design-polish note (from user feedback during Phase 1):** Phase 1's
components are intentionally flat Tailwind defaults — visual polish is explicitly
deferred to Phase 8, not skipped. When Phase 8 starts: search 21st.dev more
aggressively for card/button/badge/hero-section components with real hover
states and micro-interactions (a single generic query returned only a weak
"Announcement" match — try more targeted queries per component type), and check
`ui-ux-pro-max`'s `motion.csv`/`react-performance.csv` data for animation/motion
guidance, not just static colors — in service of blueprint §4's "fun/goofy but
professional" brand direction, which Phase 1's plain cards don't yet express.
| 9: Bonus — PWA | Service worker, manifest, offline fallback — only after 1–8 are stable | Installable, works offline for cached data, zero regression in 1–8 |

### 7. Not in Scope / Backlog

Multi-retailer expansion beyond Coles/Woolworths/IGA, admin dashboards, pgvector
semantic search, deep analytics/reporting, licensed retailer feed integration,
custom domain, payment/checkout, native iOS/Android apps, email notifications,
social features. Leave as `// TODO (backlog):` if referenced in code.

---

## Section B — Kickoff + Phase 1 Execution Plan (current work)

### Context

The repo is **greenfield**: no `package.json`, no app code, no git history —
only `.claude/` (ECC plugin), `.mcp.json` (21st.dev MCP already enabled),
`docs/PLANTRY_MASTER_BLUEPRINT.md` (canonical spec), and
`data/pricing-worksheet.csv` — a **real, pre-existing curated AU pricing
dataset** (62 product rows across Coles/Woolworths/IGA: `store, product_name,
brand, category, package_size, price_aud, unit_price_note, barcode, allergens,
captured_at, notes`). This CSV is exactly the blueprint §5 curated pricing
dataset — later phases use it rather than inventing one.

Toolchain confirmed available: node v24.18.0, npm 11.16.0, git 2.55.0 (Windows,
PowerShell primary).

Per the master prompt: work **one phase at a time**, stop for user review after
each phase's gate passes. This section covers only Phase 1.

### Step 1 — Scaffold (git + Next.js)
- `git init`; config commit author.
- `npx create-next-app@latest .` — TypeScript, Tailwind, App Router, import
  alias `@/*`. Accept whatever ESLint config format the installed
  `create-next-app` version actually generates.
- Install `zustand`, `zod`; dev deps `vitest`, `@testing-library/react`,
  `@testing-library/jest-dom`, `jsdom` for a minimal test harness.
- `.gitignore`: `node_modules`, `.next`, `.env*`.

### Step 2 — Folder conventions
```
app/            page.tsx, onboarding/constraints/, store-selection/, demo-profile/, layout.tsx
components/     ui/, layout/, common/ (AllergyWarning, ReasoningSlot, ProductCard)
lib/            types.ts, validation.ts, seed-data.ts, utils.ts
store/          profileStore.ts, cartStore.ts, uiStore.ts
styles/         globals.css, tokens.css
```
`lib/scoring.ts`/`allergens.ts`/`nutrition.ts`/`optimisation.ts` (Phase 3) and
`app/api/` (Phase 5+) are not created yet, just anticipated.

### Step 3 — Brand & design system
- Palette: emerald primary (#10b981), amber secondary (#f59e0b), **red
  (#ef4444) reserved strictly for allergy/safety warnings**, neutral slate scale.
- Type: Inter for headings, system-ui stack for body.
- Radius: `rounded-lg` cards/inputs, `rounded-full` badges. 44×44px minimum
  touch targets enforced in primitives.
- Allergy warning: icon + text + distinct border/background, never color-only.
- Use **both** the `ui-ux-pro-max` skill (react.csv/nextjs.csv pattern data)
  **and** the 21st.dev MCP (`mcp__21st__search` / `search_picker`) together for
  component sourcing and design decisions — not hand-invented from scratch.

### Step 4 — Screens (local data only, no network calls)
- Intent-first opening (`app/page.tsx`) → constraints
  (`app/onboarding/constraints/page.tsx`: budget, allergies, cooking time,
  nutrition targets — matches blueprint §8's Must-have flow "intent → constraints
  → store selection") → store selection (`app/store-selection/page.tsx`) → Demo
  Profile viewer (`app/demo-profile/page.tsx`), global layout with
  header/nav/footer.
- `AllergyWarning` and `ReasoningSlot` built now as reusable slots for Phase 3
  logic to plug into later.

### Step 5 — Local seed data
- `lib/types.ts` + `lib/validation.ts` (Zod) for `DemoProfile` and `Product`.
- `lib/seed-data.ts`: one hand-written Demo Profile + ~8–10 hand-picked rows
  from `data/pricing-worksheet.csv` (including at least one allergen example).
  Full CSV ingestion is Phase 2.

### Step 6 — Gates
- `npm run build` succeeds; `npm run lint` clean; one Vitest example test
  passes.
- Manual 375px check: no horizontal scroll, ≥44px touch targets, allergy badges
  icon+text, full flow navigable.
- `code-reviewer` + `typescript-reviewer` agents run against the diff.
- `doc-updater`/`/update-docs` keeps this file and README current.
- `git commit` once gates are green.

### Stopping point
Report a short summary + `npm run dev` command, then **stop for user review**
before Phase 2.

### Phase 1 status: complete, gate passed

- `npm run build` ✓, `npm run lint` ✓ (scoped to `app/`, `components/`, `lib/`,
  `store/` — `.claude/` plugin scripts excluded from app lint, not part of this
  project's source), `npm run test` ✓ (3/3).
- Verified in a real browser at a true 375×667 viewport (Chrome DevTools MCP
  device emulation, not just window resize) across all four screens: no
  horizontal scroll, single-column stacking below the `sm:` breakpoint, allergy
  warnings show icon+text+border (never color-only), touch targets ≥44px.
  Screenshots confirmed the Demo Profile's `dairy`/`tree nut` allergies and the
  seed products' own allergens (soy, dairy, tree nut, peanut, gluten) render
  correctly — cross-referencing them into a hard gate is Phase 3 scope, not yet
  built.
- `code-reviewer` and `typescript-reviewer` agents both ran; 3 findings (2
  missing `focus-visible` outlines on Header links and allergen toggle buttons,
  1 `min={0}` vs Zod `.positive()` mismatch on the constraints form) were fixed
  and gates re-verified green.
- Demo Profile confirmed to render with zero network calls.
