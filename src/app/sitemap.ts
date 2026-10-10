import type { MetadataRoute } from "next";
import { NAV, SITE_URL } from "@/lib/site";

/** Sitemap entries need absolute URLs, so it stays empty until NEXT_PUBLIC_SITE_URL (the production domain) is supplied. */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE_URL) return [];
  return NAV.map((item) => ({
    url: `${SITE_URL}${item.href === "/" ? "" : item.href}`,
    changeFrequency: "monthly",
    priority: item.href === "/" ? 1 : 0.7,
  }));
}
