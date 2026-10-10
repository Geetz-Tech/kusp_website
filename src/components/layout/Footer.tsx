import Link from "next/link";
import { NAV } from "@/lib/site";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="site-footer">
      <Link className="footer-brand" href="/" aria-label="KUSP, Krishvi Unified Solutions Partners — home">
        <Logo responsive="footer" />
      </Link>
      <nav aria-label="Footer">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <span className="footer-note">Planning · Design · Spatial Intelligence · Infrastructure · Advisory</span>
    </footer>
  );
}
