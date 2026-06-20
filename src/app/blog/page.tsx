"use client";

import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Image from "next/image";
import { blogData } from "@/data/blogData";

export default function Blog() {
  return (
    <div className="bg-[var(--bg)] min-h-screen text-white">
      <Navbar />
      <section className="text-center pt-36 pb-12">
        <div className="text-sm text-gray-400 mb-4">
          <Link href="/" className="text-white font-medium">
            Home
          </Link>{" "}
          / Blog
        </div>
        <h1 className="text-3xl font-bold mb-6">Our Latest Blogs</h1>

        <div className="w-11/12 md:w-4/5 mx-auto grid md:grid-cols-3 gap-6">
          {blogData.map((blog) => (
            <Link key={blog.slug} href={`/blog/${blog.slug}`}>
              <div className="bg-[#1f2d3d] rounded-lg p-4 overflow-hidden shadow-md hover:scale-105 transition">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  width={500}
                  height={300}
                  className="w-full rounded-lg h-48 object-cover"
                />
                <div className="p-4 text-left">
                  <h2 className="text-lg font-semibold">{blog.title}</h2>
                  <p className="text-xs text-gray-400 mt-1">{blog.date}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
