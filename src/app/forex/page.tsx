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

import euro from "../../../assets/icons1/euro.png"
import eth from "../../../assets/icons1/eth.png"
import doller from "../../../assets/icons1/doller.png"
import gbp from "../../../assets/icons1/gbp.png"



export default function Forex() {
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
        <section className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mt-4">
            WHAT IS{" "}
            <span className="text-[var(--primary)]">FOREX TRADING?</span>
          </h1>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Forex, or Foreign Exchange, is the world’s largest financial market
            with over 6 trillion dollars traded daily. This volume exceeds that
            of all stock exchanges combined. Millions of traders use its
            liquidity and volatility every day. Choosing the right forex
            platform can help you trade smarter and faster.
          </p>
          <Button
            text="Create Account"
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
