import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function MethodologyPage() {
  return (
    <main>
      <SiteHeader />
      <section className="content-hero">
        <div className="shell">
          <div className="eyebrow eyebrow--accent">Methodology</div>
          <h1>Every useful answer needs an evidence trail.</h1>
          <p>
            The production system is being designed to separate authoritative source data, derived property facts, rule interpretation and unresolved uncertainty. This page defines how feasibility conclusions should be produced and communicated.
          </p>
        </div>
      </section>

      <section className="content-page">
        <div className="shell content-grid">
          <aside className="content-toc">
            <strong>On this page</strong>
            <a href="#source-hierarchy">Source hierarchy</a>
            <a href="#rule-records">Rule records</a>
            <a href="#confidence">Confidence</a>
            <a href="#limitations">Limitations</a>
            <a href="#corrections">Corrections</a>
          </aside>

          <div className="prose">
            <section id="source-hierarchy">
              <h2>1. Source hierarchy</h2>
              <p>
                Material regulatory conclusions should originate from the most authoritative source reasonably available for the property and project. Aggregators may help discover information, but they should not silently replace the governing source.
              </p>
              <table className="method-table">
                <thead><tr><th>Priority</th><th>Source class</th><th>Typical use</th></tr></thead>
                <tbody>
                  <tr><td>1</td><td>Adopted municipal / county / state code</td><td>Permitted uses, dimensional rules, exceptions</td></tr>
                  <tr><td>2</td><td>Official GIS / parcel / assessor data</td><td>Parcel geometry, jurisdiction, zoning, assessed facts</td></tr>
                  <tr><td>3</td><td>Official permit portals / published guidance</td><td>Permit history, application path, procedural requirements</td></tr>
                  <tr><td>4</td><td>Authoritative hazard / overlay datasets</td><td>Flood, fire, historic and other mapped constraints</td></tr>
                  <tr><td>5</td><td>Derived calculations</td><td>Coverage, indicative envelope, project-fit tests</td></tr>
                </tbody>
              </table>
            </section>

            <section id="rule-records">
              <h2>2. Rules are versioned records, not hard-coded copy.</h2>
              <p>Each normalized rule should retain enough metadata to reconstruct why it was applied to a property.</p>
              <ul>
                <li>Jurisdiction and project type</li>
                <li>Rule category, value and unit</li>
                <li>Applicability conditions and exceptions</li>
                <li>Official source URL or document reference</li>
                <li>Effective date and superseded status where known</li>
                <li>Last verified date and verification method</li>
                <li>Confidence level and review notes</li>
              </ul>
            </section>

            <section id="confidence">
              <h2>3. Confidence is separate from feasibility.</h2>
              <p>
                A project can appear feasible while confidence remains medium because an easement layer, special overlay or ambiguous code exception still needs confirmation. The interface should never collapse these into one green/red status.
              </p>
              <h3>High confidence</h3>
              <p>Core property facts and project rules are resolved from current authoritative sources with no known material conflicts.</p>
              <h3>Medium confidence</h3>
              <p>Major rules appear resolved, but one or more site conditions, source freshness questions or exception paths need verification.</p>
              <h3>Review required</h3>
              <p>The system cannot responsibly automate the conclusion. The unresolved item should be shown plainly rather than guessed.</p>
            </section>

            <section id="limitations">
              <h2>4. The product is decision support, not a permit.</h2>
              <p>
                A feasibility check is informational. Final approval depends on the authority having jurisdiction and may require a survey, plan review, engineering, architectural work, utility confirmation, HOA review or other professional services. Production copy should be precise without pretending the platform can grant legal or permitting certainty.
              </p>
            </section>

            <section id="corrections">
              <h2>5. Corrections become part of the data operation.</h2>
              <p>
                Every production result should provide a path to report a potentially incorrect parcel fact, stale rule or source conflict. Corrections should be logged, reviewed, source-verified and propagated to affected property and SEO outputs through the same normalized rule layer.
              </p>
            </section>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
