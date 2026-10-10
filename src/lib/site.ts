/**
 * Site-level constants. Only facts supported by the approved handoff / Corporate
 * Capabilities PDF live here, plus the confirmed public contact details below. No other address, phone, email,
 * social profiles or founding date.
 */

/** Confirmed public contact details — use exactly as written; do not add other offices, numbers, addresses or socials. */
export const CONTACT_EMAIL = "info@kusp.com";
export const CONTACT_EMAIL_HREF = "mailto:info@kusp.com";
const WA_TEXT = encodeURIComponent("Hello KUSP Team, I would like to discuss a project enquiry.");
export const OFFICES = [
  {
    id: "uae",
    label: "UAE",
    address: ["UAE Business Centre", "Sharjah, UAE"],
    phone: "+971 52 7275264",
    phoneHref: "tel:+971527275264",
    whatsappHref: `https://wa.me/971527275264?text=${WA_TEXT}`,
    whatsappLabel: "Chat with UAE office",
  },
  {
    id: "india",
    label: "INDIA",
    address: ["KUSP", "P 41/47 Prathabasimhapuram", "Srinevasapuram", "Thanjavur - 613009", "India"],
    phone: "+91 96775 70887",
    phoneHref: "tel:+919677570887",
    whatsappHref: `https://wa.me/919677570887?text=${WA_TEXT}`,
    whatsappLabel: "Chat with India office",
  },
] as const;

export const SITE_NAME = "KUSP";
/** Brand name as written in the PDF. NOT asserted as a registered legal entity (schema uses alternateName). */
export const SITE_LEGAL_NAME = "Krishvi Unified Solutions Partners";
/** PDF cover line. */
export const SITE_SLOGAN = "Designing Resilient Cities & Transformative Infrastructure.";
export const SITE_DESCRIPTION =
  "KUSP is a multidisciplinary planning, design and advisory consultancy delivering integrated solutions for cities, industrial regions, infrastructure and sustainable development.";

/** Production domain: NEXT_PUBLIC_SITE_URL=https://www.kuspurban.com (set in .env.production; enables canonicals, sitemap, absolute schema URLs). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "") || null;

export type NavItem = { href: string; label: string };

export const NAV: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/expertise", label: "Expertise" },
  { href: "/framework", label: "Framework" },
  { href: "/sectors", label: "Sectors" },
  { href: "/experience", label: "Experience" },
  { href: "/insights", label: "Insights" },
  { href: "/contact", label: "Contact" },
];

export const KNOWS_ABOUT = [
  "Urban planning",
  "Urban design and architecture",
  "Economics, advisory and development",
  "Digital and geospatial intelligence",
  "Infrastructure and mobility",
  "Sustainability and social impact",
];
