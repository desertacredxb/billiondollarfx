import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { connectToDatabase } from "@/app/lib/db";
import Blog, { IBlog } from "@/app/models/Blogs";
import {
  Calendar,
  User,
  Tag,
  HelpCircle,
  ArrowLeft,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBlogPost(slug: string): Promise<IBlog | null> {
  try {
    await connectToDatabase();
    const blog = await Blog.findOne({ slug, status: "published" }).lean();
    if (!blog) return null;
    return JSON.parse(JSON.stringify(blog)) as IBlog;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}


export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogPost(slug);

  if (!blog) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be located.",
    };
  }

  const title = blog.metaTitle || blog.title;
  const description = blog.metaDescription || blog.shortDescription;
  const keywords = blog.metaKeywords?.length ? blog.metaKeywords : blog.tags;

  return {
    title: `${title} | Blog Details`,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: blog.publishedAt
        ? new Date(blog.publishedAt).toISOString()
        : new Date(blog.createdAt).toISOString(),
      authors: [blog.author || "Admin Panel"],
      images: [
        {
          url: blog.coverImage,
          alt: blog.coverAlt || blog.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [blog.coverImage],
    },
  };
}

export default async function BlogDetails({ params }: PageProps) {
  const { slug } = await params;
  const blog = await getBlogPost(slug);

  if (!blog) return notFound();

  const formattedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : new Date(blog.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.shortDescription,
    image: [blog.coverImage],
    datePublished: blog.publishedAt
      ? new Date(blog.publishedAt).toISOString()
      : new Date(blog.createdAt).toISOString(),
    dateModified: blog.updatedAt
      ? new Date(blog.updatedAt).toISOString()
      : new Date(blog.createdAt).toISOString(),
    author: {
      "@type": "Person",
      name: blog.author || "Admin Panel",
    },
    articleBody: blog.content?.replace(/<[^>]+>/g, ""),
  };

  const faqSchema =
    blog.faqs && blog.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: blog.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

      console.log(blog)

  return (
    <div className="bg-[#0a0f1c] min-h-screen text-slate-100 flex flex-col justify-between selection:bg-[#927948] selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <Navbar />

      <main className="pt-32 pb-24 px-4 md:px-8 max-w-7xl mx-auto w-full flex-grow">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#927948] transition-colors uppercase tracking-wider bg-[#121829] px-3.5 py-2 rounded-xl border border-[#1e293b] shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-[#927948]" /> Back to Articles
          </Link>
        </div>

        {/* Article Header Card */}
        <header className="mb-10 space-y-5 bg-[#121829] border border-[#1e293b] rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md bg-[#927948]/10 text-[#927948] border border-[#927948]/30">
              {blog.category}
            </span>
            <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#927948]" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#927948]" />
                {blog.author || "Admin Panel"}
              </span>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.2]">
            {blog.title}
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed border-l-4 border-[#927948] pl-4 py-1 italic bg-[#0a0f1c]/50 rounded-r-xl">
            {blog.shortDescription}
          </p>
        </header>

        {/* Featured Image Frame */}
        <div className="relative w-full h-72 md:h-[480px] rounded-3xl overflow-hidden mb-12 border border-[#1e293b] shadow-2xl bg-[#121829]">
          <Image
            src={blog.coverImage}
            alt={blog.coverAlt || blog.title}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1024px"
            className="object-cover"
          />
        </div>

        {/* Content & Typography Styling Layer */}
        <article
          className="
            bg-[#121829] border border-[#1e293b] rounded-3xl p-6 md:p-12 shadow-2xl mb-12
            prose prose-invert max-w-none
            
            /* Headings */
            prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight prose-headings:scroll-mt-28
            prose-h1:text-2xl md:prose-h1:text-4xl prose-h1:border-b prose-h1:border-[#1e293b] prose-h1:pb-3 prose-h1:mb-6
            prose-h2:text-xl md:prose-h2:text-2xl prose-h2:text-[#927948] prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-lg md:prose-h3:text-xl prose-h3:text-slate-100 prose-h3:mt-8 prose-h3:mb-3
            prose-h4:text-base md:prose-h4:text-lg prose-h4:text-slate-200
            
            /* Body Paragraphs & Inline Text */
            prose-p:text-slate-300 prose-p:text-sm md:prose-p:text-base prose-p:leading-[1.8] prose-p:mb-6
            prose-strong:text-white prose-strong:font-bold
            prose-em:text-slate-200 prose-em:italic
            
            /* Links */
            prose-a:text-[#927948] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-a:transition-all
            
            /* Lists */
            prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2 prose-ul:my-6 prose-ul:text-slate-300
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2 prose-ol:my-6 prose-ol:text-slate-300
            prose-li:text-sm md:prose-li:text-base prose-li:leading-relaxed
            
            /* Blockquotes */
            prose-blockquote:border-l-4 prose-blockquote:border-[#927948] prose-blockquote:bg-[#0a0f1c] 
            prose-blockquote:p-4 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:text-slate-200 
            prose-blockquote:italic prose-blockquote:my-8 prose-blockquote:border-[#927948]
            
            /* Code & Preblocks */
            prose-code:text-[#927948] prose-code:bg-[#0a0f1c] prose-code:px-2 prose-code:py-0.5 prose-code:rounded-md prose-code:border prose-code:border-[#1e293b] prose-code:text-xs prose-code:font-mono
            prose-pre:bg-[#0a0f1c] prose-pre:border prose-pre:border-[#1e293b] prose-pre:rounded-2xl prose-pre:p-5 prose-pre:shadow-inner prose-pre:my-8
            
            /* Content Embedded Images */
            prose-img:rounded-2xl prose-img:border prose-img:border-[#1e293b] prose-img:shadow-xl prose-img:my-8 prose-img:mx-auto
            
            /* Tables */
            prose-table:w-full prose-table:border-collapse prose-table:my-8 prose-table:rounded-xl prose-table:overflow-hidden prose-table:border prose-table:border-[#1e293b]
            prose-th:bg-[#0a0f1c] prose-th:text-white prose-th:font-bold prose-th:p-3 prose-th:text-left prose-th:border-b prose-th:border-[#1e293b] prose-th:text-xs md:prose-th:text-sm
            prose-td:p-3 prose-td:border-b prose-td:border-[#1e293b]/50 prose-td:text-slate-300 prose-td:text-xs md:prose-td:text-sm
            
            /* Horizontal Rule Divider */
            prose-hr:border-[#1e293b] prose-hr:my-10
          "
        >
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </article>

        {/* Tag Pill Chips */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="bg-[#121829] border border-[#1e293b] rounded-2xl p-6 mb-12 flex items-center gap-3 flex-wrap shadow-lg">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Article Tags:
            </span>
            {blog.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold text-slate-200 bg-[#0a0f1c] px-3.5 py-1.5 rounded-xl border border-[#1e293b] flex items-center gap-1.5 hover:border-[#927948] transition-colors"
              >
                <Tag className="w-3 h-3 text-[#927948]" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Accordion FAQ Block */}
        {blog.faqs && blog.faqs.length > 0 && (
          <section className="bg-[#121829] border border-[#1e293b] rounded-3xl p-6 md:p-10 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-[#1e293b] pb-5">
              <div className="p-2.5 rounded-2xl bg-[#927948]/10 border border-[#927948]/30">
                <HelpCircle className="w-6 h-6 text-[#927948]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Core takeaways and answers regarding this topic
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {blog.faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-[#0a0f1c] border border-[#1e293b] rounded-2xl p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer transition-all hover:border-[#927948]/50"
                >
                  <summary className="flex items-center justify-between text-xs md:text-sm font-bold text-slate-200 group-open:text-[#927948]">
                    <span>{faq.question}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-2" />
                  </summary>
                  <p className="mt-4 text-xs md:text-sm text-slate-300 leading-relaxed pt-3 border-t border-[#1e293b]/60">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
