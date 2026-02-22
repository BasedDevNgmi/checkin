# Security and Data Checklist

## Auth hardening
- [ ] Confirm callback `next` redirect only accepts internal paths (`/auth/callback` already enforces this).
- [ ] Confirm unauthenticated users are redirected away from protected routes.
- [ ] Confirm authenticated users are redirected from `/` to `/dashboard`.

### Auth edge-case test matrix

| Scenario | Expected result | Test file |
|---|---|---|
| Callback without `code` | Redirect to `/?error=auth` | `src/app/auth/callback/route.test.ts` |
| Callback with invalid `next` (`//...`) | Redirect to `/dashboard` | `src/app/auth/callback/route.test.ts` |
| Callback exchange failure | Redirect to `/?error=auth` | `src/app/auth/callback/route.test.ts` |
| Unauthenticated protected route | Redirect to `/` | `src/lib/supabase/middleware.test.ts` |
| Authenticated root route | Redirect to `/dashboard` | `src/lib/supabase/middleware.test.ts` |
| Recovery link invalid/expired | Show invalid link state | `src/app/login/update-password/page.test.tsx` |

## Data integrity
- [ ] Check-in payload is sanitized before insert/update (`src/lib/checkin-validation.ts`).
- [ ] Energy level is clamped to 0-100.
- [ ] Unknown emotions/body parts are stripped.

## Privacy and headers
- [ ] Security headers are configured in `next.config.ts`.
- [ ] Strict CSP is configured and validated in production.
- [ ] RLS is enabled and enforced in `supabase/schema.sql`.
- [ ] No secrets committed; only `.env.local` values used locally.
- [ ] Privacy policy is documented in `docs/privacy-policy.md`.

## Offline behavior
- [ ] Service worker caches only same-origin GET responses.
- [ ] Offline fallback returns cached route shell.
- [ ] Service worker excludes auth and API paths from cache.
