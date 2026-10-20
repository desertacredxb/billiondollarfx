"use client";

import { div } from "framer-motion/client";
import Image from "next/image";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import MarketOverview from "../../../components/MarketOverview";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Button from "../../../components/Button";
import InsightsSection from "../../../components/Inside_Contact";
import { useRouter } from "next/navigation";

export default function Indices() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  const router = useRouter();
  const handleClick = () => {
    router.push("/register");
    // router.push("https://crm.billiondollarfx.com/#/client/signup");
  };



  const accordionItems = [
    {
      title: "DISCOVER HOW TO TRADE",
      content:
        "Learn how to trade forex with beginner-friendly guides and tutorials.",
    },
    {
      title: "WHAT IS FOREX?",
      content:
        "Forex is a global market for currency exchange. It operates 24/5 and is the most liquid financial market.",
    },
    {
      title: "HOW TO TRADE FOREX?",
      content:
        "To trade forex, choose a broker, open an account, and start analyzing the markets.",
    },
  ];

  return (
    <div>
      <Navbar />
      <main className="bg-[var(--bg)] text-white font-[Montserrat] pt-12 pb-8">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mt-4">
            WHAT ARE<span className="text-[var(--primary)]"> INDICES?</span>
          </h1>
          <p className="mt-4 text-gray-400 w-11/12 mx-auto">
            Indices represent the collective performance of top companies in a
            stock market. Instead of picking individual stocks, you can trade on
            broad market trends through indices like the FTSE 100 or S&P 500.
            Want broader market exposure with lower risk? Our powerful Stock
            Indices Platform is built for that.
          </p>
          <Button
            text="Open Account"
            onClick={handleClick}
            className="mt-6 px-6 py-2 rounded-full bg-cyan-500 hover:bg-cyan-600 transition"
          />
        </section>

        <MarketOverview />

        {/* Accordion Section */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          {accordionItems.map((item, index) => (
            <div key={index} className="border-b border-gray-700">
              <button
                onClick={() => toggleAccordion(index)}
                className="flex justify-between items-center w-full py-4 text-left"
              >
                <span className="text-sm md:text-base">{item.title}</span>
                <FaChevronDown
                  className={`transition-transform ${
                    openIndex === index ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="pb-4 text-sm text-gray-400">{item.content}</div>
              )}
            </div>
          ))}
        </section>
      </main>
      <InsightsSection />
      <Footer />
    </div>
  );
}
