import type { IBlog } from "@/app/models/Blogs";

export const BLOG_API_BASE = `${(process.env.NEXT_PUBLIC_API_BASE || "https://billion-doller-backend.onrender.com").replace(/\/+$/, "")}/api/blogs`;

export async function publishedBlogs(params: Record<string, string> = {}): Promise<{ data: IBlog[]; pages: number }> {
  const query = new URLSearchParams({ status: "published", limit: "200", ...params });
  const response = await fetch(`${BLOG_API_BASE}?${query}`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Published articles are temporarily unavailable.");
  return response.json();
}

export async function publishedBlog(slug: string): Promise<IBlog | null> {
  const response = await fetch(`${BLOG_API_BASE}/slug/${encodeURIComponent(slug)}`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(15000) });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("This article is temporarily unavailable.");
  return (await response.json()).data;
}
