# BUILD_STATE.md

## Working product name

`LotAI` — placeholder only. Brand must remain replaceable through `lib/brand.ts`.

## Current phase

**Phase 2 — data foundation IN PROGRESS**

Phase 1 established the visual/product contract. Phase 1.1 tightened the live hero conversion experience without redesigning the established system.

### Phase 1 / 1.1 complete
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
- [x] Railway production deployment
- [x] Railway preview domain: `web-production-7fb2d.up.railway.app`
- [x] Next.js moved to patched 15.5.24 maintenance release after Railway security screening
- [x] Hero/search balance tightened from live screenshot review
- [x] Address field clipping corrected through desktop layout rebalance
- [x] Primary CTA simplified to `Check property`
- [x] Demo-property shortcut added
- [x] Public Coverage page added to expose live/partial/not-yet-supported status
- [ ] Final brand/domain

### Phase 2 progress
- [x] Austin selected as first technical integration proving official municipal GIS can power property identification
- [x] Official City of Austin address-locator provider added
- [x] Official City of Austin TCAD parcel spatial lookup added
- [x] Official City of Austin zoning spatial lookup added
- [x] Official City of Austin jurisdiction spatial lookup added
- [x] Source URLs stored alongside the provider output
- [x] `/api/coverage/austin?address=...` diagnostic endpoint added
- [x] Workspace can show a live Austin property match separately from prototype feasibility conclusions
- [x] Normalized regulatory-rule type contract added
- [x] First Austin detached-garage verified seed rule pack added under `data/rules/austin/`
- [x] Project-detail workflow added for garage width, depth, height, stories, placement and plumbing
- [x] First source-backed Austin rule evaluator added
- [x] Live regulatory facts panel added with direct source links
- [x] Austin permit-exemption threshold logic implemented without converting it into an unsupported permit conclusion
- [x] Austin qualifying SF-1/SF-2/SF-3 low-accessory rear-setback fact implemented
- [x] 2026 garage-placement interpretation deliberately held at manual-review status
- [x] CI build verified after live rule-fact integration
- [x] Railway deployment verified after live rule-fact integration
- [ ] Validate multiple Austin addresses against the deployed endpoint in-browser
- [ ] Confirm exact jurisdiction field mapping from returned GIS attributes
- [ ] Render authoritative parcel polygon on the workspace map
- [ ] Add flood-hazard lookup so the small-structure exemption can resolve that condition
- [ ] Add Postgres/PostGIS schema and migrations
- [ ] Expand detached-garage rules for side/front setbacks, impervious cover, overlays and permit path
- [ ] Replace the overall demo feasibility verdict with a source-backed Austin analysis only when material checks are complete

### Explicitly NOT live yet
- National address autocomplete/geocoding
- Production parcel resolution outside the Austin proof integration
- Production map provider
- Complete detached-garage feasibility engine
- Permit history
- Real overall feasibility/confidence scoring
- Authentication
- Payments
- PDF reports
- Analytics
- Professional dashboard

`lib/demo-data.ts` still supplies the overall feasibility verdict and remaining demonstration checks. Successful Austin GIS matches and sections labeled `Live regulatory facts` are source-backed and intentionally separated from the demo verdict.

## Current V1 project priority

1. Detached garage / workshop
2. Deck
3. Shed / accessory structure
4. Pool
5. Home addition

ADU is intentionally not the primary wedge because direct competitors already concentrate heavily on ADU/density analysis.

## Phase 2 definition of done

1. Confirm launch jurisdiction based on data accessibility + SEO/commercial value; Austin is the current technical proof market, not an irreversible nationwide strategy decision.
2. Implement provider interfaces for geocoding, parcel lookup and jurisdiction resolution.
3. Add PostgreSQL/PostGIS schema and migrations.
4. Ingest or reliably query authoritative parcel/zoning data for the launch jurisdiction.
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
- Dependency audit currently reports non-critical-to-Railway residual advisories; keep dependencies patched and review before adding auth/payments/customer data.
- Direct municipal ArcGIS dependencies can change fields/endpoints; production ingestion needs provider contracts, monitoring, caching and graceful fallback.
