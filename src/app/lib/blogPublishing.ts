// Public site origin used for canonical / Open Graph URLs.
// Set NEXT_PUBLIC_SITE_URL in each environment (no trailing slash).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://billiondollarfx.com"
).replace(/\/+$/, "");

export const SITE_NAME = "BillionDollarFX";

/** Absolute canonical URL for a post: the editor override, or /blog/<slug>. */
export function blogCanonicalUrl(slug: string, override?: string | null) {
  const custom = override?.trim();
  if (custom) {
    return /^https?:\/\//i.test(custom)
      ? custom
      : `${SITE_URL}/${custom.replace(/^\/+/, "")}`;
  }
  return `${SITE_URL}/blog/${slug}`;
}

/** Mongo filter for posts that are published and whose publish time has arrived. */
export function livePublishedFilter() {
  return {
    status: "published" as const,
    $or: [{ publishedAt: null }, { publishedAt: { $lte: new Date() } }],
  };
}

/**
 * Normalises scheduling fields on a create/update payload:
 * - empty scheduledAt becomes null
 * - publishing sets publishedAt to the scheduled time, else keeps the
 *   original publish date, else now
 */
export function applyPublishFields(
  body: Record<string, any>,
  existingPublishedAt?: Date | null,
) {
  const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
  body.scheduledAt =
    scheduledAt && !isNaN(scheduledAt.getTime()) ? scheduledAt : null;

  if (body.status === "published") {
    body.publishedAt = body.scheduledAt || existingPublishedAt || new Date();
  }
  return body;
}
