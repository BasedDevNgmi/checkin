# Maintenance Cadence

## Monthly
- Dependency updates (minor/patch)
- Security header and auth flow regression check
- Performance spot-check (route transitions + web-vitals logs)

## Quarterly
- UX consistency pass (spacing, alignments, copy consistency)
- Architecture cleanup for dead code and stale abstractions
- Accessibility audit on top 5 user paths

## Before major release
- Run `npm run validate`
- Execute `docs/release-ritual.md`
- Capture post-release metrics after 24 hours
