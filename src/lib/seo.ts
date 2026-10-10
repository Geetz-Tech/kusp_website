import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_LEGAL_NAME, SITE_NAME, SITE_SLOGAN, SITE_URL, KNOWS_ABOUT } from "./site";

/** Final Open Graph card (1200x630 PNG, built by scripts/build-og.cjs). Relative: metadataBase resolves it to https://www.kuspurban.com/og/kusp-og.png */
export const OG_IMAGE = {
  url: "/og/kusp-og.png",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "KUSP — Krishvi Unified Solutions Partners. Designing Resilient Cities & Transformative Infrastructure.",
} as const;

type PageMeta = {
  path: string;
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
};

/** Page metadata helper. Canonical / og:url are only emitted once a production domain is supplied. */
export function pageMetadata({ path, title, description, ogTitle, ogDescription }: PageMeta): Metadata {
  return {
    title: { absolute: title },
    description,
    ...(SITE_URL ? { alternates: { canonical: path } } : {}),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: ogTitle ?? title,
      description: ogDescription ?? description,
      ...(SITE_URL ? { url: path } : {}),
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle ?? title,
      description: ogDescription ?? description,
      images: [{ url: OG_IMAGE.url, alt: OG_IMAGE.alt }],
    },
  };
}

const abs = (path: string) => (SITE_URL ? `${SITE_URL}${path === "/" ? "" : path}` : undefined);

/** Sitewide schema: Organization + ProfessionalService + WebSite. No contact details, reviews or socials. */
export function siteSchema() {
  const url = abs("/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": url ? `${url}/#organization` : "#organization",
        name: SITE_NAME,
        // legalName intentionally omitted until the registered legal entity is confirmed.
        alternateName: SITE_LEGAL_NAME,
        slogan: SITE_SLOGAN,
        description: SITE_DESCRIPTION,
        ...(url ? { url } : {}),
      },
      {
        "@type": "ProfessionalService",
        "@id": url ? `${url}/#service` : "#service",
        name: SITE_NAME,
        alternateName: SITE_LEGAL_NAME,
        description: SITE_DESCRIPTION,
        knowsAbout: KNOWS_ABOUT,
        ...(url ? { url } : {}),
      },
      {
        "@type": "WebSite",
        "@id": url ? `${url}/#website` : "#website",
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "en",
        ...(url ? { url } : {}),
      },
    ],
  };
}

/** Per-page WebPage + BreadcrumbList. Insights intentionally never emits Article / BlogPosting. */
export function pageSchema({ path, name, description }: { path: string; name: string; description: string }) {
  const url = abs(path);
  const crumbs: { name: string; path: string }[] = [{ name: "Home", path: "/" }];
  if (path !== "/") crumbs.push({ name, path });
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", name, description, inLanguage: "en", ...(url ? { url } : {}) },
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          ...(abs(c.path) ? { item: abs(c.path) } : {}),
        })),
      },
    ],
  };
}
