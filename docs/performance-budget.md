# Performance Budget and Cadence

## Targets (75th percentile, real users)

- LCP: under 2.5s
- INP: under 200ms
- CLS: under 0.1
- Warm route transition (menu click to stable content): under 150ms on modern mobile

## Route priorities

1. `/dashboard`
2. `/checkin`
3. `/analytics`
4. `/profile`

## Guardrails

- Run `npm run validate` before release.
- Keep dynamic imports for heavier analytics/chart surfaces.
- Keep nav prefetch enabled for primary route links.
- Investigate any sustained web-vitals degradation for two consecutive releases.

## Monthly review

- Compare web-vitals logs month-over-month.
- Re-check route transition speed on mobile.
- Remove unused code/dependencies and stale client-side state paths.
