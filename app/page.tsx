import Link from "next/link";
import { AddressProjectForm } from "@/components/AddressProjectForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { projectDefinitions } from "@/lib/demo-data";

const signalRows = [
  ["Zoning & use", "Does the project type appear allowed here?"],
  ["Buildable envelope", "Where setbacks and site constraints leave room."],
  ["Lot coverage", "Whether the project appears to fit dimensional limits."],
  ["Permit path", "What approvals are likely required before construction."],
  ["Evidence", "Which source supports each material conclusion."],
];

export default function HomePage() {
  return (
    <main>
      <SiteHeader />

      <section className="hero" id="analyze">
        <div className="hero__ambient" aria-hidden="true" />
        <div className="shell hero__grid">
          <div className="hero__copy">
            <div className="eyebrow eyebrow--accent">Property project intelligence</div>
            <h1>Know what you can build <span>before you spend.</span></h1>
            <p className="hero__lede">
              Enter an address and the project you have in mind. We turn parcel facts, local rules and site constraints into a clear, source-backed feasibility check.
            </p>
            <div className="hero__proof-line">
              <span>Project-specific</span>
              <span>Source-backed</span>
              <span>Property-level</span>
            </div>
          </div>

          <div className="hero__panel">
            <div className="hero__panel-topline">
              <span>Start a project check</span>
              <span className="system-state"><i /> Prototype mode</span>
            </div>
            <AddressProjectForm />
          </div>
        </div>

        <div className="shell trust-strip">
          <span className="trust-strip__label">Designed to evaluate</span>
          <span>Parcel</span><span>Zoning</span><span>Setbacks</span><span>Coverage</span><span>Permits</span><span>Constraints</span><span>Official sources</span>
        </div>
      </section>

      <section className="section section--light" id="how-it-works">
        <div className="shell">
          <div className="section-heading section-heading--split">
            <div>
              <div className="eyebrow">A decision, not a document dump</div>
              <h2>From address to a defensible next step.</h2>
            </div>
            <p>
              Municipal sites tell you where the rules live. Our job is to connect the property, the proposed project and the evidence required to make a useful first decision.
            </p>
          </div>

          <div className="workflow-grid">
            <article className="workflow-card">
              <span className="workflow-card__number">01</span>
              <h3>Identify the property</h3>
              <p>Resolve parcel, jurisdiction and the location-specific facts that determine which rules apply.</p>
            </article>
            <article className="workflow-card workflow-card--featured">
              <span className="workflow-card__number">02</span>
              <h3>Define the project</h3>
              <p>Check the actual garage, deck, pool, shed or addition you want—not an abstract zoning score.</p>
            </article>
            <article className="workflow-card">
              <span className="workflow-card__number">03</span>
              <h3>Explain the answer</h3>
              <p>Show what appears feasible, what could block it, what remains uncertain and where each conclusion came from.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--ink">
        <div className="shell intelligence-grid">
          <div className="intelligence-copy">
            <div className="eyebrow eyebrow--muted">The flagship experience</div>
            <h2>See the site, the rules and the reasons in one workspace.</h2>
            <p>
              A feasibility verdict without evidence is just an opinion. The workspace is designed to make every important conclusion inspectable.
            </p>
            <div className="signal-list">
              {signalRows.map(([title, description]) => (
                <div className="signal-row" key={title}>
                  <span className="signal-row__marker" aria-hidden="true" />
                  <div><strong>{title}</strong><span>{description}</span></div>
                </div>
              ))}
            </div>
          </div>

          <div className="workspace-preview" aria-label="Sample feasibility workspace preview">
            <div className="workspace-preview__bar">
              <div><span className="workspace-preview__kicker">Sample property · demo data</span><strong>Detached garage · 24 × 30 ft</strong></div>
              <span className="status-chip status-chip--positive">Likely feasible</span>
            </div>
            <div className="workspace-preview__body">
              <div className="parcel-demo">
                <div className="parcel-demo__road">STREET</div>
                <div className="parcel-demo__lot">
                  <div className="parcel-demo__setback" />
                  <div className="parcel-demo__house">EXISTING</div>
                  <div className="parcel-demo__project">PROPOSED<br />24 × 30</div>
                  <span className="parcel-demo__dimension parcel-demo__dimension--rear">5′</span>
                  <span className="parcel-demo__dimension parcel-demo__dimension--side">5′</span>
                </div>
                <div className="parcel-demo__legend"><i /><span>Indicative buildable area</span></div>
              </div>
              <div className="workspace-preview__facts">
                <div className="verdict-block">
                  <span className="verdict-block__label">Feasibility confidence</span>
                  <div className="verdict-block__score"><strong>86</strong><span>/100</span></div>
                  <div className="confidence-bar"><span style={{ width: "86%" }} /></div>
                  <p>Major dimensional checks appear to pass. Two site conditions still require verification.</p>
                </div>
                <div className="mini-rule"><span>Side setback</span><strong>5 ft</strong><em>Source required</em></div>
                <div className="mini-rule"><span>Lot coverage</span><strong>29%</strong><em>Appears within limit</em></div>
                <div className="mini-rule"><span>Permit</span><strong>Required</strong><em>Likely path</em></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="projects">
        <div className="shell">
          <div className="section-heading section-heading--split">
            <div>
              <div className="eyebrow">Project-first by design</div>
              <h2>Start with the thing you actually want to build.</h2>
            </div>
            <p>Each project module asks different questions and evaluates different rules. We do not reduce every property to one generic “buildability” score.</p>
          </div>

          <div className="project-grid">
            {projectDefinitions.map((project, index) => (
              <article className={`project-card ${index === 0 ? "project-card--priority" : ""}`} key={project.key}>
                <div className="project-card__topline">
                  <span className="project-card__index">0{index + 1}</span>
                  {index === 0 && <span className="project-card__flag">Launch priority</span>}
                </div>
                <h3>{project.label}</h3>
                <p>{project.description}</p>
                <span className="project-card__example">Example · {project.example}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--authority">
        <div className="shell authority-grid">
          <div>
            <div className="eyebrow">Authority is part of the product</div>
            <h2>No unexplained green checkmarks.</h2>
            <p className="authority-lede">
              Production results will show the rule, source, effective date, verification date, confidence and unresolved exceptions behind material conclusions.
            </p>
            <Link href="/methodology" className="text-link">Read the methodology <span>→</span></Link>
          </div>
          <div className="source-card">
            <div className="source-card__header"><span>Evidence record</span><span className="source-card__status">STRUCTURE PREVIEW</span></div>
            <dl>
              <div><dt>Rule</dt><dd>Accessory structure side setback</dd></div>
              <div><dt>Value</dt><dd>5 ft <span className="data-tag">DEMO</span></dd></div>
              <div><dt>Authority</dt><dd>Official municipal code</dd></div>
              <div><dt>Effective date</dt><dd>Stored with rule version</dd></div>
              <div><dt>Last verified</dt><dd>Stored per source record</dd></div>
              <div><dt>Confidence</dt><dd>High / Medium / Review required</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="shell final-cta__inner">
          <div>
            <div className="eyebrow eyebrow--accent">Start with a property</div>
            <h2>Turn “I think it fits” into a real feasibility check.</h2>
          </div>
          <a className="button button--light" href="#analyze">Check a property <span>→</span></a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
