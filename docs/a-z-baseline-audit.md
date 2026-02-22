# A-Z Baseline Audit (RAG)

Last updated: 2026-02-21

This file is the baseline scorecard for the A-Z checklist.  
Legend: `Green` = in place, `Amber` = partial, `Red` = missing.

## Scorecard

| Letter | Area | Status | Evidence / Gaps |
|---|---|---|---|
| A | Accessibility | Amber | Focus styles and aria labels exist, but route-level skip flow and broader audit still needed. |
| B | Brand System | Green | Shared tokens and glass primitives are centralized in `src/app/globals.css` and `src/components/ui`. |
| C | Core Web Vitals | Amber | Speed insights present; explicit web-vitals endpoint/reporting now added but SLO alerting still missing. |
| D | Data Integrity | Amber | RLS exists and payload sanitization added in `src/lib/checkin-validation.ts`; schema-level validation can be expanded. |
| E | Error Handling | Amber | Route-level error boundaries added; feature-specific granular boundaries still possible. |
| F | Feature Flags | Red | No dedicated feature flag layer yet. |
| G | Growth Loop | Red | No event taxonomy or funnel dashboard yet. |
| H | Hardening Auth | Amber | Supabase auth middleware and redirects exist; deeper edge-case matrix still needed. |
| I | iOS/PWA Native Feel | Amber | App-shell scroll model exists; standalone-specific keyboard and pull-to-refresh edge behavior needs further validation. |
| J | Journey Mapping | Red | Formal user journey documentation not yet added. |
| K | KISS Guardrails | Amber | Major refactors done; no automated complexity gate in CI yet. |
| L | Logging / Observability | Amber | Speed Insights and web-vitals logging exist; centralized error tracking is still missing. |
| M | Mobile-First QA | Amber | Significant mobile polish done; no repeatable device matrix checklist yet. |
| N | Navigation Clarity | Green | Sidebar and bottom nav active states are explicit and route-aware. |
| O | Offline Reliability | Amber | SW fallback exists and cross-origin cache writes restricted; strategy can be tuned per asset type. |
| P | Privacy / Security | Amber | Security headers and RLS are in place; CSP hardening and privacy docs can be improved. |
| Q | Quality Gates | Green | CI now runs lint + typecheck + tests + build. |
| R | Reliability Budget | Red | Error budget/SLO docs and automated reporting not yet present. |
| S | SEO / Sharing | Amber | Base metadata exists; richer OG/canonical strategy still limited. |
| T | Testing Pyramid | Amber | Unit + e2e smoke exist; broader component coverage still needed. |
| U | UX Writing | Amber | Core copy quality is good; no shared microcopy style guide yet. |
| V | Visual Regression | Red | No visual snapshot regression checks configured. |
| W | Web Performance | Amber | Dynamic imports and PWA are used; formal route bundle/perf budget not yet enforced. |
| X | eXperimentation | Red | No A/B experiment framework or event hooks yet. |
| Y | Year-Round Maintenance | Amber | CI exists; no scheduled maintenance cadence document/checklist prior to this audit. |
| Z | Zero-Defect Release Ritual | Amber | Build pipeline exists; release ritual checklist now documented separately. |

## Next Priority

1. Stabilize `A/E/Q/R/Z` foundations.
2. Complete `B/I/M/N/U` polish pass.
3. Harden `D/H/O/P` and add explicit validation tests.
4. Push `C/G/W/X/Y` with measurable targets.
