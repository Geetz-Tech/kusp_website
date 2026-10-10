import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Libre_Caslon_Text } from "next/font/google";
import "./globals.css";
import "@/styles/art.css";
import { JsonLd } from "@/components/primitives/JsonLd";
import { OG_IMAGE, siteSchema } from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-hanken",
});

const caslon = Libre_Caslon_Text({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-caslon",
});

export const metadata: Metadata = {
  ...(SITE_URL ? { metadataBase: new URL(SITE_URL) } : {}),
  title: { default: "KUSP | Urban Planning, Spatial Intelligence & Infrastructure", template: "%s" },
  description: SITE_DESCRIPTION,
  applicationName: "KUSP",
  openGraph: { type: "website", siteName: "KUSP", images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", images: [{ url: OG_IMAGE.url, alt: OG_IMAGE.alt }] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f1ecdf",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hanken.variable} ${caslon.variable}`} suppressHydrationWarning>
      <head>
        {/* Marks JS availability before paint so motion "ready" states never hide content without JS. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <JsonLd data={siteSchema()} />
        {children}
      </body>
    </html>
  );
}
