import BlogList, { type BlogItem } from "./BlogList";
import { publishedBlogs } from "@/app/lib/blogApi";
export const revalidate = 60;
export default async function Blogs() {
  try {
    const result = await publishedBlogs();
    return <BlogList initialBlogs={result.data as unknown as BlogItem[]} />;
  } catch { return <BlogList initialError />; }
}
