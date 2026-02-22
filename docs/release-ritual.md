# Release Ritual (Zero-Defect)

Use this checklist before every production release.

## 1) Pre-merge gate

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] Confirm no new high-severity accessibility regressions

## 2) Product-critical smoke pass

- [ ] Login (password and magic link)
- [ ] Protected route redirect behavior
- [ ] Create check-in, edit check-in, delete check-in
- [ ] Dashboard and analytics load with realistic data volume
- [ ] Offline banner and reconnect sync path

## 3) Mobile/PWA pass

- [ ] iPhone Safari (in-browser)
- [ ] iPhone PWA standalone
- [ ] Android Chrome
- [ ] Validate bottom navigation/FAB spacing and keyboard-safe interaction

## 4) Reliability and observability checks

- [ ] Verify web-vitals telemetry appears in production logs
- [ ] Confirm no spike in route errors after deploy
- [ ] Confirm no auth redirect loops in middleware/proxy logs

## 5) Rollback readiness

- [ ] Previous production build is known and recoverable
- [ ] Hotfix owner assigned for first 60 minutes post-release
- [ ] Post-release validation window scheduled

## Reliability SLO starter targets

- Route transition failures: less than 0.5% of navigations
- Check-in save failure rate: less than 0.2% of save attempts
- Core Web Vitals (75th percentile): LCP less than 2.5s, INP less than 200ms, CLS less than 0.1
