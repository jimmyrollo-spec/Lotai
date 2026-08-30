import { Suspense } from "react";
import Link from "next/link";
import { AddressProjectForm } from "@/components/AddressProjectForm";
import { AustinPermitHistoryPanel } from "@/components/AustinPermitHistoryPanel";
import { LiveAnalysisStatus } from "@/components/LiveAnalysisStatus";
import { LiveRuleFacts } from "@/components/LiveRuleFacts";
import { OfficialParcelGraphic } from "@/components/OfficialParcelGraphic";
import { ProjectDetailsForm } from "@/components/ProjectDetailsForm";
import { SiteHeader } from "@/components/SiteHeader";
import { demoResult, projectDefinitions } from "@/lib/demo-data";
import { lookupAustinProperty } from "@/lib/providers/austin";
import { evaluateAustinGarageFacts, type AustinGarageIntendedUse, type AustinGaragePlacement } from "@/lib/rules/evaluate-austin-garage";

type AnalyzeSearchParams = {
  address?: string;
  project?: string;
  width?: string;
  depth?: string;
  height?: string;
  stories?: string;
  location?: string;
  plumbing?: string;
  intendedUse?: string;
};

function toPositiveNumber(value?: string) {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function normalizeIntendedUse(value?: string): AustinGarageIntendedUse {
  if (value === "workshop_storage" || value === "habitable" || value === "unsure") return value;
  return "vehicle_storage";
}

function normalizePlacement(value?: string): AustinGaragePlacement {
  if (value === "side" || value === "front" || value === "unsure") return value;
  return "rear";
}

function floodLabel(value: boolean | null) {
  if (value === true) return "Mapped intersection";
  if (value === false) return "No mapped intersection";
  return "Unavailable";
}

const liveNextSteps = [
  "Confirm the proposed placement against a current survey, easements and any applicable overlays.",
  "Calculate existing and proposed building / impervious cover against the parcel.",
  "Confirm the complete building and trade-permit path before construction or paid design work begins.",
];

export default async function AnalyzePage({ searchParams }: { searchParams: Promise<AnalyzeSearchParams> }) {
  const params = await searchParams;
  const address = params.address || "Sample property";
  const selectedProject = projectDefinitions.find((item) => item.key === params.project) ?? projectDefinitions[0];
  const liveProperty = address !== "Sample property"
    ? await lookupAustinProperty(address).catch(() => null)
    : null;

  const widthFt = toPositiveNumber(params.width);
  const depthFt = toPositiveNumber(params.depth);
  const heightFt = toPositiveNumber(params.height);
  const stories = toPositiveNumber(params.stories);
  const plumbing = params.plumbing === "yes" || params.plumbing === "unsure" ? params.plumbing : "no";
  const intendedUse = normalizeIntendedUse(params.intendedUse);
  const placement = normalizePlacement(params.location);
  const hasProjectDetails = Boolean(params.width || params.depth || params.height || params.location || params.plumbing || params.intendedUse);

  const liveRuleFacts = liveProperty && selectedProject.key === "garage" && hasProjectDetails
    ? evaluateAustinGarageFacts({
        widthFt,
        depthFt,
        heightFt,
        stories,
        plumbing,
        intendedUse,
        placement,
        baseZoning: liveProperty.zoning.baseDistrict || liveProperty.zoning.zoningType,
        floodIntersectsMappedFloodplain: liveProperty.flood.parcelIntersectsMappedFloodplain,
      })
    : [];

  const jurisdictionDisplay = liveProperty
    ? [liveProperty.jurisdiction.cityName, liveProperty.jurisdiction.label || liveProperty.jurisdiction.typeSpecifics || liveProperty.jurisdiction.type]
        .filter(Boolean)
        .join(" · ") || "Austin-area match"
    : null;

  return (
    <main className="workspace-page">
      <SiteHeader />
      <section className="workspace-utility">
        <div className="shell">
          <AddressProjectForm compact />
        </div>
      </section>

      <section className="workspace-shell shell">
        <div className="workspace-header">
          <div>
            <Link href="/" className="back-link">← Back to overview</Link>
            <span className="workspace-header__label">
              {liveProperty ? "Official property match · source-backed beta" : "Prototype feasibility workspace"}
            </span>
            <h1>{liveProperty?.matchedAddress || address}</h1>
            <p>{selectedProject.label} · {selectedProject.example}</p>
          </div>
          <div className="workspace-header__actions">
            <button className="button button--secondary" type="button">Save</button>
            <button className="button button--secondary" type="button">Share</button>
          </div>
        </div>

        <div className="prototype-alert">
          <strong>{liveProperty ? "Source-backed beta · no overall verdict yet" : "Prototype mode"}</strong>
          <span>
            {liveProperty
              ? "The property match, parcel boundary, mapped building footprints, flood screening, permit history and Live regulatory facts are source-backed Austin data. We deliberately withhold an overall feasibility verdict until the remaining material checks are implemented."
              : "This screen demonstrates the product experience. Parcel, zoning and regulatory data below are sample data and must not be used for a real-world decision."}
          </span>
        </div>

        {liveProperty && (
          <section className="live-property-card" aria-label="Live official property match">
            <div className="live-property-card__lead">
              <span className="live-property-card__eyebrow">Live official property data</span>
              <strong>{liveProperty.matchedAddress}</strong>
              <p className="live-property-card__note">
                Matched through the City of Austin address locator at {Math.round(liveProperty.matchScore)}% confidence. {" "}
                <a href={liveProperty.sources.propertyProfile} target="_blank" rel="noreferrer">Open City Property Profile ↗</a>
              </p>
            </div>
            <div className="live-property-card__fact">
              <span>Zoning</span>
              <strong>{liveProperty.zoning.zoningType || liveProperty.zoning.baseDistrict || "Not returned"}</strong>
            </div>
            <div className="live-property-card__fact">
              <span>Parcel ID</span>
              <strong>{liveProperty.parcel.parcelId || "Not returned"}</strong>
            </div>
            <div className="live-property-card__fact">
              <span>Jurisdiction</span>
              <strong>{jurisdictionDisplay}</strong>
            </div>
          </section>
        )}

        <ProjectDetailsForm
          address={address}
          project={selectedProject.key}
          initial={{
            width: params.width,
            depth: params.depth,
            height: params.height,
            stories: params.stories,
            location: params.location,
            plumbing: params.plumbing,
            intendedUse: params.intendedUse,
          }}
        />

        <div className="results-grid">
          <section className="results-main">
            {liveProperty ? (
              <>
                <LiveAnalysisStatus facts={liveRuleFacts} hasProjectDetails={hasProjectDetails} />
                {liveRuleFacts.length > 0 && <LiveRuleFacts facts={liveRuleFacts} />}
              </>
            ) : (
              <article className="result-hero-card">
                <div className="result-hero-card__verdict">
                  <span className="result-hero-card__eyebrow">Prototype feasibility</span>
                  <div className="result-hero-card__statusline">
                    <span className="status-orb" aria-hidden="true" />
                    <h2>{demoResult.status}</h2>
                  </div>
                  <p>Based on the project assumptions and the demonstration rule set, the major dimensional checks appear to pass.</p>
                </div>
                <div className="result-hero-card__confidence">
                  <span>Prototype confidence</span>
                  <strong>{demoResult.confidence}<small>/100</small></strong>
                  <div className="confidence-bar confidence-bar--large"><span style={{ width: `${demoResult.confidence}%` }} /></div>
                  <em>2 items still require verification</em>
                </div>
              </article>
            )}

            {liveProperty?.parcel.geometry ? (
              <article className="result-section-card result-map-card">
                <div className="result-section-card__header">
                  <div>
                    <span className="card-kicker">Official spatial data · parcel-level</span>
                    <h3>Property boundary, mapped structures and flood screening</h3>
                  </div>
                  <span className="evidence-count">City of Austin GIS</span>
                </div>
                <OfficialParcelGraphic
                  geometry={liveProperty.parcel.geometry}
                  location={liveProperty.location}
                  floodIntersects={liveProperty.flood.parcelIntersectsMappedFloodplain}
                  buildingFootprints={liveProperty.structures.buildingFootprints}
                />
                <p className="map-disclaimer">
                  Parcel geometry comes from the City of Austin TCAD parcel layer. Building footprints come from the City&apos;s 2023 planimetric survey. Flood screening tests the full parcel against the City FEMA and fully-developed floodplain layers. None of these layers alone establish a legal survey boundary or proposed-project placement.
                </p>
              </article>
            ) : !liveProperty ? (
              <article className="result-section-card result-map-card">
                <div className="result-section-card__header">
                  <div><span className="card-kicker">Site analysis · demo geometry</span><h3>Indicative buildable area</h3></div>
                  <div className="map-tabs"><button className="map-tab map-tab--active">Parcel</button><button className="map-tab">Zoning</button><button className="map-tab">Constraints</button></div>
                </div>
                <div className="site-plan site-plan--large">
                  <div className="site-plan__north">N</div>
                  <div className="site-plan__road">STREET</div>
                  <div className="site-plan__parcel">
                    <div className="site-plan__buildable" />
                    <div className="site-plan__house">EXISTING HOME</div>
                    <div className="site-plan__project"><span>PROPOSED</span><strong>{selectedProject.shortLabel.toUpperCase()}</strong></div>
                    <span className="site-plan__measure site-plan__measure--rear">5′ setback</span>
                    <span className="site-plan__measure site-plan__measure--side">5′ setback</span>
                  </div>
                  <div className="site-plan__legend">
                    <span><i className="legend-box legend-box--parcel" /> Parcel</span>
                    <span><i className="legend-box legend-box--buildable" /> Indicative buildable area</span>
                    <span><i className="legend-box legend-box--project" /> Proposed project</span>
                  </div>
                </div>
                <p className="map-disclaimer">Illustrative geometry only in prototype mode. Production geometry must come from authoritative or licensed parcel/spatial sources.</p>
              </article>
            ) : (
              <article className="result-section-card">
                <div className="result-section-card__header">
                  <div><span className="card-kicker">Official spatial data</span><h3>Parcel geometry unavailable</h3></div>
                </div>
                <div className="constraint-list"><div className="constraint-item"><span>01</span><p>The address matched, but the parcel polygon was not returned. Spatial conclusions remain unresolved rather than falling back to illustrative geometry.</p></div></div>
              </article>
            )}

            {liveProperty?.parcel.parcelId && (
              <Suspense fallback={(
                <article className="result-section-card">
                  <div className="result-section-card__header">
                    <div><span className="card-kicker">Official permit history</span><h3>Loading TCAD-matched permit records…</h3></div>
                  </div>
                </article>
              )}>
                <AustinPermitHistoryPanel tcadId={liveProperty.parcel.parcelId} />
              </Suspense>
            )}

            {!liveProperty && (
              <>
                <article className="result-section-card">
                  <div className="result-section-card__header">
                    <div><span className="card-kicker">Prototype rule checks</span><h3>Remaining demonstration checks</h3></div>
                    <span className="evidence-count">6 demo checks</span>
                  </div>
                  <div className="rule-table">
                    {demoResult.checks.map((check) => (
                      <div className="rule-row" key={check.label}>
                        <span className={`rule-dot rule-dot--${check.tone}`} aria-hidden="true" />
                        <span className="rule-row__label">{check.label}</span>
                        <strong>{check.value}</strong>
                        <button type="button">Evidence</button>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="result-section-card">
                  <div className="result-section-card__header"><div><span className="card-kicker">Verification</span><h3>Items that could still change the answer</h3></div></div>
                  <div className="constraint-list">
                    {demoResult.constraints.map((item, index) => (
                      <div className="constraint-item" key={item}><span>0{index + 1}</span><p>{item}</p></div>
                    ))}
                  </div>
                </article>
              </>
            )}
          </section>

          <aside className="results-aside">
            <article className="aside-card aside-card--property">
              <div className="card-kicker">{liveProperty ? "Official property snapshot" : "Prototype property snapshot"}</div>
              {liveProperty ? (
                <dl className="property-facts">
                  <div><dt>Parcel ID</dt><dd>{liveProperty.parcel.parcelId || "Unavailable"}</dd></div>
                  <div><dt>Property ID</dt><dd>{liveProperty.parcel.propertyId || "Unavailable"}</dd></div>
                  <div><dt>Zoning</dt><dd>{liveProperty.zoning.zoningType || liveProperty.zoning.baseDistrict || "Unavailable"}</dd></div>
                  <div><dt>Jurisdiction</dt><dd>{jurisdictionDisplay}</dd></div>
                  <div><dt>Mapped buildings</dt><dd>{liveProperty.structures.buildingCount} · 2023</dd></div>
                  <div><dt>Impervious features</dt><dd>{liveProperty.impervious.featureCount} detected · no % yet</dd></div>
                  <div><dt>Flood scan</dt><dd>{floodLabel(liveProperty.flood.parcelIntersectsMappedFloodplain)}</dd></div>
                  <div><dt>Permit history</dt><dd>{liveProperty.parcel.parcelId ? "TCAD-matched · live" : "Unavailable"}</dd></div>
                  <div><dt>Address match</dt><dd>{Math.round(liveProperty.matchScore)}%</dd></div>
                </dl>
              ) : (
                <dl className="property-facts">
                  <div><dt>Lot area</dt><dd>{demoResult.parcel.lotArea}</dd></div>
                  <div><dt>Frontage</dt><dd>{demoResult.parcel.frontage}</dd></div>
                  <div><dt>Depth</dt><dd>{demoResult.parcel.depth}</dd></div>
                  <div><dt>Zoning</dt><dd>{demoResult.parcel.zoning}</dd></div>
                  <div><dt>Jurisdiction</dt><dd>{demoResult.parcel.jurisdiction}</dd></div>
                </dl>
              )}
            </article>

            <article className="aside-card aside-card--next">
              <div className="card-kicker">Next steps</div>
              <h3>{liveProperty ? "What still needs to be resolved" : "What to verify before committing money"}</h3>
              <ol className="next-list">
                {(liveProperty ? liveNextSteps : demoResult.nextSteps).map((step) => <li key={step}>{step}</li>)}
              </ol>
            </article>

            <article className="aside-card aside-card--report">
              <span className="report-badge">PLANNED PAID PRODUCT</span>
              <h3>Decision-grade property report</h3>
              <p>Deeper source evidence, rule citations, project assumptions, constraint review and a printable planning summary.</p>
              <button type="button" className="button button--primary button--full" disabled>Report checkout coming later</button>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
}
