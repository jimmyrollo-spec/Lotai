import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { austinSourceLinks } from "@/lib/providers/austin";

export default function CoveragePage() {
  return (
    <main>
      <SiteHeader />
      <section className="content-hero">
        <div className="shell">
          <div className="eyebrow eyebrow--accent">Coverage</div>
          <h1>We show what is live, what is partial and what still needs work.</h1>
          <p>
            Property intelligence is only useful when its coverage is explicit. A location is not marked supported simply because an address can be found. Parcel, zoning, project rules, constraints and source freshness are tracked separately.
          </p>
        </div>
      </section>

      <section className="content-page">
        <div className="shell content-grid">
          <aside className="content-toc">
            <strong>On this page</strong>
            <a href="#current">Current coverage</a>
            <a href="#austin">Austin beta</a>
            <a href="#projects">Project coverage</a>
            <a href="#sources">Source systems</a>
            <a href="#meaning">What supported means</a>
          </aside>

          <div className="prose">
            <section id="current">
              <h2>1. Current coverage status</h2>
              <p>
                The product is in an early data-integration phase. The public interface is production-built, but regulatory feasibility is not yet nationally live. Austin, Texas is the first technical proof market for direct official municipal GIS integration.
              </p>
              <table className="method-table">
                <thead><tr><th>Market</th><th>Property data</th><th>Project rules</th><th>Feasibility</th></tr></thead>
                <tbody>
                  <tr><td>Austin, TX</td><td>Live beta</td><td>Verified seed — garage</td><td>Prototype</td></tr>
                  <tr><td>Other U.S. markets</td><td>Not yet supported</td><td>Not yet supported</td><td>Not yet supported</td></tr>
                </tbody>
              </table>
            </section>

            <section id="austin">
              <h2>2. Austin live-data beta</h2>
              <p>
                An Austin address can now be matched through the City of Austin address locator. The system then performs spatial queries against official City GIS layers for appraisal parcels, zoning and jurisdiction. These property facts are kept separate from the prototype feasibility rule set.
              </p>
              <ul>
                <li>Official address match and match score</li>
                <li>TCAD parcel identifier when returned by the mapped parcel layer</li>
                <li>Mapped zoning classification when returned by the zoning layer</li>
                <li>Mapped jurisdiction when returned by the jurisdiction layer</li>
              </ul>
              <p>
                <Link className="text-link" href="/#analyze">Try an Austin property <span>→</span></Link>
              </p>
            </section>

            <section id="projects">
              <h2>3. Project-rule coverage</h2>
              <p>
                Detached garage / workshop is the first rule module. The initial Austin rule pack records current sources for residential accessory-garage use, the detached-accessory-structure building-permit exemption, the five-foot rear-setback exception for qualifying low accessory buildings in SF-1/SF-2/SF-3, and a 2026 garage-placement interpretation that remains flagged for manual review.
              </p>
              <table className="method-table">
                <thead><tr><th>Project</th><th>Austin rule status</th><th>Automation status</th></tr></thead>
                <tbody>
                  <tr><td>Detached garage / workshop</td><td>Seed rules verified</td><td>Partial — not yet a live verdict</td></tr>
                  <tr><td>Deck</td><td>Research pending</td><td>Not live</td></tr>
                  <tr><td>Shed / accessory structure</td><td>Research pending</td><td>Not live</td></tr>
                  <tr><td>Pool</td><td>Research pending</td><td>Not live</td></tr>
                  <tr><td>Home addition</td><td>Research pending</td><td>Not live</td></tr>
                </tbody>
              </table>
            </section>

            <section id="sources">
              <h2>4. Austin source systems</h2>
              <p>These are the current official source systems behind the Austin property-data proof integration.</p>
              <ul>
                <li><a className="text-link" href={austinSourceLinks.propertyProfile} target="_blank" rel="noreferrer">City of Austin Property Profile overview ↗</a></li>
                <li><a className="text-link" href={austinSourceLinks.geocoder} target="_blank" rel="noreferrer">City of Austin address locator service ↗</a></li>
                <li><a className="text-link" href={austinSourceLinks.parcels} target="_blank" rel="noreferrer">City of Austin appraisal parcel layer ↗</a></li>
                <li><a className="text-link" href={austinSourceLinks.zoning} target="_blank" rel="noreferrer">City of Austin zoning layer ↗</a></li>
                <li><a className="text-link" href={austinSourceLinks.jurisdiction} target="_blank" rel="noreferrer">City of Austin jurisdiction layer ↗</a></li>
              </ul>
            </section>

            <section id="meaning">
              <h2>5. “Supported” is a high bar.</h2>
              <p>
                A future market should only be called fully supported after the platform can resolve the property and jurisdiction, apply the relevant project rules, identify material mapped constraints, expose current source evidence and surface unresolved conditions instead of guessing.
              </p>
              <p>
                Address recognition alone is not coverage. A zoning code alone is not coverage. The target is a decision-support result with enough evidence to explain why the system reached its conclusion.
              </p>
            </section>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
