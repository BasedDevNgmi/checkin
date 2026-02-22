# Inchecken

A mobile-first PWA for a psychological daily check-in exercise (Dutch). Built with Next.js (App Router), Tailwind CSS, Framer Motion, Lucide React, and Supabase.

## Setup

1. **Clone and install**

   ```bash
   cd inchecken && npm install
   ```

2. **Supabase**

   - Create a project at [supabase.com](https://supabase.com).
   - In the SQL Editor, run the contents of `supabase/schema.sql` to create the `checkins` table and RLS.
   - In Authentication → URL Configuration, set Site URL and add `http://localhost:3000` (and your production URL) to Redirect URLs.
   - Copy Project URL and **Publishable key** (or legacy anon key) from Settings → API.

3. **Environment**

   Copy `.env.local.example` to `.env.local` and set:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-or-anon-key
   NEXT_PUBLIC_ENABLE_SW=false
   NEXT_PUBLIC_ENABLE_PWA_EXPERIMENTS=false
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-web-push-public-key
   ```

4. **PWA icons (optional)**

   Add `public/icon-192.png` and `public/icon-512.png` for the PWA manifest. The app works without them.

5. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Sign up via the login page (email + password or magic link), then use **Nieuwe check-in** to run the wizard.

## Features

- **Auth**: Email/password and magic link (Supabase Auth).
- **Check-in wizard**: Gedachten (cloud textarea), Gevoel (emoji grid), Lichaam (interactive body map), Energie (battery slider), Gedrag (Bewust/Autonoom, Waarden-check).
- **Dashboard**: 7-day energy graph and recent thoughts/emotions.
- **Offline**: Check-ins are queued when offline and synced to Supabase when back online.

## Scripts

- `npm run dev` – development
- `npm run build` – production build
- `npm run start` – run production build
- `npm run lint` – lint checks
- `npm run typecheck` – strict TypeScript checks
- `npm run test` – unit tests
- `npm run test:e2e:ci` – Playwright end-to-end suite (dev preview mode)
- `npm run test:e2e:pwa` – PWA lifecycle assertions against production server
- `npm run test:a11y` – accessibility regression checks (axe + Playwright)
- `npm run perf:budget` – route asset budget gate
- `npm run perf:lighthouse` – Lighthouse CI assertions
- `npm run quality:pwa` – all PWA quality gates
- `npm run ops:canary-healthcheck` – post-build route health checks
- `npm run validate` – full local release gate (lint + typecheck + test + build)

## Operational docs

- `docs/a-z-baseline-audit.md` – current RAG score across A-Z checklist
- `docs/release-ritual.md` – pre-release and post-release verification steps
- `docs/mobile-qa-checklist.md` – repeatable mobile/PWA verification
- `docs/ux-writing-guidelines.md` – copy and microcopy standards
- `docs/design-system-contract.md` – visual/spacing consistency rules
- `docs/performance-budget.md` – measurable speed targets and review cycle
- `docs/pwa-slo-runbook.md` – SLO thresholds, alerts, and incident steps for PWA health
- `docs/security-and-data-checklist.md` – auth/data/privacy/offline verification
- `docs/privacy-policy.md` – user-facing privacy policy and processing details
- `docs/experiments-roadmap.md` – controlled growth experiments and success metrics
