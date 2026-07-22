# 🌱 Plantry
> Personalised grocery, nutrition and meal-planning
> assistant — built for the ICON UNSW × Lyra Hackathon

**Live site:** https://plantry-git-master-plantry.vercel.app
**GitHub:** https://github.com/reynarddustin26/Plantry-

---

## What it does
Plantry compares grocery prices across Coles,
Woolworths and IGA, blocks allergens before they
reach your cart, matches your basket to recipes,
and shows exactly how much time and money you saved.

## Quick start

```bash
git clone https://github.com/reynarddustin26/Plantry-
cd Plantry-
npm install
cp .env.example .env.local
# fill in your keys (see Environment Variables below)
npm run dev
```

Open http://localhost:3000

## Environment Variables

Create .env.local with:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
```

Get a free Gemini key at https://aistudio.google.com/apikey
Get Supabase keys from your project dashboard.

All four are optional — Plantry stays fully usable with none of them set
(the Demo Profile and full product catalog work offline; AI calls fall
back to deterministic, non-fabricated explanations without a Gemini key).

## Database setup

Run `supabase/migrations/0001_init.sql` in your Supabase SQL Editor before
starting the app.

## Scripts

```bash
npm run dev          # start dev server
npm run build        # production build
npm run test         # unit tests (108 passing)
npm run e2e           # E2E tests (6 passing)
npm run verify-rls    # test RLS isolation
npm run ingest        # populate products + recipes
```

`verify-rls` and `ingest` both require `.env.local` and the migration above
already applied.

## Tech Stack

- **Frontend:** Next.js 16 App Router + TypeScript + Tailwind CSS v4
- **State:** Zustand + Zod validation
- **Database:** Supabase (Postgres + Auth + RLS)
- **AI:** Google Gemini API (free tier)
- **Animations:** Framer Motion
- **Testing:** Vitest + Playwright
- **Deployment:** Vercel

## AI Tools Used

- Claude Code — implementation, testing, code review
- Google Gemini — live AI explanations and chat
- Open Food Facts + USDA FoodData Central — product nutrition data
- TheMealDB — recipe catalogue

## Features

- 🔍 Price comparison across 3 stores with unit pricing
- 🛡️ Hard allergen blocking — never softened by scores
- 🤖 AI chat assistant (ask about products, meals, budget)
- 🍳 Recipe matching from cart contents
- 💰 Basket optimiser with explainable savings
- 📊 Nutrition tracking against personal targets
- 👤 Personalised onboarding and user profiles

## Hackathon

Built for ICON UNSW × Lyra Hackathon 2025
Theme: Save time through personalisation
