"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { Search, Tag, Calendar, User, ArrowRight, Loader2, BookOpen } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

interface BlogItem {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  coverImage: string;
  coverAlt: string;
  status: "draft" | "published" | "archived";
  category: string;
  author: string;
  tags: string[];
  faqs: FAQ[];
  publishedAt?: string;
  createdAt: string;
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    fetchPublishedBlogs();
  }, []);

  const fetchPublishedBlogs = async () => {
    try {
      setLoading(true);
      // Fetch only published blogs from your endpoint
      const res = await fetch("/api/blogs?status=published");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBlogs(data.data);
      }
    } catch (error) {
      console.error("Error fetching published blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Derive unique categories dynamically from API response
  const categories = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return ["All", ...Array.from(set)];
  }, [blogs]);

  // Client-side search and category filter matching
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (blog.tags && blog.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCategory =
        selectedCategory === "All" || blog.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [blogs, searchQuery, selectedCategory]);

  // Generate ItemList JSON-LD Schema for rich snippet SEO indexing
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: filteredBlogs.map((blog, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "BlogPosting",
        headline: blog.title,
        description: blog.shortDescription,
        image: blog.coverImage,
        url: `/blogs/${blog.slug}`,
        datePublished: blog.publishedAt || blog.createdAt,
        author: {
          "@type": "Person",
          name: blog.author || "Admin",
        },
      },
    })),
  };

  return (
    <div className="bg-[#0a0f1c] min-h-screen text-slate-100 flex flex-col justify-between selection:bg-[#927948] selection:text-white">
      {/* Structured Data for Search Engine Crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      <Navbar />

      <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full flex-grow">
        {/* Breadcrumbs & Header Section */}
        <section className="text-center max-w-3xl mx-auto mb-12">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400 mb-3 uppercase tracking-widest font-semibold">
            <Link href="/" className="hover:text-[#927948] transition-colors">
              Home
            </Link>{" "}
            <span className="text-slate-600 mx-1">/</span> <span className="text-[#927948]">Blog</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
            Insights &amp; <span className="text-[#927948]">Articles</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Stay updated with our latest industry news, guides, and expert perspectives.
          </p>
        </section>

        {/* Filter and Search Bar Controls */}
        <section className="bg-[#121829] border border-[#1e293b] rounded-2xl p-4 md:p-6 mb-12 shadow-xl space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
          {/* Dynamic Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#927948] text-white shadow-md"
                    : "bg-[#0a0f1c] text-slate-400 hover:text-slate-200 border border-[#1e293b]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input Box */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search articles or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs text-slate-100 bg-[#0a0f1c] border border-[#1e293b] rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#927948] transition-all placeholder:text-slate-500"
            />
          </div>
        </section>

        {/* Blog Article Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-xs font-bold tracking-widest text-slate-500 uppercase">
            <Loader2 className="w-8 h-8 text-[#927948] animate-spin" />
            <span>Loading articles...</span>
          </div>
        ) : filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => {
              const formattedDate = blog.publishedAt
                ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : new Date(blog.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

              return (
                <article
                  key={blog._id}
                  className="bg-[#121829] border border-[#1e293b] rounded-2xl overflow-hidden shadow-lg hover:border-[#927948]/50 hover:shadow-2xl transition-all duration-300 flex flex-col group"
                >
                  {/* Article Thumbnail */}
                  <Link href={`/blogs/${blog.slug}`} className="relative block h-52 bg-[#0a0f1c] overflow-hidden border-b border-[#1e293b]">
                    <Image
                      src={blog.coverImage || "/placeholder.jpg"}
                      alt={blog.coverAlt || blog.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#0a0f1c]/80 backdrop-blur-md text-[#927948] border border-[#1e293b]">
                        {blog.category}
                      </span>
                    </div>
                  </Link>

                  {/* Article Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#927948]" />
                          {formattedDate}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#927948]" />
                          {blog.author || "Admin"}
                        </span>
                      </div>

                      <h2 className="text-lg font-bold text-slate-100 leading-snug group-hover:text-[#927948] transition-colors line-clamp-2">
                        <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
                      </h2>

                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 font-normal">
                        {blog.shortDescription}
                      </p>
                    </div>

                    {/* Article Footer Link & Tags */}
                    <div className="pt-4 border-t border-[#1e293b] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 overflow-hidden">
                        {blog.tags && blog.tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-semibold text-slate-400 bg-[#0a0f1c] px-2 py-0.5 rounded border border-[#1e293b] flex items-center gap-1"
                          >
                            <Tag className="w-2.5 h-2.5 text-[#927948]" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      <Link
                        href={`/blogs/${blog.slug}`}
                        className="text-xs font-bold text-[#927948] hover:text-[#a68c56] flex items-center gap-1 transition-all group-hover:translate-x-0.5"
                      >
                        Read More <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#121829] border border-[#1e293b] border-dashed rounded-2xl p-16 text-center max-w-lg mx-auto">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-1">
              No Articles Found
            </h3>
            <p className="text-xs text-slate-500">
              No published posts match your current search criteria or category filter.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}