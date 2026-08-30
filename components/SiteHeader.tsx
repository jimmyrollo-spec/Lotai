import Link from "next/link";
import { brand } from "@/lib/brand";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link href="/" className="wordmark" aria-label={`${brand.name} home`}>
          <span className="wordmark__mark" aria-hidden="true"><span /><span /></span>
          <span>{brand.name}</span>
        </Link>
        <nav className="site-nav" aria-label="Primary navigation">
          <Link href="/#projects">Projects</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/methodology">Methodology</Link>
          <span className="nav-divider" />
          <Link className="nav-cta" href="/#analyze">Check a property</Link>
        </nav>
      </div>
    </header>
  );
}
