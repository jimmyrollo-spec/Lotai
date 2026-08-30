import Link from "next/link";
import { brand } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__grid">
        <div>
          <div className="wordmark wordmark--footer">
            <span className="wordmark__mark" aria-hidden="true"><span /><span /></span>
            <span>{brand.name}</span>
          </div>
          <p className="site-footer__summary">
            Property-specific feasibility intelligence for residential projects. Built to make complex rules easier to verify before money is committed.
          </p>
        </div>
        <div>
          <h3>Product</h3>
          <Link href="/#projects">Project checks</Link>
          <Link href="/#analyze">Check a property</Link>
          <span className="footer-muted">Professional tools — later</span>
        </div>
        <div>
          <h3>Authority</h3>
          <Link href="/methodology">Methodology</Link>
          <span className="footer-muted">Coverage — coming soon</span>
          <span className="footer-muted">Data sources — coming soon</span>
        </div>
        <div>
          <h3>Important</h3>
          <p className="footer-legal">
            Prototype results are demonstration data only. Production results will remain informational and must be verified with the authority having jurisdiction before design, purchase or construction decisions.
          </p>
        </div>
      </div>
      <div className="shell site-footer__bottom">
        <span>© {new Date().getFullYear()} {brand.name}. Working brand.</span>
        <span>Built for source-backed decisions, not black-box answers.</span>
      </div>
    </footer>
  );
}
