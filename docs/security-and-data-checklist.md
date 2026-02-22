# Security and Data Checklist

## Auth hardening
- [ ] Confirm callback `next` redirect only accepts internal paths (`/auth/callback` already enforces this).
- [ ] Confirm unauthenticated users are redirected away from protected routes.
- [ ] Confirm authenticated users are redirected from `/` to `/dashboard`.

## Data integrity
- [ ] Check-in payload is sanitized before insert/update (`src/lib/checkin-validation.ts`).
- [ ] Energy level is clamped to 0-100.
- [ ] Unknown emotions/body parts are stripped.

## Privacy and headers
- [ ] Security headers are configured in `next.config.ts`.
- [ ] RLS is enabled and enforced in `supabase/schema.sql`.
- [ ] No secrets committed; only `.env.local` values used locally.

## Offline behavior
- [ ] Service worker caches only same-origin GET responses.
- [ ] Offline fallback returns cached route shell.
