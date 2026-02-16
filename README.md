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
# checkin
