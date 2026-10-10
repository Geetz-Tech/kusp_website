import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  filled?: boolean;
  arrow?: string;
};

/** Underlined text CTA, or filled burgundy action. Always a real link. */
export function ActionLink({ href, children, filled = false, arrow }: Props) {
  const className = `action${filled ? " action--filled" : ""}`;
  const content = (
    <>
      {children}
      {arrow ? <b aria-hidden="true">{arrow}</b> : null}
    </>
  );
  return href.startsWith("#") ? (
    <a className={className} href={href}>
      {content}
    </a>
  ) : (
    <Link className={className} href={href}>
      {content}
    </Link>
  );
}

/** Quiet internal link for teaser sections: label + arrow on a fine rule, 44px target. */
export function TeaserLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="teaser-link" href={href}>
      <span>{children}</span>
      <b aria-hidden="true">→</b>
    </Link>
  );
}
