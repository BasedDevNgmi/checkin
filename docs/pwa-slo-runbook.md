# PWA SLO Runbook

## SLO targets

- LCP (p75): under 2500ms
- INP (p75): under 200ms
- CLS (p75): under 0.1
- Offline navigation success: at least 99.5%
- Service worker update activation failures: under 0.2%
- Check-in sync backlog older than 24h: 0

## Scorecard signals

- `web-vitals` telemetry (`/api/telemetry/web-vitals`)
- PWA lifecycle events (`/api/telemetry/events`)
- CI quality gate status (Lighthouse, a11y, PWA E2E, bundle budgets)
- Canary healthcheck result (`npm run ops:canary-healthcheck`)

## Alert policy

- Trigger warning when SLO threshold is breached in two consecutive releases.
- Trigger critical alert for any single release with:
  - LCP above 3200ms p75, or
  - INP above 350ms p75, or
  - offline success below 98.5%.

## Incident response

1. Pause rollout and keep canary percentage fixed.
2. Identify failing route and metric from telemetry payload path/name/value.
3. If service worker-related, bump cache version and redeploy with a focused rollback message.
4. Re-run quality gates locally and in CI.
5. Resume rollout only after one clean canary cycle.

## Release checks

- `npm run quality:pwa`
- `npm run ops:canary-healthcheck`
- Verify zero serious/critical a11y regressions in Playwright axe output.
