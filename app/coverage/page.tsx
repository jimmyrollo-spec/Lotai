import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { austinSourceLinks } from "@/lib/providers/austin";
import { austinPermitSource } from "@/lib/providers/austin-permits";

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
                Austin, Texas is the first technical proof market. Live Austin properties now use official address, parcel, zoning, jurisdiction, flood and permit data plus parcel-clipped mapped coverage calculations. The system still deliberately withholds an overall project verdict until placement, overlays and the complete future-project permit path are resolved.
              </p>
              <table className="method-table">
                <thead><tr><th>Market</th><th>Property data</th><th>Project rules</th><th>Feasibility</th></tr></thead>
                <tbody>
                  <tr><td>Austin, TX</td><td>Live beta + parcel / coverage / flood / permits</td><td>Verified garage rules + derived checks</td><td>Verdict withheld pending placement / remaining constraints</td></tr>
                  <tr><td>Other U.S. markets</td><td>Not yet supported</td><td>Not yet supported</td><td>Not yet supported</td></tr>
                </tbody>
              </table>
            </section>

            <section id="austin">
              <h2>2. Austin live-data beta</h2>
              <p>
                An Austin address is matched through the City address locator and then resolved against official City GIS and Development Services data. The product distinguishes raw official facts from calculations derived from those mapped sources.
              </p>
              <ul>
                <li>Official address match and match score</li>
                <li>TCAD parcel identifier, official mapped parcel polygon and derived geodesic parcel area</li>
                <li>Mapped zoning classification and jurisdiction</li>
                <li>2023 building polygons clipped to the parcel and converted into mapped existing-building area / coverage</li>
                <li>2023 impervious polygons clipped and unioned within the parcel for mapped existing impervious area / coverage</li>
                <li>Parcel-level intersection screening against FEMA and fully-developed Austin floodplain layers</li>
                <li>TCAD-matched issued construction permit history from Austin Development Services&apos; daily public dataset</li>
              </ul>
              <p>
                The building and impervious percentages are derived screening calculations, not legal survey values or an official City development-review determination. Source vintage and differences between mapped geometry and regulatory definitions remain visible limitations.
              </p>
              <p>
                <Link className="text-link" href="/#analyze">Try an Austin property <span>→</span></Link>
              </p>
            </section>

            <section id="projects">
              <h2>3. Project-rule coverage</h2>
              <p>
                Detached garage / workshop is the first rule module. The Austin beta applies supplied project dimensions, stories, plumbing, intended use and broad placement to verified source records. It can now compare a proposed garage footprint with mapped building-cover conditions while treating impervious cover as a scenario until the exact project footprint is located against existing impervious surfaces.
              </p>
              <table className="method-table">
                <thead><tr><th>Project</th><th>Austin rule status</th><th>Automation status</th></tr></thead>
                <tbody>
                  <tr><td>Detached garage / workshop</td><td>Core seed rules + mapped coverage checks live</td><td>Partial — source-backed facts, final verdict withheld</td></tr>
                  <tr><td>Deck</td><td>Research pending</td><td>Not live</td></tr>
                  <tr><td>Shed / accessory structure</td><td>Research pending</td><td>Not live</td></tr>
                  <tr><td>Pool</td><td>Research pending</td><td>Not live</td></tr>
                  <tr><td>Home addition</td><td>Research pending</td><td>Not live</td></tr>
                </tbody>
              </table>
            </section>

            <section id="sources">
              <h2>4. Austin source systems</h2>
              <p>These are the principal official systems currently used by the Austin beta.</p>
              <ul>
                <li><a className="text-link" href={austinSourceLinks.propertyProfile} target="_blank" rel="noreferrer">City of Austin Property Profile overview ↗</a></li>
                <li><a className="text-link" href={austinSourceLinks.geocoder} target="_blank" rel="noreferrer">City of Austin address locator service ↗</a></li>
                <li><a className="text-link" href={austinSourceLinks.parcels} target="_blank" rel="noreferrer">City of Austin appraisal parcel layer ↗</a></li>
                <li><a className="text-link" href={austinSourceLinks.zoning} target="_blank" rel="noreferrer">City of Austin zoning layer ↗</a></li>
                <li><a className="text-link" href={austinSourceLinks.jurisdiction} target="_blank" rel="noreferrer">City of Austin jurisdiction layer ↗</a></li>
                <li><a className="text-link" href={austinSourceLinks.buildingFootprints2023} target="_blank" rel="noreferrer">City of Austin 2023 building-footprint layer ↗</a></li>
                <li><a className="text-link" href={austinSourceLinks.imperviousCover2023} target="_blank" rel="noreferrer">City of Austin 2023 impervious-cover layer ↗</a></li>
                <li><a className="text-link" href={austinSourceLinks.geometryServer} target="_blank" rel="noreferrer">City of Austin GeometryServer ↗</a></li>
                <li><a className="text-link" href={austinSourceLinks.femaFloodplain} target="_blank" rel="noreferrer">City of Austin FEMA floodplain layer ↗</a></li>
                <li><a className="text-link" href={austinSourceLinks.fullyDevelopedFloodplain} target="_blank" rel="noreferrer">City of Austin fully-developed floodplain layer ↗</a></li>
                <li><a className="text-link" href={austinPermitSource.dataset} target="_blank" rel="noreferrer">Austin Development Services Issued Construction Permits ↗</a></li>
              </ul>
            </section>

            <section id="meaning">
              <h2>5. “Supported” is a high bar.</h2>
              <p>
                A market should only be called fully supported after the platform can resolve the property and jurisdiction, apply the relevant project rules, identify material mapped constraints, expose current source evidence and surface unresolved conditions instead of guessing.
              </p>
              <p>
                Address recognition alone is not coverage. A zoning code alone is not coverage. The target is a decision-support result with enough evidence to explain why the system reached its conclusion. When the evidence is incomplete, the correct product behavior is to withhold the verdict.
              </p>
            </section>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
