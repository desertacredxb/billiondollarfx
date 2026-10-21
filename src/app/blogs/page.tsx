import BlogList, { type BlogItem } from "./BlogList";
import { publishedBlogs } from "@/app/lib/blogApi";
import { pageMetadata } from "../../../lib/seo";
export const metadata = pageMetadata("/blogs", "Forex & MT5 Learning Guides | Billion Dollar FX", "Explore original guides to forex calculations, MetaTrader 5, economic calendars and trading-account tools.");
export const revalidate = 60;
export default async function Blogs() {
  try {
    const result = await publishedBlogs();
    return <BlogList initialBlogs={result.data as unknown as BlogItem[]} />;
  } catch { return <BlogList initialError />; }
}
