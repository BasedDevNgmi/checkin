# Design System Contract

This project uses shared visual primitives to keep spacing/alignment consistent:

- Global tokens: `src/app/globals.css`
- Reusable controls: `src/components/ui`
- Navigation shells: `glass-nav`, `glass-card`, `glass-panel`

## Rules

1. Use tokenized spacing/radius/shadow values from `globals.css`.
2. Prefer existing `Button`, `Input`, `Card`, and form control styles before creating new variants.
3. Keep minimum touch targets at 44px on mobile.
4. Route-level page wrappers should keep consistent vertical rhythm (`py-6 sm:py-8` and mobile-safe bottom padding).
5. New surfaces should use the glass utility classes unless there is a clear semantic reason not to.
