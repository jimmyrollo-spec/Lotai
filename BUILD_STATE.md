# BUILD_STATE.md

## Working product name

`LotAI` — placeholder only. Brand must remain replaceable through `lib/brand.ts`.

## Current phase

**Phase 1 — first vertical slice**

Goal: establish the visual/product contract and make the primary journey tangible before integrating real municipal/parcel data.

### Included in this phase
- [x] Repository initialized
- [x] Architecture contract documented
- [x] Design system documented
- [x] Brand isolated in config
- [x] Homepage
- [x] Address + project intake
- [x] Initial V1 project taxonomy
- [x] Prototype property feasibility workspace
- [x] Evidence/confidence UX concept
- [x] Methodology authority page
- [x] Responsive/mobile styling
- [x] Production build verified in GitHub Actions
- [x] CI build check runs on pushes/PRs to `main`
- [ ] Railway deployment
- [ ] Final brand/domain

### Explicitly NOT live yet
- Address autocomplete/geocoding
- Parcel resolution
- GIS/map provider
- Zoning lookup
- Municipal code/rule ingestion
- Permit data
- Real confidence scoring
- Authentication
- Payments
- PDF reports
- Analytics
- Professional dashboard

All result data currently comes from `lib/demo-data.ts` and is labeled as prototype data in the UI.

## Current V1 project priority

1. Detached garage / workshop
2. Deck
3. Shed / accessory structure
4. Pool
5. Home addition

ADU is intentionally not the primary wedge because direct competitors already concentrate heavily on ADU/density analysis.

## Next phase

**Phase 2 — data foundation + one real launch jurisdiction**

Definition of done:
1. Select one launch jurisdiction based on data accessibility + SEO/commercial value.
2. Implement provider interfaces for geocoding, parcel lookup and jurisdiction resolution.
3. Add Postgres/PostGIS schema and migrations.
4. Ingest authoritative parcel/zoning data for the launch jurisdiction.
5. Build the first normalized project-rule set (detached garage first).
6. Replace demo result generation with a source-backed analysis endpoint for supported properties.
7. Keep unsupported properties honest; never fabricate a result.
8. Show exact source/effective/verified metadata in evidence drawers.

## Phase order after that

### Phase 3 — decision-grade report + monetization
- Paid report schema
- Stripe checkout
- Web report
- PDF rendering
- Email delivery
- refund/support workflow

### Phase 4 — SEO publishing engine
- project pillar pages
- launch city × project pages
- jurisdiction/source records
- structured data
- indexation quality gates
- sitemap automation

### Phase 5 — scale projects/geographies
- second/third jurisdiction
- deck/shed/pool/addition rule modules
- source-change monitoring
- admin verification queue

### Phase 6 — professional product
- account/dashboard
- saved properties
- report credits
- batch analysis
- alerts
- team features/API later

## AI session start protocol

Before modifying code:
1. Read this file.
2. Read `ARCHITECTURE.md`.
3. Read `DESIGN_SYSTEM.md`.
4. Inspect files you will modify.
5. State the phase and intended change.
6. Reuse existing components/tokens.
7. Build/test before calling the phase complete.
8. Update this file with completed work and known issues.

## Known risk register

- Direct competitors validate demand but narrow the whitespace. We must remain project-specific and evidence-heavy rather than becoming a generic “what can I build?” clone.
- Data licensing/availability varies by jurisdiction.
- Regulatory interpretation can create liability if certainty is overstated.
- Programmatic SEO can become thin/doorway content unless indexing is gated by unique sourced data.
- Spatial precision can visually overstate certainty; map UX must disclose source/precision.
