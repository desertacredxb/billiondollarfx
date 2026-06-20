"use client";

import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useState } from "react";

import Image from "next/image";

export default function News() {
  return (
    <div className="bg-[var(--bg)]">
      <Navbar />
      <section className=" text-white pb-8 text-center pt-36">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-4">
          <span className="text-white font-medium">
            <Link href={"/"}>Home</Link>
          </span>{" "}
          / News
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold leading-snug max-w-4xl mx-auto mb-4">
          News
        </h1>
        <p className="text-center text-gray-400 max-w-4xl mx-auto px-4 text-medium">
          Stay informed with our latest market updates and expert insights,
          empowering you to make well-informed decisions in the world of
          finance.
        </p>
      </section>

      <Footer />
    </div>
  );
}
