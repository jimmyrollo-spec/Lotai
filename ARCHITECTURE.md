# ARCHITECTURE.md

## Product architecture principle

The UI is not the rules engine. Regulatory content must never be hard-coded into presentation components.

Long-term flow:

`address -> geocode -> parcel resolution -> jurisdiction resolution -> spatial facts -> project assumptions -> normalized rules -> applicability engine -> derived checks -> confidence -> evidence bundle -> UI/report`

## Current app stack

- Next.js App Router
- TypeScript strict mode
- React 19
- CSS design tokens / global component classes for the first vertical slice
- Server components by default
- Client components only where interaction is required

## Planned production services

Add only when the current phase needs them:

1. PostgreSQL + PostGIS for parcels, jurisdictions, spatial layers, normalized rules, sources and result snapshots.
2. Address/geocoding provider abstraction.
3. Map rendering provider abstraction.
4. Stripe for paid reports/subscriptions.
5. Transactional email.
6. Analytics and error monitoring.
7. PDF/report renderer.
8. Admin/rule-verification workspace.

Do not introduce vendor SDKs before a feature is being implemented.

## Intended source-of-truth entities

### Property / spatial
- `properties`
- `parcels`
- `jurisdictions`
- `zoning_districts`
- `spatial_layers`
- `property_layer_matches`

### Regulatory
- `sources`
- `source_versions`
- `rules`
- `rule_versions`
- `rule_applicability`
- `rule_exceptions`
- `verification_events`

### Product
- `project_types`
- `project_inputs`
- `analyses`
- `analysis_checks`
- `analysis_evidence`
- `reports`
- `users`
- `saved_properties`

## Rule record minimum fields

A production material rule must carry:
- jurisdiction ID
- project type
- rule category
- normalized value + unit where applicable
- human-readable explanation
- applicability expression / conditions
- exceptions
- source ID and exact section/page locator when possible
- effective date
- superseded date/status
- last verified timestamp
- verifier/method
- confidence
- review notes

## Confidence model

Feasibility status and confidence are separate.

Example:
- status: `likely_feasible`
- confidence: `medium`
- blockers: none known
- unresolved: easement data unavailable

Never convert missing data into a positive assumption silently.

## URL intent

Public product:
- `/` — homepage / address + project intake
- `/analyze` — private/noindex property analysis workspace when real addresses are supported
- `/methodology` — authority page
- `/coverage` — future coverage matrix
- `/sources` — future source directory
- `/pricing` — future monetization
- `/pro` — future professional product

SEO architecture later:
- `/projects/[project]`
- `/[state]/[city]/[project]`
- `/[state]/[city]/permits/[project]`
- `/[state]/[city]/setbacks/[project]`

Only index jurisdiction/project pages that meet unique-data and source-quality thresholds. Real-address result URLs should be noindex/private by default.

## Brand isolation

Public working name is stored in `lib/brand.ts`. Do not scatter the brand name through new components. Final rename should be mostly config + metadata/assets.

## AI-assisted development rules

1. Read `BUILD_STATE.md`, `ARCHITECTURE.md`, and `DESIGN_SYSTEM.md` before coding.
2. Never replace architecture as part of an unrelated UI change.
3. Do not add a second component/style system.
4. Do not hard-code live regulatory facts in JSX.
5. Schema changes require explicit migration notes.
6. Avoid monolithic files; extract repeated interactive/data patterns.
7. Do not churn dependencies without a clear feature requirement.
8. Preserve mobile behavior and prototype/live-data labels.
9. Build after meaningful changes and fix errors before advancing phases.
10. Update `BUILD_STATE.md` after every completed phase.
