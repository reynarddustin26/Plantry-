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
| 3: Deterministic Intelligence | `lib/scoring.ts`, `lib/nutrition.ts`, `lib/allergens.ts`, TDD, comparison explanations from calculated values | Allergen-conflicted products hard-gated (never auto-recommended); unit price/protein-per-$ correct; all tests green |
| 4: Cookbook & Optimiser | Full course/tag/method category system, ingredient matching, `lib/optimisation.ts` basket optimiser, savings dashboard | Recipe filters all functional; ≥1 optimiser swap with $ delta and reason; savings dashboard shows methodology, not a bare number |
| 5: Supabase Integration | Schema (§5 above), RLS, Supabase Auth email/password, Demo Profile fallback proven | Two test users' carts/pantry provably isolated (RLS); Demo Profile still works with Supabase env vars removed |
| 6: Data Ingestion Pipeline | `RetailDataProvider`/`RecipeDataProvider` scripts against Open Food Facts, USDA, curated AU pricing (`data/pricing-worksheet.csv`), chosen recipe API | Supabase populated with provenance-tagged rows; site never calls these APIs live, only reads Supabase |
| 7: Grounded AI Explanations | Server-only `/api/ai/explain`, schema-validated, timeout + deterministic fallback, rate-limited | App fully usable with `AI_API_KEY` removed; no unsupported factual claims in AI output |
| 8: Polish, Reliability, Deploy | Responsive pass, failure matrix (blueprint §10), full acceptance checklist (§12), deploy to `*.vercel.app` | Full journey works end-to-end on live deploy in incognito; every failure-matrix case degrades gracefully |
| 9: Bonus — PWA | Service worker, manifest, offline fallback — only after 1–8 are stable | Installable, works offline for cached data, zero regression in 1–8 |

**Phase 8 design-polish note (from user feedback during Phase 1):** Phase 1's
components are intentionally flat Tailwind defaults — visual polish is explicitly
deferred to Phase 8, not skipped. When Phase 8 starts: search 21st.dev more
aggressively for card/button/badge/hero-section components with real hover
states and micro-interactions (a single generic query returned only a weak
"Announcement" match — try more targeted queries per component type), and check
`ui-ux-pro-max`'s `motion.csv`/`react-performance.csv` data for animation/motion
guidance, not just static colors — in service of blueprint §4's "fun/goofy but
professional" brand direction, which Phase 1's plain cards don't yet express.
Note: some baseline hover/stagger/page-transition animation was already added
during Phase 1 (Framer Motion, `lib/motion.ts`) per user request — Phase 8 is
about the deeper visual-identity pass, not introducing motion from scratch.

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

---

## Section C — Phase 2 Execution (Core Shopping Flow)

### What was built
- **Types/schemas**: `NutritionPer100g` (all-nullable — no nutrition columns
  exist in the curated CSV; real values land via USDA in Phase 6, never
  fabricated) and `CartItem` added to `lib/types.ts`/`lib/validation.ts`.
- **Full catalog**: `lib/seed-data.ts` rewritten to transcribe all 62 rows of
  `data/pricing-worksheet.csv` (was a 10-item hand-picked subset in Phase 1),
  each validated via `productSchema.parse()`. `nutritionPer100g: null` for all.
- **Business logic (TDD, tests written first)**: `lib/cart.ts`
  (`getCartSummary` — line totals, item count, skips orphaned cart items) and
  `lib/search.ts` (`filterProducts` — query/category/store/allergen-exclusion),
  both with `lib/*.test.ts` covering them plus the expanded seed-data tests
  (62-row count, unique ids, no fabricated nutrition).
- **Persistent cart**: `store/cartStore.ts` uses Zustand `persist`
  (localStorage key `plantry-cart`) with `skipHydration: true` +
  `components/common/CartHydrator.tsx` (mounted in `app/layout.tsx`) calling
  `persist.rehydrate()` post-mount, avoiding an SSR/client hydration mismatch.
- **Screens**: `/shop` (search, category/store filter chips, 62-product grid,
  add-to-cart, up to-3 compare selection — client component, no stagger
  animation on the grid per `ui-ux-pro-max`'s own guidance against staggering
  >8-10 items), `/shop/product/[id]` (async Server Component, `notFound()` on
  miss), `/shop/compare` (async Server Component reading `searchParams`,
  up to 3 products side by side), `/cart` (line items, qty +/- controls, live
  AUD total, empty state).
- **Nav**: Header gained Shop/Cart links (Cart shows a live item-count badge
  via a small client sub-component, `CartBadgeLink`, keeping `Header` itself a
  server component); store-selection's "Continue" now routes to `/shop`.
- **E2E**: Playwright installed and configured (`playwright.config.ts`,
  `npm run e2e`), one spec (`e2e/intent-to-cart.spec.ts`) covering the full
  intent → constraints → store-selection → shop(search+add) → cart →
  reload-persists journey, plus an allergy-warning accessibility check, across
  Chromium/Firefox/WebKit.

### Bugs caught and fixed during this phase
- `components/ui/Card.tsx` used Framer Motion (`motion.div`/`motion.button`)
  but was never marked `'use client'` — worked in Phase 1 only because every
  page using it was already a client component. Broke when the new Server
  Components (`/shop/product/[id]`, `/shop/compare`) imported it directly
  (`createMotionComponent() from the server` runtime error). Fixed by adding
  `'use client'` to Card.tsx — verified by both agent review and a clean
  browser reload with no console errors.
- Two E2E assertions were logically inert: `expect(locator).toBeTruthy()` on a
  Playwright `Locator` (always truthy regardless of match count — doesn't
  prove the element exists) and a `/bg-\w+/` class-regex check on the "Health"
  intent card that matched an always-present base class (`bg-card`) whether or
  not the click actually selected it. Both rewritten to assert on a resolved,
  visible element / a class that's genuinely conditional on selection state.
- `AddToCartButton`'s "Added ✓" state never reset, so a second click on the
  same product gave no visual feedback. Fixed with a 2s `setTimeout` reset.
- Header nav wrapped/overlapped at 375px once a third nav item (Cart) was
  added — fixed with tighter gaps/padding and shortening "Demo Profile" to
  "Profile" in the nav (the page itself is still titled "Demo Profile").
- Cart line items truncated product names aggressively ("Chick...") at 375px
  in a single-row layout — fixed by stacking name/controls vertically below
  the `sm:` breakpoint instead of truncating.

### Gate status: complete, all green
- `npm run lint` ✓, `npm run build` ✓ (`/shop/compare` and
  `/shop/product/[id]` correctly render as dynamic/server-rendered routes),
  `npm run test` ✓ (16/16 unit tests), `npm run e2e` ✓ (6/6 — 2 tests ×
  3 browsers).
- Verified in a real browser at 375px across `/shop`, `/shop/product/[id]`,
  `/shop/compare`, `/cart`; cart persistence confirmed via a genuine hard
  reload with `localStorage` inspected directly (not just the E2E suite).
- `code-reviewer` and `typescript-reviewer` agents both ran against the diff;
  the one real finding (`AddToCartButton` state reset) was fixed.
- Nutrition data is honestly absent (`null`) everywhere in this phase — no
  cart/product screen fabricates calorie/macro numbers; UI copy says so
  explicitly rather than hiding the gap.

---

## Section D — Phase 3 Execution (Deterministic Intelligence)

### What was built
- **`lib/nutrition.ts`** (TDD): `parsePackageSize` handles every real format in
  the catalog (`500g`, `1kg`, `2L`, `375mL`, `4x95g`, `10x375mL`, `1 each`,
  `25pk`), multipack patterns checked before plain-unit ones to avoid
  mis-matching. `calculateUnitPrice` normalizes to $/100g, $/100mL, or
  $/unit; `formatUnitPrice`; `proteinPerDollar` (derived from
  `nutritionPer100g.protein` — returns `null`, never fabricated, since the
  real catalog has no nutrition data yet).
- **`lib/allergens.ts`** (TDD): `getAllergenConflicts`/`hasAllergenConflict` —
  the single source of truth for matching a product's allergens against a
  profile's declared allergies.
- **`lib/scoring.ts`** (TDD): `isRecommendable` (the hard gate —
  allergen-conflicted products are never recommendable, full stop),
  `getRecommendationReason` (names the specific conflicting allergen and
  states exclusion explicitly, or flags best-value; returns `undefined` for
  unremarkable products rather than manufacturing filler text),
  `findBestValueId` (cheapest $/100g among recommendable, weight-based
  products only — allergen-conflicted products are filtered out before
  comparison, so a cheaper conflicted item can never win).
- **UI wiring**: `/shop` shows a unit-price line on every card, a "Best
  value: $X/100g" badge on the single cheapest recommendable pick within the
  current filtered results, and — for allergen-conflicted products — a bold
  red "Contains X — excluded from your recommendations (allergy match)" line
  via `ReasoningSlot`'s new `tone='excluded'` variant (icon + text + color,
  never color alone). `/shop/product/[id]` and `/shop/compare` (both async
  Server Components) get the same treatment via a new small client component,
  `ProductRecommendationInfo`, since Server Components can't read the
  client-side Zustand profile store directly.
- Verified against the full real 62-product catalog in a live browser: every
  dairy/tree-nut product (the Demo Profile's allergies) correctly shows the
  exclusion message; gluten/soy/peanut products (not in this profile's
  allergies) correctly do NOT get excluded; the "Best value" badge landed on
  the true minimum ($0.24/100g, Home Brand Pasta) among non-conflicted
  weight-based products.

### Scope correction
Fixed a documentation inconsistency in §6's phase table: `lib/optimisation.ts`
had been listed under Phase 3, but the blueprint's own phase breakdown (and
the master build prompt) puts the basket optimiser in Phase 4 ("Cookbook &
Optimiser"), not Phase 3. Moved it there; Phase 3 built exactly what the
blueprint's Phase 3 description calls for (scoring, unit price,
protein-per-dollar, allergen gating, comparison explanations) and nothing more.

### Gate status: complete, all green
- `npm run lint` ✓, `npm run build` ✓, `npm run test` ✓ (51/51 unit tests —
  35 new: 9 nutrition, 6 allergens, 8 scoring, plus updated seed-data checks),
  `npm run e2e` ✓ (6/6 regression, unchanged from Phase 2).
- `code-reviewer` and `typescript-reviewer` agents both reviewed with extra
  scrutiny on the hard gate specifically (per blueprint: "never softened by
  scoring or by the AI") — both independently confirmed no code path lets an
  allergen-conflicted product appear as a recommendation; zero findings.

---

## Section E — Phase 4 Execution (Cookbook & Optimiser)

### What was built
- **`lib/recipes-data.ts`**: 16 first-party curated recipes (blueprint §5 —
  Phase 6 is where a real recipe API lands; there's no live integration yet).
  Spans all 6 courses, 11 diet/tags, and all 4 static methods
  (air_fryer/bbq/one_pot/quick). Ingredients link to real catalog `productId`s
  wherever a sensible match exists, so ingredient-matching runs on real data;
  common staples (salt, oil, garlic) are flagged `pantryStaple: true` and
  assumed always on hand rather than forced into the catalog. `costPerServingAud`
  is a grounded estimate from real ingredient prices, not an arbitrary number.
  Tags like `high_protein`/`keto` are qualitative editorial categorisation —
  every recipe detail page states plainly that per-serving numeric nutrition
  isn't available yet, same honesty rule as products.
- **`lib/recipeMatching.ts`** (TDD): ingredient-vs-cart matching
  (`getIngredientMatchStatus`, `getMissingIngredients`, `getMatchSummary`) and
  `filterRecipes` (course/tag/method/query, plus a `canMakeNow` filter computed
  live against the cart). Blueprint §5 also lists `use_soon` ("pantry-match")
  as a method filter — deliberately not implemented, since it needs pantry
  expiry-date tracking that doesn't exist yet (Pantry mode is a Should-have,
  not built); `can_make_now` is real and live, `use_soon` was left out rather
  than faked.
- **`lib/optimisation.ts`** (TDD): `findSwapCandidates` proposes same-category
  swaps to a cheaper unit price, reusing Phase 3's `isRecommendable` hard gate
  so a swap can never land on an allergen-conflicted product. Savings are
  computed from the real price delta, always positive when a swap exists (unit
  price strictly cheaper is required to propose one at all).
  `calculateSavingsSummary` totals savings across all swaps, scaled by quantity.
- **Screens**: `/cookbook` (search, course/tag/method filters, "Can make now"
  toggle, recipe grid showing live cart-match counts), `/cookbook/recipes/[id]`
  (async Server Component + a client `RecipeIngredientList` sub-component for
  cart-aware ingredient checklist, mirroring the `ProductRecommendationInfo`
  pattern from Phase 3), `/optimiser` (proposed swaps with "Apply swap",
  explicit "no safe alternative found — kept" messaging per blueprint §10's
  failure matrix), `/savings-dashboard` (current vs. optimised total, a written
  methodology paragraph, per-item breakdown — not a bare number).
- **Nav**: Header gained a "Cookbook" link (4th nav item); Cart page gained an
  "Optimise my basket" entry point into `/optimiser`.

### Bugs caught and fixed during this phase
- `app/cookbook/page.tsx` originally used
  `useCartStore((s) => s.items.map((i) => i.productId))` — a Zustand selector
  that constructs a new array on every call. This breaks
  `useSyncExternalStore`'s referential-stability requirement and threw "The
  result of getServerSnapshot should be cached to avoid an infinite loop" in
  the browser (not caught by lint/build/unit tests — only surfaced via actual
  browser testing). Fixed by selecting `s.items` directly and mapping in the
  component body; grepped the whole diff for the same pattern elsewhere
  (none found), and both review agents independently re-verified.
- A `react-hooks/preserve-manual-memoization` lint error (from the project's
  React Compiler-aware ESLint rules) on manual `useMemo` wrapping
  `findSwapCandidates` in `/optimiser` and `/savings-dashboard`. Fixed by
  removing the manual memoization entirely rather than fighting the rule —
  the computation is cheap (bounded by the 62-product catalog) and has no
  side effects, so memoizing it was premature optimisation anyway.
- A separate `react-hooks/use-memo` lint error in `/cookbook` from
  `cartProductIds.join(',')` inside a `useMemo` dependency array (deps must be
  simple expressions) — resolved the same way, by dropping the `useMemo`.
- During manual browser testing, clicking the second product's "Add" button
  appeared to silently do nothing (no console error, no state change). Root
  cause: Next.js's dev-only floating "N" indicator was physically positioned
  over that button at that scroll position, intercepting the synthetic click
  — a testing-tool/dev-overlay artifact, not an application bug (confirmed by
  clicking a button elsewhere on the page, and independently by the E2E suite,
  which handles element-obscuring correctly and passes cleanly).

### Known scope limitation (documented, not silently accepted)
The optimiser compares candidates within the whole product `category` field
(e.g. "Protein"), not a narrower sub-grouping — so it can propose swapping
Chicken Breast Fillets for Canned Chickpeas (both cheaper-per-100g "Protein"
items) rather than only same-product-different-store matches. This is
mathematically correct, allergy-safe, and explained, but coarser than a real
shopper might expect. Finer-grained "similar product" matching would need
either a richer product taxonomy or Phase 6's real data sources — left as-is
for Phase 4 rather than over-building a bespoke similarity model now.

### Gate status: complete, all green
- `npm run lint` ✓, `npm run build` ✓ (12 routes total), `npm run test` ✓
  (74/74 — 17 new: 6 recipe-data integrity, 6 recipe matching/filtering,
  5 optimisation), `npm run e2e` ✓ (6/6 regression, unchanged from Phase 2).
- Verified in a real browser: cookbook filters (including live "Can make now"),
  a real optimiser swap with correct savings math, and the savings dashboard's
  methodology + per-item breakdown, all with zero console errors.
- `code-reviewer` and `typescript-reviewer` agents both reviewed with specific
  instructions to hunt for a second instance of the Zustand selector bug
  across the whole diff — both confirmed none exists. Zero other findings.

---

## Section F — Phase 5 Execution (Supabase Integration)

### What was built
- `supabase/migrations/0001_init.sql` — 12 tables (`profiles`, `allergies`,
  `profile_allergies`, `products`, `store_products`, `recipes`,
  `recipe_ingredients`, `cart_items`, `pantry_items`, `saved_journeys`,
  `recommendation_events`, `data_provenance`), RLS enabled on every table,
  owner-scoped policies (`auth.uid() = user_id`) on every user-owned table,
  public-read policies on every catalog table, a seeded controlled allergen
  vocabulary matching the strings already used by `lib/allergens.ts`, and a
  `handle_new_user()` trigger that auto-creates a `profiles` row on sign-up.
- `lib/supabase/{config,client,server,middleware}.ts` + `proxy.ts` (repo
  root — Next.js 16 renamed `middleware.ts` to `proxy.ts`; caught via the
  bundled docs at `node_modules/next/dist/docs`, not assumed from training
  data). Every Supabase call site is gated by `isSupabaseConfigured()` so the
  app degrades to null/no-op with the env vars absent — verified by rebuilding
  and running the Demo Profile flow with `.env.local` removed: zero console
  errors, zero network calls, `/profile` and `/pantry` show a clear "use the
  Demo Profile instead" fallback rather than crashing.
- Auth: `/auth/signup`, `/auth/signin`, sign-out — Next.js Server Actions
  (`lib/actions/auth.ts`) with Zod validation (`lib/auth-validation.ts`),
  `useActionState` forms (`components/auth/AuthForm.tsx`).
- `/profile` — view/edit profile + allergies for authenticated users
  (`lib/actions/profile.ts`, `components/profile/ProfileForm.tsx`).
- `/pantry` — minimal real CRUD pantry tracker (`lib/actions/pantry.ts`,
  `components/pantry/PantryForm.tsx`). New feature, not previously in the app.
- `scripts/verify-rls.mjs` (`npm run verify-rls`) — creates two disposable
  real test users via the service_role admin API, seeds two dummy products,
  writes `cart_items`/`pantry_items` as each user via their own session (not
  service_role), then asserts each user only ever sees their own rows —
  including when explicitly querying for the other user's `user_id`, which
  proves Postgres RLS enforcement rather than incidental app-level filtering.
  Cleans up all test data afterward.
- Desktop responsive layout fix (user-reported mid-phase: the site rendered
  as a narrow mobile-width column on desktop, not a real desktop layout).
  Widened `app/layout.tsx`'s `<main>` and `Header`'s inner container with
  `lg:max-w-5xl`/`xl:max-w-7xl` + more padding, added `lg:` grid/type-scale
  variants to the opening/store-selection/demo-profile screens (4-up intent
  grid, 3-up store grid, 4-up stat/product grids on desktop), and `lg:p-6` to
  `Card`/`SelectableCard`. Verified with real DOM measurement, not just a
  screenshot: `getBoundingClientRect()` at a 3127px-wide viewport showed a
  1280px-wide centered content box with 923.6px left / 923.4px right margins.

### Scope decision: live `/cart` UI stays on the local Zustand store for now
`cart_items.product_id` is a NOT NULL foreign key to `products`, which stays
empty until Phase 6's ingestion populates it with real UUIDs — the existing
catalog (`lib/seed-data.ts`) uses string ids like `prod-coles-...`, not
Supabase UUIDs. Wiring the live shopping cart through Supabase now would mean
either fabricating fake product rows or leaving the FK unsatisfiable, so the
well-tested Phase 2–4 cart flow (Zustand + localStorage) is left untouched
through Phase 5. `cart_items`/`pantry_items` RLS isolation is proven directly
at the database level via `verify-rls.mjs` instead of through the live UI.
This mirrors Phase 4's "documented limitation, not silently accepted" pattern.

### Bugs caught and fixed during review
- `database-reviewer`: added missing indexes (`recipe_ingredients.product_id`,
  `store_products.store`), added a missing `saved_journeys` UPDATE policy,
  documented (rather than "fixed") that `profile_allergies`/`cart_items` don't
  need separate `user_id` indexes since it's the leading column of their
  composite primary key (btree leftmost-prefix matching already covers it).
- `security-reviewer`: no exploitable findings.
- `code-reviewer`/`typescript-reviewer`: fixed unsafe `supabase!` non-null
  assertions in `lib/actions/auth.ts` (now checks `createClient()`'s return
  directly); added missing error handling on `pantry.ts`'s delete and all
  three of `profile.ts`'s writes (logged server-side, generic message
  returned to the client — Postgres/PostgREST errors can contain
  column/constraint names, unlike Supabase Auth's curated user-facing
  strings); added explicit `.eq('user_id', ...)` filters as defense-in-depth
  alongside RLS in `/pantry`; tightened `ProfileForm`'s loose `string` fields
  to literal union types matching the DB check constraints.

### Gate status: complete — live RLS isolation proven against the real project
- `npm run lint` ✓, `npm run build` ✓ (18 routes total, `Proxy (Middleware)`
  correctly detected), `npm run test` ✓ (74/74, unchanged — no new unit-tested
  business logic this phase, it's integration/infra).
- **Update**: the migration was applied via the Supabase SQL Editor. Verified
  live: all 12 tables reachable, `allergies` carries its 10 seeded rows.
  `npm run verify-rls` was then run for real against the live project — all
  12 checks passed: two disposable real test users, each able to write their
  own `cart_items`/`pantry_items`, each seeing only their own rows on an
  unfiltered select, each getting zero rows back when explicitly querying the
  *other* user's `user_id` (proving Postgres RLS enforcement, not incidental
  app-level filtering), a cross-user delete affecting zero rows, and each
  user's `profiles` row (auto-created by the `handle_new_user` trigger)
  visible only to its owner. Test users and dummy products cleaned up
  afterward, exactly as designed. This is the phase's full gate, now closed.

---

## Section G — Phase 6 Execution (Data Ingestion Pipeline)

### What was built
- `lib/providers/types.ts` — `RetailDataProvider`/`RecipeDataProvider`
  interfaces (blueprint §5/§6) and the `Ingested*` shapes they return.
  Deliberately independent of `lib/types.ts`'s frontend `Recipe`/`Product`
  types — see the scope decision below.
- `lib/providers/curatedRetailProvider.ts` — wraps the existing curated AU
  pricing dataset (`lib/seed-data.ts`, sourced from
  `data/pricing-worksheet.csv`) as a `RetailDataProvider`, grouping the 62
  store-specific rows into 53 unique products (by name) each carrying a
  `stores[]` array of per-store price/package-size.
- `lib/providers/openFoodFactsNutrition.ts` — nutrition enrichment via Open
  Food Facts. **Scope decision (ambiguity resolved, logged per tonight's
  instructions):** the brief asked for "Open Food Facts + curated CSV
  fallback," but none of the 62 curated rows carry a barcode (verified:
  `awk` over the CSV's barcode column returns 0 non-empty rows), and Open
  Food Facts has no reliable way to be a *primary* AU product-listing source
  without one. Barcode lookup is the accurate way to use this API; without a
  barcode the only option is a name search against a global, mostly
  non-AU-branded database, which risks silently attaching a WRONG product's
  nutrition — worse than the honest `null` already shown. So: curated CSV
  stays the sole source of product listings, and Open Food Facts is used as
  a nutrition *enrichment* pass, only accepting a name-search match when
  every significant word of our product name appears in the candidate's
  name (conservative, documented, rejects low-confidence matches rather than
  guessing).
- `lib/providers/theMealDbProvider.ts` — `RecipeDataProvider` against
  TheMealDB's free tier (no registration/key required). Fetches a bounded
  set (3 per category × 9 categories ≈ 27 recipes) across
  Breakfast/Dessert/Starter/Side/Vegetarian/Vegan/Chicken/Seafood/Pasta.
- `lib/providers/recipeMapping.ts` (+ `recipeMapping.test.ts`, 14 tests,
  TDD) — the deterministic mapping/parsing logic feeding the above:
  - `mapCourse`/`deriveTags`: TheMealDB category → our course/tag taxonomy,
    with unmapped categories defaulting to `'main'` (a disclosed
    categorisation default — unlike price/nutrition, "which course" has no
    ground truth to fabricate).
  - `parseMeasure`: TheMealDB's free-text measures ("1 cup", "to taste",
    "200g") parsed into `{quantity, unit}` without ever inventing a numeric
    amount the source didn't give — non-numeric text becomes `quantity: 1,
    unit: "<the literal text>"` rather than a guessed number.
  - `inferAllergensFromIngredients`: deterministic keyword match against
    ingredient text, reusing the same controlled vocabulary as
    `lib/allergens.ts`. Documented explicitly as a heuristic derived from
    ingredient text, not a verified lab allergen statement — TheMealDB
    provides no allergen data at all, and leaving allergens empty for a
    recipe genuinely containing dairy/gluten would be actively dangerous
    given this app's hard-gate allergen safety requirement.
- `scripts/ingest.ts` — orchestrates both providers, writes `products` /
  `store_products` / `recipes` / `recipe_ingredients` / `data_provenance`
  (every row tagged with `source`, `captured_at`, `is_demo_data`) via the
  service_role client. Runs a preflight check (`select` on `products`)
  before writing anything, so a missing migration fails fast with one clear
  message instead of 50+ repeated errors. `npm run ingest`.

### Scope decision: frontend keeps reading local fixtures, not Supabase
Populating Supabase's `products`/`recipes` tables is this phase's job;
switching the live site to *read* from them is not. `lib/types.ts`'s
`Product`/`Recipe` types, `lib/seed-data.ts`, `lib/recipes-data.ts`, and
every screen built in Phases 2–4 are untouched. This keeps the well-tested
shopping/cookbook/optimiser flow stable and avoids a much larger frontend
data-layer rewrite tonight; it's the natural next step for a later phase.

### Live population: complete
Once the migration was applied (Phase 5), `npm run ingest` was re-run for
real against the live project with no code changes needed:
- **Products**: 53/53 inserted, 62 `store_products` rows (matching the
  53-unique-product/62-store-row shape from the smoke test), 10 nutrition-
  enriched via Open Food Facts out of 53 (the other 43 honestly stayed
  `null` — the conservative name-match rejected low-confidence candidates,
  exactly as designed, rather than force-matching all 53).
- **Recipes**: 27/27 inserted from TheMealDB, 256 `recipe_ingredients` rows,
  with real deterministic allergen inference visible in the data (e.g. a
  breakfast dish containing egg was correctly tagged `["dairy", "egg"]`) and
  `total_minutes`/`servings`/`cost_per_serving` correctly `null` throughout
  (TheMealDB provides none of these — never fabricated).
- **Provenance**: 90 rows total (63 for products = 53 curated + 10 OFF
  enrichment, 27 for recipes) — matches the insert counts exactly.
- Spot-checked directly against the live database (not just the script's
  own summary output) to confirm the data is real and correctly shaped.

### Incidental fix: Node can run these `.ts` files directly
`scripts/ingest.ts` needed to import `lib/providers/*.ts` under plain
`node` (Node 24 strips TS types natively — no new dependency installed,
consistent with this session's standing rule to ask before adding
dependencies). Node's ESM loader requires explicit file extensions on
*runtime* relative imports (type-only `import type` lines are erased and
don't need this). Added `"allowImportingTsExtensions": true` to
`tsconfig.json` (safe/additive — permits `.ts` extensions, doesn't require
them anywhere) and added `.ts` extensions to the handful of import lines on
this module's actual runtime path
(`lib/seed-data.ts` → `./validation.ts`, `curatedRetailProvider.ts` → `../seed-data.ts`,
`theMealDbProvider.ts` → `./recipeMapping.ts`). No other import in the
codebase was touched.

### Gate status: complete — Supabase populated for real, verified live
- `npm run lint` ✓, `npm run build` ✓ (unchanged route count; provider/script
  files type-check cleanly), `npm run test` ✓ (88/88 — 14 new for
  `recipeMapping.ts`).
- `curatedRetailProvider.fetchProducts()` smoke-tested directly: 53 unique
  products correctly grouped from the 62-row CSV with per-store pricing intact.
- `npm run ingest` run for real against the live project — see "Live
  population: complete" above. This phase's gate is now fully closed.

---

## Section H — Phase 7 Execution (Grounded AI Explanations)

### What was built
- `app/api/ai/explain/route.ts` — server-only `POST` route. Parses + Zod-
  validates the request, resolves a rate-limit key (authenticated user id if
  signed in, else IP, else `'anonymous'`), enforces the limit, then either
  calls the model (if `ANTHROPIC_API_KEY` is configured) or goes straight to
  the deterministic fallback.
- `lib/ai/explainSchemas.ts` — `explainRequestSchema` (a discriminated union
  of exactly three fact shapes: `product_comparison`, `basket_swap`,
  `savings_summary` — every field in each is already a deterministically
  calculated value, e.g. `reason` strings from `lib/scoring.ts`/
  `lib/optimisation.ts`) and `explainResponseSchema` (`{explanation,
  grounded}`, `.strict()`, max 700 chars ≈ the brief's 120-word cap).
- `lib/ai/anthropicClient.ts` — direct `fetch` call to Anthropic's Messages
  API (no SDK dependency added — consistent with this session's standing
  rule to ask before installing packages; the API is a plain REST call).
  System prompt explicitly forbids stating any price/nutrition/allergen/
  savings value not present in the supplied facts JSON, and forbids
  inventing any missing fact. 15-second timeout via `AbortController`. On
  invalid/unparseable output, retries once with a stricter "JSON only, no
  markdown" prompt (blueprint §9), then gives up — never throws, always
  returns `null` on any failure so the route falls back.
- `lib/ai/fallbackExplanation.ts` (+ tests) — the deterministic fallback:
  builds a plain-English explanation purely by relaying the already-grounded
  `reason`/`savingsAud`/`swapCount` fields the caller supplied, via
  `formatAud()` and template strings. No model call, so it's what actually
  runs right now (no `ANTHROPIC_API_KEY` is configured in this environment).
- `lib/ai/rateLimiter.ts` (+ tests) — in-memory fixed-window limiter, 20
  requests/hour/key. Dependency-free by design: this deploys as a single
  Next.js server process, not a multi-instance fleet, so a shared store
  (Redis/Supabase) would solve a problem that doesn't exist yet — noted
  in-code as the thing to revisit if that changes.

### Gate status: complete, all green, live-smoke-tested
- `npm run lint` ✓, `npm run build` ✓ (`/api/ai/explain` registered as a
  dynamic route), `npm run test` ✓ (96/96 — 8 new: 5 rate-limiter, 3
  fallback-explanation).
- Live-tested against the running dev server (not just unit tests):
  - A `basket_swap` request returns the correct relayed explanation with
    `grounded: false` (proving the fallback path — the actually-live
    behavior with no AI key configured).
  - An invalid body (`facts.type: "bogus"`) returns `400` with a clear Zod
    field-error breakdown.
  - 22 consecutive requests from the same key: the first 20 return `200`,
    the 21st and 22nd return `429` with a `Retry-After` header — confirms
    the 20/hour limit is enforced exactly, not approximately.
- Meets blueprint §9's core requirement directly: the app is fully usable
  right now with `ANTHROPIC_API_KEY` absent, because that's the actual
  current state, not a hypothetical one.
- **Re-verified live** after Phase 5's migration landed: `resolveRateLimitKey`
  now actually calls the live Supabase `auth.getUser()` (previously
  short-circuited to null when unconfigured) — re-tested against the running
  dev server with an anonymous request, confirmed no crash and correct
  fallback-to-IP-key behavior, zero errors in the server log.

---

## Section I — Phase 8 Execution (Polish, Reliability)

### What was built
- **Loading skeletons**: `components/ui/Skeleton.tsx` (+ `ProductCardSkeleton`/
  `RecipeCardSkeleton`/`CartLineSkeleton`) and matching `loading.tsx` files
  for every route with real async work — `/shop`, `/shop/product/[id]`,
  `/shop/compare`, `/cookbook`, `/cookbook/recipes/[id]`, `/cart`,
  `/pantry`, `/profile` — using Next's App Router `loading.tsx` convention
  (automatic Suspense boundary per route segment), shaped to match each
  route's real layout, not a generic spinner.
- **Error boundaries**: `app/error.tsx` (client component, wraps every
  nested page/loading/not-found file per Next's inheritance model — this
  *is* "every page," not a gap; 17 near-duplicate per-route files would add
  no real coverage) and `app/global-error.tsx` (catches errors in the root
  layout itself, which `error.tsx` structurally cannot reach; defines its
  own inline-styled `<html>/<body>` since Tailwind may not be available if
  the layout itself failed). Both use `unstable_retry` — the prop this exact
  Next.js version (16.2.0+) added and now recommends over the older `reset`
  (verified via `node_modules/next/dist/docs`, not assumed).
- **Desktop grid polish**: `/shop` (2→3→4 cols) and `/cookbook` (2→3 cols)
  gained `lg:`/`xl:` grid breakpoints, matching the Phase 5 desktop-layout
  fix already applied to the opening/store-selection/demo-profile screens.
- **Landing hero — brand colors, animated gradient, mascot**: added the
  exact CSS custom properties requested (`--forest-deep` through `--gold`)
  as a `:root` block in `app/globals.css`, scoped to the hero only (the
  rest of the app's UI chrome keeps its existing `@theme` tokens — this
  isn't a site-wide recolor). `.hero-orb-*` classes + `@keyframes drift-1/
  2/3` animate 4 blurred radial-gradient orbs (emerald/mint/amber/forest)
  slowly drifting behind the hero content, disabled under
  `prefers-reduced-motion`. `components/common/PlantryMascot.tsx` — a
  hand-drawn inline SVG "concentric spheres" character (3 nested circles +
  a small sprout + a simple face), no external asset needed. Both wired
  into `app/page.tsx`'s hero via the new `HeroOrbBackground` wrapper;
  the functional intent-picker grid below it is untouched.

### Gate status: complete, all green, live-verified
- `npm run lint` ✓ (one warning found and fixed: unused `error` param in
  `global-error.tsx` — now logged via `console.error`, matching
  `error.tsx`'s pattern).
- `npm run build` ✓ — zero TypeScript errors, all 18 routes registered
  correctly (`/api/ai/explain` from Phase 7, plus everything above).
- `npm run test` ✓ — 96/96, unchanged (this phase is UI/infra, not new
  business logic).
- `npm run e2e` ✓ — 6/6, including the intent-selection journey that starts
  from the exact page (`app/page.tsx`) whose hero was rewritten — proves the
  redesign didn't break the underlying flow.
- Visually verified via Chrome DevTools MCP at both 375px and 1440px: the
  hero renders correctly (mascot, heading, drifting orbs, legible contrast)
  at both sizes with zero console errors; `/shop`'s new 4-column and
  `/cookbook`'s new 3-column desktop grids render cleanly with zero console
  errors.

### Deploy: unblocked — pushed to GitHub
Both `BLOCKED.md` items are resolved: the migration is applied (verified
live, Section F) and `origin` now points at
`https://github.com/reynarddustin26/Plantry-.git`, with `master` tracked and
in sync. All Phase 5–8 commits, plus this phase's live re-verification
commits, are pushed. Vercel deploy from here is a repo-connection step on
vercel.com, not something drivable from this shell.

### Final full-stack live verification (all four phases together)
With the migration applied, Supabase fully populated, and the remote
connected, ran the complete gate suite one more time end to end:
- `npm run lint` ✓, `npm run build` ✓ (zero TypeScript errors, all 18 routes,
  including `Proxy (Middleware)`), `npm run test` ✓ (96/96), `npm run e2e` ✓
  (6/6 — one Firefox run initially hit the same `networkidle` timeout flake
  documented earlier this session; re-ran in isolation and it passed cleanly,
  confirming it's parallel-worker contention, not a live-Supabase-related
  regression — `proxy.ts`'s session-refresh call isn't what's causing it,
  since an isolated run has no other test load and still passed instantly).
- This is the first time all four phases have been verified together against
  the real, fully-populated backend rather than each phase's local/mocked
  view of it — nothing broke crossing that boundary.

---

## Section J — Phase 8.5 Execution (Full Visual Redesign)

### What was built
- **Bug fix**: `app/cart/page.tsx` no longer shows "Nutrition totals arrive
  once product nutrition data is available (Phase 6)" — an internal
  phase-reference that should never have been user-facing.
- **Decision: no fabricated cart nutrition total.** The instruction offered
  two options — show real totals, or remove the message. Real totals aren't
  honestly computable today: cart items reference the local curated catalog
  (`lib/seed-data.ts`, string ids), while Open-Food-Facts-enriched nutrition
  lives in Supabase's `products` table (UUID-keyed, only 10/53 products
  matched) — there's no link between the two, and summing "10 of however-many
  items have real data" as if it were a complete total would silently
  undercount. Removed the message; did not fabricate a number.
- **Design tokens + animated hero**: `app/globals.css` — `--surface-light`/
  `--text-dark` added; the Phase 8 hero-orb system replaced with the exact
  spec (4 orbs, individual sizes/positions/colors/durations, `drift1/2/3`
  keyframes); new `.fade-up`, `.mascot-float`, `.btn-primary`, `.card-hover`
  utility classes.
- **Fixed, scroll-aware header**: `components/layout/Header.tsx` converted
  to a Client Component — transparent+white over the homepage hero,
  solid+dark everywhere else or once scrolled, amber active-tab underline.
  Converting to `position: fixed` (so it can float transparently) required
  compensating top padding on `<main>` (`pt-[96px] lg:pt-[112px]` = header
  height + original `py-6`/`py-10`) — `components/landing/Hero.tsx` cancels
  this with a matching negative margin so its background still reaches the
  true top/edges of the viewport, the same full-bleed pattern already
  proven in Phase 8's `-mx-4 lg:-mx-8` trick.
- **`lib/hooks/useScrollAnimation.ts`**: IntersectionObserver-based, adds
  `.visible` to `.fade-up` elements. Re-runs on every route change via
  `usePathname()` — `app/layout.tsx` does not remount on client-side
  navigation, so a mount-only effect would only ever see the first page's
  elements. Deferred one `requestAnimationFrame` after mount so its near-
  instant first callback (for already-in-view elements) never lands in the
  same tick as Next dev mode's post-hydration diff, which otherwise
  misreports the resulting class change as a hydration mismatch.
- **Landing page** (`app/page.tsx` + `components/landing/*`): full hero
  rewrite (pill badge, headline, subtitle, two CTAs, floating mascot, scroll
  indicator, all scroll-linked via anchors + `scroll-mt`), the existing
  functional intent-picker preserved as its own section directly below (kept
  the original heading/copy — critical for the E2E journey, which selects an
  intent card and clicks Continue), then How-it-works / Why-Plantry /
  Stats-bar sections. Deleted `components/common/HeroOrbBackground.tsx`
  (Phase 8), superseded by the new `Hero.tsx`.
- **Mascot**: 3 amber-toned leaves (was 2, mixed mint/emerald) per spec.
- **Shop page**: dark gradient header strip, sticky filter bar with emerald-
  filled active pills and a live amber result-count badge, emerald "Add"
  button, capped stagger fade-in (`min(index × 50ms, 400ms)` — uncapped would
  make the last of 62 cards wait 3.1s, reintroducing the exact "laggy long
  list" problem Phase 1 deliberately avoided; a cap keeps the requested
  stagger feel without that regression).
- **Cookbook page**: course row rebuilt as true sliding-indicator tabs via
  Framer Motion `layoutId` (already a dependency); diet/method rows recolored
  to the same emerald-fill active state for consistency. `RecipeCard`
  gained a gradient placeholder image band (forest→emerald — there is no
  recipe photography pipeline in this app, so an honest gradient rather than
  a fabricated stock photo), a real time badge, a "High protein" badge only
  when the recipe actually carries that tag (no per-recipe protein gram
  value exists to display — never fabricated), and emerald "Can make now" /
  amber "N items missing" badges from the existing real match-summary data.
- **Cart page**: emerald left-border line items, circular emerald quantity
  buttons, amber-gradient full-width "Optimise my basket" button. Remove
  button is `opacity-0` → hover-`opacity-100` only at `sm:` and up — always
  visible below that, since touch devices have no hover state and hiding a
  destructive action's only trigger behind an interaction that doesn't exist
  on mobile would be a real usability regression, not a stylistic nuance.
  Empty state now shows the mascot + "Start shopping →".
- Kept `Button`'s existing token-based colors and `Card`'s existing Framer
  Motion hover animation everywhere they were already used, rather than
  layering the new `.btn-primary`/`.card-hover` CSS classes on top of them —
  both systems animate the same `transform` property, and CSS classes vs.
  Framer Motion's inline styles fighting over one property causes jank, not
  a stronger effect. The new CSS classes are used only on elements that
  don't already have Framer Motion hover behavior.

### Gate status: complete, all green
- `npm run lint` ✓, `npm run build` ✓ (zero TS errors — one real error caught
  and fixed: `Card` doesn't accept a `style` prop, switched the cart line
  item's border color to a Tailwind arbitrary-value class instead), `npm run
  test` ✓ (96/96, unchanged), `npm run e2e` ✓ (6/6 — one Firefox
  `networkidle` flake, same pre-existing pattern, passed cleanly in
  isolation both times it occurred this session).
- Visually verified via Chrome DevTools MCP at 1440px and 375px: hero,
  transparent→solid header transition, intent-picker section, How-it-works
  section all render correctly with the right content and no console errors
  (one screenshot caught what looked like a light gap behind the transparent
  header — re-screenshotted a moment later and it was a paint-timing
  artifact of the very first frame, not a real layout bug — confirmed via
  `getBoundingClientRect()` showing the hero genuinely reaches `top: 0`).

---

## Section K — Phase 9 Execution (Product Value, AI Visibility, Chat)

### Critical flag before this phase started: no live AI, wrong model name
Confirmed again (still true): no `ANTHROPIC_API_KEY` in `.env.local`. Every AI
touchpoint below runs correctly in its deterministic-fallback state — that's
the actual current behavior, not a hypothetical. Told the user directly
before starting, since the requested chat demo script ("open chat and
type...") would not have produced a real Claude answer as-is. Also: the
chat spec's model id `claude-sonnet-4-6` isn't real — used `claude-sonnet-5`
instead (overridable via `ANTHROPIC_CHAT_MODEL`).

### Landing page — rewritten again for conversion
New hero copy ("Your grocery list, optimised by AI"), real signup/demo CTAs
(`/auth/signup`, `/demo-profile` — replacing the previous scroll-to-picker
buttons; the intent-picker section itself is untouched and still reachable
by scrolling, so the E2E journey that clicks its "Health"/"Continue"
buttons is unaffected — Playwright doesn't require an element to be in the
initial viewport, only genuinely rendered). Added `ProblemSolution.tsx`,
`AIDemo.tsx`, `FeaturesGrid.tsx`, `HackathonNote.tsx`; `HowItWorks.tsx`
copy rewritten to be benefit-led — but corrected "AI ranks your options" to
"AI explains your options" in the process, because ranking is actually done
by `lib/scoring.ts`'s deterministic code and the AI only explains it; the
original spec phrasing would have contradicted this app's own core
architecture principle.

**`AIDemo.tsx` is an explicitly-labeled scripted example**, not a live
query — a "typing" animation runs through a fixed, made-up scenario
("Greek yoghurt wins here — 20g protein at $0.29/100g...") with an "Example
— not a live query" badge. These specific numbers aren't a claim about
today's actual catalog; it's illustrating what the real feature (built
below) does, the same way any product demo video is staged.

### Full-bleed bug found and fixed (user-reported, confirmed via DOM measurement)
The `-mx-4 lg:-mx-8` breakout used since Phase 8 only cancels `main`'s own
padding — it can't escape `main`'s `max-w-7xl` (1280px) constraint. Verified
with `getBoundingClientRect()`: at a 1309px-wide viewport, the hero's
rendered width was exactly 1280px, matching `main`, not the viewport — a
real bug, not a screenshot-reading error this time. Added a proper
`.full-bleed` CSS utility (`width:100vw; position:relative; left:50%;
margin-left:-50vw`) to `globals.css`, which escapes any ancestor width
constraint, and applied it to every full-bleed section (hero, AI demo,
Why Plantry, stats bar, hackathon note, shop's dark header strip — not the
sticky filter bar, which can't combine `position:sticky` and the
full-bleed technique's `position:relative`, and doesn't need to be
edge-to-edge anyway, it's a functional control not a marketing section).
`100vw` includes the scrollbar's own width in most browsers, which was
then causing a few px of real horizontal page overflow — fixed with
`overflow-x: hidden` on both `html` and `body` (needs to be on `html`,
not just `body` — the root scrolling box is `html`).

### AI visibility across the app
- **Shop cards**: already showed deterministic per-product reasons via
  `lib/scoring.ts`'s `getRecommendationReason` (built Phase 3) — this
  requirement was already met by existing infrastructure, not new work.
- **Product detail** (`components/common/ProductAiPanel.tsx`): "Ask AI to
  explain this choice" button, calls `/api/ai/explain` with real computed
  facts, typewriter-reveals the response (a presentation effect over
  already-fully-arrived text — `/api/ai/explain` returns complete JSON, not
  a token stream, so this isn't a claim that tokens are arriving live),
  "Powered by Claude" / "Deterministic explanation" attribution, cached in
  `sessionStorage` per product id.
- **Compare page** (`components/common/CompareAiVerdict.tsx`): picks a
  winner via real deterministic code (cheapest safe unit price among the
  compared products — the AI never picks it), same typewriter + cache
  pattern, states the real budget and protein target the verdict is
  "based on" (the target itself is a real profile field even though
  per-product protein content isn't — never conflates the two).
- **Cart optimiser** (`components/common/CartOptimiserPanel.tsx`): the
  existing "Optimise my basket" button now opens an inline panel (reusing
  Phase 4's `findSwapCandidates`/real swap data) with Accept/Skip per
  swap and a running total of *accepted* savings in amber. The standalone
  `/optimiser` page still exists, just no longer linked from this button.

### `personalScore` — a real, honest personalization signal
`lib/scoring.ts` gained `personalScore`/`rankByPersonalScore` (TDD, 3 new
tests). The brief said this "already exists" — it didn't. Built it to score
on unit price (weighted harder under `budget_first`) and preferred-store
match, behind the same allergen hard gate as everything else — deliberately
NOT on protein/calories, because nutrition-per-100g is null for every
product in the local catalog the frontend actually reads (Open-Food-Facts
enriched data lives in Supabase, unlinked — see Section G). Scoring on data
that doesn't exist would be inventing a signal, not personalizing on one.
Wired into `/shop` (signed-in users see `rankByPersonalScore` order + a
banner; signed-out users see price order) via a new `useAuthUser` hook
(`lib/hooks/useAuthUser.ts`) since `/shop` is a pure Client Component with
no server-side auth context. **The shop banner text was adapted from the
brief's "Sorted for your goals — high protein, under $80/week" to "Sorted
for your goals — best value in your preferred stores first"** — the
original wording claims a protein-based sort that isn't what's actually
happening; the adapted copy accurately describes the real criteria.

### Dashboard (`app/dashboard/page.tsx`, new)
Auth-gated. Fetches the real Supabase profile (+ allergies) server-side,
constructs a `DemoProfile`-shaped object from it (falling back to
`DEMO_PROFILE`'s balanced defaults only for the scoring computation's
internal use — the UI itself shows "not set" for null fields, never
presents a fallback number as if it were the user's real setting). Budget
progress bar, "meals you can make now" (real, `lib/recipeMatching.ts`),
"this week's savings" (real, `lib/optimisation.ts`) live in
`DashboardCartInsights.tsx` since cart state is client-only (Zustand);
"recommended basket" (top 5 via `rankByPersonalScore`) is server-rendered.
`signIn`/`signUp` in `lib/actions/auth.ts` now redirect to `/dashboard` /
`/onboarding/setup` respectively (was `/profile` for both).

### Profile page progress (adapted, not fabricated)
Brief asked for "Meals planned: X/7 days" and "protein progress" rings.
Neither is honestly computable: there's no meal-planning/calendar feature
anywhere in this app (no real data source for "planned" meals), and there's
no food-diary/consumption-log feature either (so "protein consumed this
week" doesn't exist as real data — only the *target* does, which is a real
profile field). `components/profile/ProfileProgress.tsx` shows: budget
progress (real, cart spend vs. `weekly_budget`), the protein *target* alone
(real, no fabricated "progress" percentage against it), and "recipes you
can make right now" (real, replacing "meals planned" with something this
app can actually measure).

### Onboarding wizard (`app/onboarding/setup/page.tsx` + `OnboardingWizard.tsx`, new)
3 steps: goals (client-side only — **no `goals` column exists in the
`profiles` schema**, so this shapes the step-3 preview copy/context, not
saved data — documented rather than silently dropped or given a fake
column), budget slider + allergen/store checkboxes (real, saved via new
`lib/actions/onboarding.ts` → `profiles`/`profile_allergies`, reusing the
same tables Phase 5 already built), and a live preview using
`rankByPersonalScore` against the in-progress selections before final
submit. Distinct route from the existing `/onboarding/constraints` (Phase
1's local/Demo-Profile-only flow, untouched) — these are two genuinely
different flows (local vs. real account) and collapsing them would have
broken the Demo Profile's zero-network guarantee.

### Chat assistant (`/api/ai/chat` + `components/chat/AIChat.tsx`, new)
Floating widget (amber circle, pulsing ring when closed, mascot icon) on
every page via root layout. Streams from Anthropic's SSE Messages API,
re-parsing their `content_block_delta` frames into plain text chunks so the
frontend's `ReadableStream` reader stays simple. Falls back to one
complete deterministic message (still delivered as a one-chunk stream, so
the frontend has one code path either way) when no API key, on timeout
(20s), or on any upstream error — never a raw error to the user. Rate
limited to 30/hour via the same `lib/ai/rateLimiter.ts` from Phase 7, a
separate `chat:` key namespace. System prompt used verbatim as specified.
`useChatUserContext` (`components/chat/useChatUserContext.ts`) passes the
real signed-in profile when available (lazily fetched from Supabase) or
the real Demo Profile values otherwise — never fabricated context.

### Bugs found and fixed during this phase
- **React Compiler ESLint errors** (`react-hooks/immutability`,
  `react-hooks/set-state-in-effect`) in `AIChat.tsx`,
  `useChatUserContext.ts`, `CompareAiVerdict.tsx`: a mutable `accumulated`
  closure variable needed to be a real `useRef` (lint caught a genuine bug
  here — I'd renamed the variable to `accumulatedRef` without actually
  declaring it via `useRef()`, which would have been a runtime
  `ReferenceError`); synchronous `setState` calls in early-return branches
  of effects were moved inside the async IIFE alongside the other state
  updates in the same function, matching the pattern the linter already
  accepted elsewhere in the same file.
- **Recurring dev-mode-only hydration warning** on `.fade-up` elements
  (first seen in Phase 8.5, still appeared in this phase's live browser
  check after the earlier `requestAnimationFrame` fix): increased the
  defer from one animation frame to a 100ms `setTimeout`, which resolved it
  in a real browser recheck. Confirmed this is Next.js 16 dev mode's extra
  Suspense/SegmentView instrumentation misreporting a normal post-mount DOM
  update, not a real hydration bug — production builds don't carry that
  instrumentation layer, and every functional test (unit, E2E, manual) was
  green even before this fix.
- **User-reported issues, both verified against real DOM measurements before
  and after, not just screenshots**: (1) hero "not rendering" — reproduced
  transiently but not on a clean reload with cache bypassed, most likely
  caught mid-edit while multiple landing files were being rewritten
  simultaneously; (2) full-bleed sections not reaching the true viewport
  edge past 1280px — this one was real, see above.

### Gate status: complete, all green
- `npm run lint` ✓, `npm run build` ✓ (20 routes now, including `/dashboard`,
  `/onboarding/setup`, `/api/ai/chat`), `npm run test` ✓ (99/99 — 3 new for
  `rankByPersonalScore`), `npm run e2e` ✓ (6/6).
- Live-checked via Chrome DevTools MCP: `/`, `/shop` (accessibility snapshot
  confirmed correct price-ascending order signed-out, real allergen reasons
  on every conflicting product, "Best value" reason on the cheapest item),
  `/cart`, `/profile` (correctly redirects to sign-in) — zero console
  errors on any of them except the pre-existing, unrelated missing
  `/favicon.ico` (a 404, not a JS error, not introduced this phase).
