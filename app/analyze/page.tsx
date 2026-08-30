import Link from "next/link";
import { AddressProjectForm } from "@/components/AddressProjectForm";
import { SiteHeader } from "@/components/SiteHeader";
import { demoResult, projectDefinitions } from "@/lib/demo-data";

export default async function AnalyzePage({ searchParams }: { searchParams: Promise<{ address?: string; project?: string }> }) {
  const params = await searchParams;
  const address = params.address || "Sample property";
  const selectedProject = projectDefinitions.find((item) => item.key === params.project) ?? projectDefinitions[0];

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
            <span className="workspace-header__label">Prototype feasibility workspace</span>
            <h1>{address}</h1>
            <p>{selectedProject.label} · {selectedProject.example}</p>
          </div>
          <div className="workspace-header__actions">
            <button className="button button--secondary" type="button">Save</button>
            <button className="button button--secondary" type="button">Share</button>
          </div>
        </div>

        <div className="prototype-alert">
          <strong>Prototype mode</strong>
          <span>This screen demonstrates the product experience. Parcel, zoning and regulatory data below are sample data and must not be used for a real-world decision.</span>
        </div>

        <div className="results-grid">
          <section className="results-main">
            <article className="result-hero-card">
              <div className="result-hero-card__verdict">
                <span className="result-hero-card__eyebrow">Initial feasibility</span>
                <div className="result-hero-card__statusline">
                  <span className="status-orb" aria-hidden="true" />
                  <h2>{demoResult.status}</h2>
                </div>
                <p>Based on the project assumptions and the demonstration rule set, the major dimensional checks appear to pass.</p>
              </div>
              <div className="result-hero-card__confidence">
                <span>Confidence</span>
                <strong>{demoResult.confidence}<small>/100</small></strong>
                <div className="confidence-bar confidence-bar--large"><span style={{ width: `${demoResult.confidence}%` }} /></div>
                <em>2 items still require verification</em>
              </div>
            </article>

            <article className="result-section-card result-map-card">
              <div className="result-section-card__header">
                <div><span className="card-kicker">Site analysis</span><h3>Indicative buildable area</h3></div>
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

            <article className="result-section-card">
              <div className="result-section-card__header">
                <div><span className="card-kicker">Rule checks</span><h3>What appears to matter for this project</h3></div>
                <span className="evidence-count">6 checks</span>
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
          </section>

          <aside className="results-aside">
            <article className="aside-card aside-card--property">
              <div className="card-kicker">Property snapshot</div>
              <dl className="property-facts">
                <div><dt>Lot area</dt><dd>{demoResult.parcel.lotArea}</dd></div>
                <div><dt>Frontage</dt><dd>{demoResult.parcel.frontage}</dd></div>
                <div><dt>Depth</dt><dd>{demoResult.parcel.depth}</dd></div>
                <div><dt>Zoning</dt><dd>{demoResult.parcel.zoning}</dd></div>
                <div><dt>Jurisdiction</dt><dd>{demoResult.parcel.jurisdiction}</dd></div>
              </dl>
            </article>

            <article className="aside-card aside-card--next">
              <div className="card-kicker">Next steps</div>
              <h3>What to verify before committing money</h3>
              <ol className="next-list">
                {demoResult.nextSteps.map((step) => <li key={step}>{step}</li>)}
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
