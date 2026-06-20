import { blogData } from "@/data/blogData";
import { notFound } from "next/navigation";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import Image from "next/image";

export default async function BlogDetails(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const blog = blogData.find((item) => item.slug === slug);

  if (!blog) return notFound();

  return (
    <div className="bg-[var(--bg)] text-white min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto py-36 px-6">
        <Image
          src={blog.image}
          alt={blog.title}
          width={800}
          height={400}
          className="rounded-lg w-full object-cover mb-6"
        />
        <h1 className="text-3xl font-bold mb-2">{blog.title}</h1>
        <p className="text-sm text-gray-400 mb-1">By {blog.author}</p>
        <p className="text-xs text-gray-500 mb-6">{blog.date}</p>

        <article className="prose prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </article>
      </div>
      <Footer />
    </div>
  );
}
