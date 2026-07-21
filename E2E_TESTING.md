# Plantry E2E Testing Guide

## Phase 2 Gate Criterion: E2E Suite Green for Intent → Cart

This E2E test suite validates the critical user journey required for Phase 2 approval:
- Intent selection (/) → select an intent (e.g., "Health")
- Constraints (/onboarding/constraints) → pre-filled with Demo Profile
- Store selection (/store-selection) → Coles & Woolworths pre-selected
- Shop (/shop) → search and add a product to cart
- Cart (/cart) → verify item, quantity, AUD price display, and localStorage persistence
- Reload verification → cart persists via Zustand localStorage middleware
- Allergy warnings → icon + text rendering verification

## Quick Start

### Run All E2E Tests (All Browsers)
```bash
npm run e2e
```
Runs tests in Chromium, Firefox, and WebKit.

### Run E2E Tests for Single Browser
```bash
npm run e2e -- --project=chromium
npm run e2e -- --project=firefox
npm run e2e -- --project=webkit
```

### View HTML Report
After running tests:
```bash
npx playwright show-report
```
Opens the interactive HTML report at `http://localhost:3000` (note: Playwright serves a different port).

### Run Tests in Debug Mode
```bash
npx playwright test --debug
```
Opens Playwright Inspector for step-by-step debugging.

### Run Tests Headed (See Browser)
```bash
npx playwright test --headed
```
Shows the browser during test execution.

## Test Files

- **`e2e/intent-to-cart.spec.ts`** — Main test suite with two test cases:
  1. Full journey from intent selection to persistent cart
  2. Allergy warning icon + text rendering verification

## Configuration

- **`playwright.config.ts`** — Playwright configuration
  - Base URL: `http://localhost:3000`
  - Auto-starts dev server via webServer config
  - Reuses existing server if already running (except in CI)
  - Trace collection on first retry for debugging
  - HTML reporter enabled

- **`vitest.config.ts`** — Updated to exclude `e2e/` directory
  - Prevents Vitest from picking up Playwright tests
  - Keeps unit tests and E2E tests separate

## Scripts (package.json)

- `npm run test` — Unit tests only (Vitest)
- `npm run e2e` — E2E tests only (Playwright)
- `npm run dev` — Dev server (auto-started by Playwright)

## What Gets Tested

### Test 1: Full Journey to Persistent Cart
1. ✅ Navigate to home page
2. ✅ Select "Health" intent card
3. ✅ Continue to constraints page
4. ✅ Verify Demo Profile pre-fill (budget: 80, allergies: dairy + tree nut)
5. ✅ Continue to store selection
6. ✅ Verify Coles & Woolworths pre-selected
7. ✅ Continue to shop page
8. ✅ Search for "milk" (filter products)
9. ✅ Add a milk product to cart
10. ✅ Navigate to cart via header link
11. ✅ Verify item, quantity (1), and AUD price ($X.XX format)
12. ✅ Reload page
13. ✅ Verify cart item persists (localStorage via Zustand)

### Test 2: Allergy Warnings (Icon + Text)
1. ✅ Navigate through intent → constraints → store selection
2. ✅ Reach shop page and search for "milk"
3. ✅ Find allergen warnings with `.allergen-warning` role="alert"
4. ✅ Verify icon (⚠) and text ("Contains:") are both present
5. ✅ Verify specific allergen names are displayed

## Key Implementation Details

### Cart Persistence
- **Store**: Zustand with `persist` middleware
- **Key**: `plantry-cart` (localStorage)
- **Hydration**: CartHydrator component uses `skipHydration: true` + `useEffect` to rehydrate post-mount
- **Test Wait**: 200ms `waitForTimeout()` after navigation/reload to allow hydration

### Selectors Used
- `:has-text()` for content-based selection
- `.allergen-warning[role="alert"]` for accessibility warnings
- `p.text-xl.font-bold` for total price (specific class combo)
- `input[type="search"]` for product filter
- `button:has-text()` for intent/store/action buttons

### Browser Support
- **Chromium** — Primary (used in most CI/CD)
- **Firefox** — Secondary validation
- **WebKit** — Safari compatibility check

## Troubleshooting

### Tests Timeout
- Increase `timeout` in playwright.config.ts or individual tests
- Check if dev server is running: `npm run dev` in separate terminal
- Verify no other process is using port 3000

### Selectors Not Found
- Run debug mode: `npx playwright test --debug`
- Take screenshots: add `await page.screenshot({ path: 'debug.png' })`
- Inspect element structure in browser

### Cart Doesn't Persist
- Verify CartHydrator is in root layout
- Check localStorage key: `plantry-cart`
- Ensure Zustand store has `persist` middleware with `skipHydration: true`
- Add `await page.waitForTimeout(200)` after reload

### HTML Report Missing
- Default location: `playwright-report/`
- If missing, run tests with `--reporter=html` explicitly
- View with: `npx playwright show-report`

## CI/CD Integration

In CI environments, tests run with:
- `retries: 2` (retry failed tests up to 2 times)
- `workers: 1` (sequential execution for stability)
- `forbidOnly: true` (fail if any `test.only` left in code)
- `trace: 'on-first-retry'` (collect trace for debugging)

To disable retries locally, set `CI=false` before running.

## Performance Baselines

- Single test execution: ~3-6 seconds (chromium)
- Full suite (2 tests × 3 browsers): ~18-20 seconds
- Dev server startup: ~5-10 seconds (included in timeout)

## Assertion Priorities

Tests use a priority order for assertions:
1. **URL checks** — Verify correct page reached
2. **Title/Heading checks** — Confirm page identity
3. **Content visibility** — Element exists and is visible
4. **State/Value checks** — Correct data is displayed (budget: 80, allergies selected)
5. **Interaction results** — Item added, price calculated, storage persisted

## Notes for Developers

- Do NOT interact with the "N" Next.js dev tools button in corner (auto-ignored)
- CartHydrator uses `useEffect` for post-mount rehydration (SSR safety)
- AllergyWarning component always pairs icon with text (WCAG compliance)
- Product search filters synchronously (no debounce visible in tests)
- Demo Profile is static and resets on app reload (no backend persistence yet)
