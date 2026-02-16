# Inchecken

A mobile-first PWA for a psychological daily check-in exercise (Dutch). Built with Next.js (App Router), Tailwind CSS, Framer Motion, Lucide React, and Supabase.

## Setup

1. **Clone and install**

   ```bash
   cd inchecken && npm install
   ```

2. **Local storage mode (no Supabase)**

   To test the app without setting up Supabase, add to `.env.local`:

   ```env
   NEXT_PUBLIC_USE_LOCAL_STORAGE=true
   ```

   Then run `npm run dev`. You can use the dashboard and check-in wizard immediately; data is stored in the browser’s localStorage and auth is skipped.

3. **Supabase (for real auth and sync)**

   - Create a project at [supabase.com](https://supabase.com).
   - In the SQL Editor, run the contents of `supabase/schema.sql` to create the `checkins` table and RLS.
   - In Authentication → URL Configuration, set Site URL and add `http://localhost:3000` (and your production URL) to Redirect URLs.
   - Copy Project URL and **Publishable key** (or legacy anon key) from Settings → API.

4. **Environment**

   Copy `.env.local.example` to `.env.local`. For Supabase, set:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-or-anon-key
   ```

   Do **not** set `NEXT_PUBLIC_USE_LOCAL_STORAGE` when using Supabase.

5. **PWA icons (optional)**

   Add `public/icon-192.png` and `public/icon-512.png` for the PWA manifest. The app works without them.

6. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). In Supabase mode, sign up via the login page (email + password or magic link), then use **Nieuwe check-in** to run the wizard.

## Migrating from local storage to Supabase

1. Set `NEXT_PUBLIC_USE_LOCAL_STORAGE=false` (or remove it) and add your Supabase env vars.
2. Optional: before switching, export your local check-ins (e.g. from the browser console: `JSON.parse(localStorage.getItem('inchecken_checkins') || '[]')`) and save the JSON. You can later insert those rows into the `checkins` table (e.g. via a script or Supabase SQL) using your new user id.

## Features

- **Auth**: Email/password and magic link (Supabase Auth).
- **Check-in wizard**: Gedachten (cloud textarea), Gevoel (emoji grid), Lichaam (interactive body map), Energie (battery slider), Gedrag (Bewust/Autonoom, Waarden-check).
- **Dashboard**: 7-day energy graph and recent thoughts/emotions.
- **Offline**: Check-ins are stored locally when offline and synced when back online.

## Scripts

- `npm run dev` – development
- `npm run build` – production build
- `npm run start` – run production build
