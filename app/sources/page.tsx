import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { austinSourceLinks } from "@/lib/providers/austin";
import { austinGeometrySource } from "@/lib/providers/austin-geometry";
import { austinPermitSource } from "@/lib/providers/austin-permits";
import styles from "./sources.module.css";

const sourceRows = [
  {
    name: "Address locator",
    authority: "City of Austin",
    use: "Address matching and map point",
    freshness: "Live service · queried on demand",
    status: "Live beta",
    url: austinSourceLinks.geocoder,
  },
  {
    name: "Appraisal parcel layer",
    authority: "City of Austin / appraisal districts",
    use: "Parcel identifier and polygon geometry",
    freshness: "Live service · queried on demand",
    status: "Live beta",
    url: austinSourceLinks.parcels,
  },
  {
    name: "Zoning layer",
    authority: "City of Austin",
    use: "Mapped zoning classification",
    freshness: "Live service · queried on demand",
    status: "Live beta",
    url: austinSourceLinks.zoning,
  },
  {
    name: "Jurisdiction layer",
    authority: "City of Austin",
    use: "City / jurisdiction status",
    freshness: "Live service · queried on demand",
    status: "Live beta",
    url: austinSourceLinks.jurisdiction,
  },
  {
    name: "Building Footprints 2023",
    authority: "City of Austin",
    use: "Mapped existing building footprints and derived parcel building-coverage screening",
    freshness: "2023 planimetric survey",
    status: "Live derived evidence",
    url: austinSourceLinks.buildingFootprints2023,
  },
  {
    name: "Impervious Cover 2023",
    authority: "City of Austin",
    use: "Mapped impervious polygons and derived parcel impervious-cover screening",
    freshness: "2023 planimetric survey",
    status: "Live derived evidence",
    url: austinSourceLinks.imperviousCover2023,
  },
  {
    name: "ArcGIS GeometryServer",
    authority: austinGeometrySource.authority,
    use: "Parcel clipping, polygon union and geodesic square-foot area calculations on mapped source geometry",
    freshness: "Live City calculation service",
    status: "Live calculation layer",
    url: austinSourceLinks.geometryServer,
  },
  {
    name: "FEMA Floodplain",
    authority: "City of Austin GIS",
    use: "Parcel-level mapped floodplain intersection screening",
    freshness: "Live service · queried on demand",
    status: "Live beta",
    url: austinSourceLinks.femaFloodplain,
  },
  {
    name: "Fully Developed Floodplain",
    authority: "City of Austin GIS",
    use: "Parcel-level fully-developed floodplain intersection screening",
    freshness: "Live service · queried on demand",
    status: "Live beta",
    url: austinSourceLinks.fullyDevelopedFloodplain,
  },
  {
    name: "Issued Construction Permits",
    authority: austinPermitSource.authority,
    use: "TCAD-matched issued building, electrical, mechanical, plumbing and related permit history",
    freshness: `${austinPermitSource.updateFrequency} public dataset`,
    status: "Live beta",
    url: austinPermitSource.dataset,
  },
];

export default function SourcesPage() {
  return (
    <main>
      <SiteHeader />
      <section className="content-hero">
        <div className="shell">
          <div className="eyebrow eyebrow--accent">Source registry</div>
          <h1>The evidence should be inspectable before the conclusion is trusted.</h1>
          <p>
            This registry lists the authoritative systems currently used by the product, what each source is allowed to support, and where the data still has limitations. A source being available does not make every conclusion derived from it automatic.
          </p>
        </div>
      </section>

      <section className="content-page">
        <div className="shell content-grid">
          <aside className="content-toc">
            <strong>On this page</strong>
            <a href="#principles">Source principles</a>
            <a href="#austin">Austin registry</a>
            <a href="#regulatory">Regulatory evidence</a>
            <a href="#freshness">Freshness policy</a>
          </aside>

          <div className="prose">
            <section id="principles">
              <h2>1. Official first, derived second.</h2>
              <p>
                Property and regulatory facts should come from the governing or authoritative source whenever reasonably available. Derived calculations are useful, but they must remain distinguishable from the underlying source evidence and retain enough metadata to reproduce the conclusion.
              </p>
            </section>

            <section id="austin">
              <h2>2. Austin property and spatial sources</h2>
              <div className={styles.registry}>
                {sourceRows.map((source) => (
                  <article className={styles.row} key={source.name}>
                    <div>
                      <span className="card-kicker">{source.authority}</span>
                      <h3>{source.name}</h3>
                      <p>{source.use}</p>
                    </div>
                    <div className={styles.meta}>
                      <span>{source.status}</span>
                      <span>{source.freshness}</span>
                      <a href={source.url} target="_blank" rel="noreferrer">Open official source ↗</a>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section id="regulatory">
              <h2>3. Austin detached-garage regulatory evidence</h2>
              <p>
                The first rule module uses the City&apos;s current work-exempt guidance, the Austin Land Development Code and the City&apos;s Code Interpretation Library. Rule records are versioned separately from UI copy so a future source change can be reviewed once and propagated through property analyses, reports and SEO content.
              </p>
              <table className="method-table">
                <thead><tr><th>Evidence</th><th>Current use</th><th>Automation</th></tr></thead>
                <tbody>
                  <tr><td>Work Exempt from Building Permits</td><td>Small detached-accessory building exemption conditions</td><td>Partial / source-backed</td></tr>
                  <tr><td>LDC § 25-2-492</td><td>SF-1/SF-2/SF-3 base setbacks and building / impervious-cover limits</td><td>Rules live; mapped coverage screening live</td></tr>
                  <tr><td>LDC §§ 25-2-553 through 25-2-555</td><td>Qualifying low accessory-building rear setback in SF-1/SF-2/SF-3</td><td>Source-backed where inputs resolve</td></tr>
                  <tr><td>Garage placement rule + CI2026-0001</td><td>Front-façade / parking-structure placement</td><td>Rule known; site orientation geometry still needed</td></tr>
                  <tr><td>Issued Construction Permits</td><td>TCAD-matched property permit history</td><td>Live beta</td></tr>
                  <tr><td>Residential permit guidance</td><td>Future-project building / trade permit path</td><td>Not complete</td></tr>
                </tbody>
              </table>
            </section>

            <section id="freshness">
              <h2>4. Freshness is part of the answer.</h2>
              <p>
                Every material production rule should retain its source, exact locator where practical, effective date when known, last verification date, confidence and superseded status. GIS layers also need source vintage or fetch timestamps. Data that cannot be dated or verified should not silently receive the same confidence as current official records.
              </p>
              <p>
                The Austin live provider queries official GIS services on demand and records the fetch time in the result object. The 2023 building and impervious layers remain explicitly labeled with their survey vintage. Their mapped polygons are clipped to the parcel, unioned and measured through the City GeometryServer before a coverage percentage is shown. Permit history is queried from Austin Development Services&apos; daily public issued-permits dataset.
              </p>
            </section>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
