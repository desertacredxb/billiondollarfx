import type { MetadataRoute } from "next";
import { publishedBlogs } from "@/app/lib/blogApi";
import {
  SITE_URL,
  blogCanonicalUrl,
} from "@/app/lib/blogPublishing";

// Match the public article cache so automatic publications reach the sitemap promptly.
export const revalidate = 60;

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

// Public marketing pages. Admin, (dashboard) and /login are login-only and excluded.
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: ChangeFrequency }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/forex", priority: 0.9, changeFrequency: "monthly" },
  { path: "/metals", priority: 0.9, changeFrequency: "monthly" },
  { path: "/indices", priority: 0.9, changeFrequency: "monthly" },
  { path: "/commodities", priority: 0.9, changeFrequency: "monthly" },
  { path: "/crypto", priority: 0.9, changeFrequency: "monthly" },
  { path: "/oil", priority: 0.8, changeFrequency: "monthly" },
  { path: "/accounts", priority: 0.9, changeFrequency: "monthly" },
  { path: "/platform", priority: 0.8, changeFrequency: "monthly" },
  { path: "/blogs", priority: 0.8, changeFrequency: "daily" },
  { path: "/news", priority: 0.7, changeFrequency: "daily" },
  { path: "/economic-calendar", priority: 0.7, changeFrequency: "daily" },
  { path: "/education", priority: 0.7, changeFrequency: "monthly" },
  { path: "/analytical-tools", priority: 0.6, changeFrequency: "monthly" },
  { path: "/currency-calculator", priority: 0.6, changeFrequency: "monthly" },
  { path: "/currency-converter", priority: 0.6, changeFrequency: "monthly" },
  { path: "/ib-broker", priority: 0.7, changeFrequency: "monthly" },
  { path: "/cashback", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "yearly" },
  { path: "/help-centre", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  { path: "/career", priority: 0.5, changeFrequency: "monthly" },
  { path: "/Deposit&Withdrawal", priority: 0.5, changeFrequency: "yearly" },
  { path: "/Terms&Conditions", priority: 0.3, changeFrequency: "yearly" },
  { path: "/Privacy-Policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/aml-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/risk-discloser", priority: 0.3, changeFrequency: "yearly" },
  { path: "/Restricted-Countries", priority: 0.3, changeFrequency: "yearly" },
];

// Next.js writes these strings into the XML as-is, so "&" must be escaped here
const xmlSafe = (url: string) => url.replace(/&(?!amp;)/g, "&amp;");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: xmlSafe(`${SITE_URL}${r.path}`),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const first = await publishedBlogs();
    const posts = [...first.data];
    for (let page = 2; page <= first.pages; page++) posts.push(...(await publishedBlogs({ page: String(page) })).data);

    blogEntries = posts
      // A post whose canonical points elsewhere shouldn't be listed as its own URL
      .filter((p) => {
        const canonical = blogCanonicalUrl(p.slug, p.canonicalUrl);
        return canonical === `${SITE_URL}/blogs/${p.slug}`;
      })
      .map((p) => ({
        url: xmlSafe(`${SITE_URL}/blogs/${p.slug}`),
        lastModified: p.updatedAt || p.publishedAt || p.createdAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        ...(p.coverImage ? { images: [xmlSafe(p.coverImage)] } : {}),
      }));
  } catch (error) {
    // Still serve the static pages if the database is unreachable
    console.error("Sitemap: published articles are temporarily unavailable.");
  }

  return [...staticEntries, ...blogEntries];
}
