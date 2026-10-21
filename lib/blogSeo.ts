type ArticleContext = { title: string; category?: string; tags?: string[]; author?: string };
export function blogResourceLinks(article: ArticleContext) {
  const text = [article.title, article.category, ...(article.tags || [])].join(" ").toLowerCase();
  const links: { href: string; label: string }[] = [];
  if (/pip|forex|margin|leverage|lot|contract/.test(text)) links.push({ href: "/currency-calculator", label: "Explore the forex calculator" });
  if (/calendar|economic|release|market data/.test(text)) links.push({ href: "/economic-calendar", label: "View the economic calendar" });
  if (/mt5|metatrader|demo|platform|order/.test(text)) links.push({ href: "/platform", label: "Read the MT5 platform guide" });
  links.push({ href: "/help-centre", label: "Find account and platform answers" });
  return links.slice(0, 3);
}
export function blogAuthor(author?: string) {
  const name = author?.trim();
  return !name || /^(?:admin panel|billion\s*dollar\s*fx)$/i.test(name)
    ? { "@type": "Organization" as const, name: "Billion Dollar FX", url: "https://www.billiondollarfx.com" }
    : { "@type": "Person" as const, name };
}
export function dubaiScheduleInput(value?: string | Date | null) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? new Date(date.getTime() + 4 * 3600000).toISOString().slice(0, 16) : "";
}
export function dubaiScheduleValue(value: string) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error("Enter a valid Dubai publication date and time.");
  const date = new Date(`${value}:00+04:00`);
  if (!Number.isFinite(date.getTime()) || dubaiScheduleInput(date) !== value) throw new Error("Enter a valid Dubai publication date and time.");
  return date.toISOString();
}
