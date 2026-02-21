# Plan: Password recovery + premium login page

## Goals

1. **Password recovery** – Users can request a reset email and set a new password via the link.
2. **Premium login experience** – One cohesive auth area with login, signup, magic link, and forgot-password, with a clear, polished design.

---

## 1. Password recovery flow

### 1.1 Behaviour

- **Forgot password:** User enters email → we call Supabase `resetPasswordForEmail(email, { redirectTo })` → user gets email with link.
- **Set new password:** User clicks link → Supabase redirects to our URL with tokens → we show a “Set new password” form → on submit we call `updateUser({ password })` and redirect to dashboard.

### 1.2 Supabase usage

- **Send reset:** `supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/login/set-password` })`
- **After redirect:** Supabase puts the session in the URL (hash/query). The client recovers the session on load. We then show a form with “New password” + “Confirm password”.
- **Update password:** `supabase.auth.updateUser({ password: newPassword })` then redirect to `/dashboard`.

**Important:** Add `https://<your-domain>/login/set-password` (and localhost equivalent) to Supabase Dashboard → Authentication → URL configuration → Redirect URLs.

### 1.3 Routes

| Route | Purpose | Public? |
|-------|--------|--------|
| `/login` | Main auth hub (login, signup, magic link, link to forgot) | Yes |
| `/login/forgot` | “Wachtwoord vergeten” – email only, sends reset email | Yes |
| `/login/set-password` | Landed from email link – set new password form | Yes |

### 1.4 Middleware

- Treat `/login`, `/login/forgot`, and `/login/set-password` as public (same as current `/login`).
- In `src/lib/supabase/middleware.ts`, extend `isPublic` so that `request.nextUrl.pathname.startsWith("/login")` remains true (already the case if you keep pathname.startsWith("/login")).

### 1.5 Auth callback (optional)

- Password reset link may redirect to `redirectTo` with hash fragment; Supabase client will pick up the session when the set-password page loads. No change to `/auth/callback` is required unless you explicitly use a callback URL for recovery (e.g. `redirectTo: origin + '/auth/callback?next=/login/set-password'`). **Recommended:** keep redirect as `/login/set-password` and handle session recovery on that page only.

### 1.6 Set-password page logic

- Client component.
- On mount: optional one-time check – if no session after a short delay (Supabase may still be reading hash), show “Bezig met laden…” then either the form or “Deze link is ongeldig of verlopen. Vraag een nieuwe aan.”
- Form: “Nieuw wachtwoord”, “Herhaal wachtwoord”, submit → `updateUser({ password })` → on success redirect to `/dashboard` and refresh; on error show message.
- Validation: min length 6, both fields match; use same rules as signup.

---

## 2. Premium login page – features

All of these should be available from the main auth experience:

| Feature | Where | Notes |
|--------|--------|--------|
| **Log in** (email + password) | Main login view | Primary CTA; “Wachtwoord vergeten?” link next to or under password |
| **Account aanmaken** (sign up) | Same page as tab/mode or secondary CTA | Email + password, min 6 chars; success: “Check je e-mail om te bevestigen” |
| **Magic link** | Same page, tertiary option | “Magic link sturen (geen wachtwoord)” |
| **Wachtwoord vergeten** | Dedicated `/login/forgot` or inline step | Email only → send reset → success message |
| **Set new password** | `/login/set-password` | Only after clicking email link |
| **Terug naar start** | All auth pages | Link to `/` |
| **Error/success messages** | All forms | Use existing `text-[var(--text-error)]` / `text-[var(--text-success)]` |
| **Loading states** | All submit actions | Disable button, show “Even geduld…” / “Versturen…” etc. |
| **Focus & a11y** | All inputs and buttons | `focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]`, labels, `aria-describedby` for errors |

---

## 3. Premium login page – design

### 3.1 Layout options (pick one)

- **Option A – Split layout (recommended for “premium”)**  
  - **Left (e.g. 40–50%):** Branding, app name, short tagline, optional subtle illustration or gradient using existing `--page-gradient` / `--accent` so it feels part of the app.  
  - **Right:** Single card or zone with the form; tabs or toggles for “Inloggen” / “Account maken” so the main login is default and signup is one click away. “Magic link” and “Wachtwoord vergeten” as text links.

- **Option B – Centered single card (current, upgraded)**  
  - Full-screen center, one card with clear hierarchy: title, short subtitle, then form. Use tabs or a toggle for Login vs Sign up; “Wachtwoord vergeten?” and “Magic link” as links. Slightly larger card, more padding, and a clear visual hierarchy (typography, spacing).

Recommendation: **Option A** for a more “premium” feel; **Option B** if you prefer minimal layout change with a design polish pass.

### 3.2 Design system (existing)

- Use only existing tokens from `globals.css`: `--background`, `--foreground`, `--surface-glass`, `--surface-glass-strong`, `--surface-border`, `--text-primary`, `--text-muted`, `--text-soft`, `--accent`, `--accent-soft`, `--focus-ring`, `--radius-control`, `--radius-card`, `--shadow-zen`, `--interactive-hover`, `--interactive-active`, `--text-success`, `--text-error`.
- Buttons: primary = gradient + `hover:opacity-95` + `active:opacity-90`; secondary/outline = border + `hover:bg-[var(--interactive-hover)]` + `active:bg-[var(--interactive-active)]`. Use `focus-visible` only for focus ring.
- Inputs: same radius and border; focus ring `focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2`.
- Typography: existing font stack; clear hierarchy (one strong title, short subtitle, then form).

### 3.3 UX details

- **Single form per view:** Main login = email + password + “Log in” + “Wachtwoord vergeten?” + “Account aanmaken” + “Magic link”. Signup can be a second “tab” or mode on the same page with “Account aanmaken” as primary and “Al een account? Log in” to switch back.
- **Forgot password:** Either a dedicated `/login/forgot` page with the same layout (left branding, right card with “E-mail voor reset” + submit + “Terug naar inloggen”), or an inline step on `/login` that replaces the form with “Vul je e-mail in” and success message. Recommendation: **dedicated `/login/forgot`** for clarity and so the main login stays simple.
- **Set-password page:** Same layout as login/forgot (split or centered) so it feels part of the same “auth” experience; form title “Kies een nieuw wachtwoord”.
- **Motion:** Reuse existing Framer Motion pattern (e.g. `initial={{ opacity: 0, y: 12 }}` / `animate` / `transition`) for the form card or main content; keep it subtle.
- **Responsive:** On small screens, split can stack (branding on top, form below) or collapse to a single centered card.

### 3.4 File structure (suggested)

```
src/app/
  login/
    page.tsx              → Main premium login (login + signup + magic link + link to forgot)
    forgot/
      page.tsx            → Forgot password (email only)
    set-password/
      page.tsx            → Set new password (after email link)
  auth/
    callback/
      route.ts            → No change (or keep as is for magic link/signup confirm)
```

- Reuse one shared **AuthLayout** or **AuthCard** component for consistent left/right or centered layout and “Terug naar start” if you want to avoid duplication.

---

## 4. Implementation order

1. **Password recovery – backend flow**  
   - Implement `/login/forgot`: form, `resetPasswordForEmail`, success/error messages.  
   - Implement `/login/set-password`: session detection, “New password” + “Confirm” form, `updateUser`, redirect.  
   - Ensure middleware allows `/login/forgot` and `/login/set-password`.  
   - Document adding redirect URL in Supabase.

2. **Premium login page – structure**  
   - Decide layout (split vs centered).  
   - Add shared layout/wrapper for auth pages if desired.  
   - Refactor `/login/page.tsx`: same actions (password login, signup, magic link) with new layout and “Wachtwoord vergeten?” link to `/login/forgot`.

3. **Premium login page – design pass**  
   - Apply design tokens consistently; fix focus (use `focus-visible`), button hover/active, error/success copy.  
   - Add tabs or toggle for Inloggen vs Account aanmaken.  
   - Optional: add a small illustration or gradient on the left (split) or above the card (centered).

4. **Polish**  
   - Loading and disabled states on all buttons.  
   - Accessibility: labels, `aria-describedby` for errors, focus order.  
   - Test full flow: login, signup, magic link, forgot → email → set password → dashboard.

---

## 5. Summary

- **Password recovery:** Forgot at `/login/forgot` (email → reset email); set new password at `/login/set-password` after clicking the link; use `resetPasswordForEmail` and `updateUser`; add set-password URL to Supabase redirect list.
- **Premium login:** One main `/login` with login, signup, and magic link; “Wachtwoord vergeten?” linking to `/login/forgot`; same design system and a clear layout (split or upgraded centered card) with good hierarchy, focus, and loading/error states.
- **Consistency:** All auth pages share the same tokens and patterns; set-password and forgot feel like part of the same flow.
