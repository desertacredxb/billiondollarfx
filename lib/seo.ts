import type { Metadata } from "next";
export const SITE_ORIGIN = "https://www.billiondollarfx.com";
export function pageMetadata(path: string, title: string, description: string): Metadata {
  const url = `${SITE_ORIGIN}${path || "/"}`;
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, siteName: "Billion Dollar FX", type: "website", images: [{ url: "/social-card.png", width: 1200, height: 630, alt: "Billion Dollar FX" }] }, twitter: { card: "summary_large_image", title, description, images: ["/social-card.png"] } };
}
