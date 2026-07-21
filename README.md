# Plantry

Personalised grocery, nutrition, budgeting and meal-planning assistant. See
`docs/PLANTRY_MASTER_BLUEPRINT.md` for the full product spec and `PLAN.md` for
the implementation plan and phase-by-phase progress.

**Current status:** Phase 1 (Foundation & brand system) — local data only, no
backend yet. Intent-first opening, constraints, store-selection, and Demo
Profile screens are live.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The Demo Profile works
entirely offline — no environment variables or network access required for
Phase 1.

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # production build
npm run lint      # eslint (scoped to app/, components/, lib/, store/)
npm run test      # vitest
```

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4 + Zustand + Zod. See
`PLAN.md` §"Section B" for the current phase's folder conventions.
