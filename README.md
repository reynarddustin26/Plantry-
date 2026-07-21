# Plantry

Personalised grocery, nutrition, budgeting and meal-planning assistant. See
`docs/PLANTRY_MASTER_BLUEPRINT.md` for the full product spec and `PLAN.md` for
the implementation plan and phase-by-phase progress.

**Current status:** Phase 2 (Core shopping flow) — local data only, no backend
yet. Intent → constraints → store-selection → shop (search/filter/compare) →
cart, plus the Demo Profile viewer, are all live.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The Demo Profile and full
62-product catalog work entirely offline — no environment variables or network
access required through Phase 4.

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # production build
npm run lint     # eslint (scoped to app/, components/, lib/, store/)
npm run test     # vitest (unit tests)
npm run e2e      # playwright (E2E, see E2E_TESTING.md)
```

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4 + Zustand + Zod +
Framer Motion. See `PLAN.md` §"Section B" for the current phase's folder
conventions.
