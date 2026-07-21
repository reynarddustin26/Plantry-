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
