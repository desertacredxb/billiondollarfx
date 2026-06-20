"use client";

import { div } from "framer-motion/client";
import Image from "next/image";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Button from "../../../components/Button";
import InsightsSection from "../../../components/Inside_Contact";
import { useRouter } from "next/navigation";

export default function Metals() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  const router = useRouter();
  const handleClick = () => {
    router.push("/register");
  };

  const chartItems = [
    {
      id: 1,
      icon: "https://winprofx.com/_next/static/media/trade(11).4b39092b.svg",
      title: "Gold",
      subtitle: "Gold Futures",
      price: "1.0932",
      currency: "USD",
      change: "-0.00072 -0.07%",
      changeColor: "text-red-400",
      chart: "https://winprofx.com/_next/static/media/grap.37f414da.svg",
    },
    {
      id: 2,
      icon: "https://winprofx.com/_next/static/media/trade(10).b99c5d36.svg",
      title: "Copper",
      subtitle: "Copper Futures",
      price: "1.0932",
      currency: "USD",
      change: "+0.00072 +0.07%",
      changeColor: "text-green-400",
      chart: "https://winprofx.com/_next/static/media/grap.37f414da.svg",
    },
    {
      id: 3,
      icon: "https://winprofx.com/_next/static/media/trade(9).fb8586eb.svg",
      title: "Palladium",
      subtitle: "Palladium Futures",
      price: "1.0932",
      currency: "USD",
      change: "+0.00072 +0.07%",
      changeColor: "text-green-400",
      chart: "https://winprofx.com/_next/static/media/grap.37f414da.svg",
    },
    {
      id: 4,
      icon: "https://winprofx.com/_next/static/media/trade(8).d78a1f00.svg",
      title: "LEAD",
      subtitle: "LEAD FUTURES",
      price: "1.0932",
      currency: "USD",
      change: "-0.00072 -0.07%",
      changeColor: "text-red-400",
      chart: "https://winprofx.com/_next/static/media/grap.37f414da.svg",
    },
  ];

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
            What Is Precious
            <span className="text-[var(--primary)]"> Metals Trading?</span>
          </h1>
          <p className="mt-4 text-gray-400 w-11/12 mx-auto">
            Precious metals like gold and silver have long been safe-haven
            assets during market volatility. With over $300 billion traded
            daily, they remain a key choice for traders worldwide. At
            BillionDollarFX, enjoy tight spreads and fast execution when trading
            spot metals. Explore advanced Precious Metals Trading Platform and
            start diversifying your portfolio today.
          </p>
          <Button
            text="Open Account"
            onClick={handleClick}
            className="mt-6 px-6 py-2 rounded-full bg-cyan-500 hover:bg-cyan-600 transition"
          />
        </section>

        {/* Chart Section */}
        <section className=" py-10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 px-4">
            {chartItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#1b2d3a] p-5 rounded-2xl shadow-md text-white"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9">
                      <Image
                        src={item.icon}
                        alt={item.subtitle}
                        width={36}
                        height={36}
                        className="rounded-full object-contain"
                      />
                    </div>
                    <div className="leading-tight">
                      <h3 className="text-sm font-semibold">{item.title}</h3>
                      <p className="text-xs text-gray-400">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="text-right leading-tight">
                    <p className="text-[10px] text-gray-400">{item.currency}</p>
                    <p className="text-lg font-bold">{item.price}</p>
                    <p className={`text-xs font-medium ${item.changeColor}`}>
                      {item.change}
                    </p>
                  </div>
                </div>

                {/* Chart */}
                <div className="mt-4">
                  <Image
                    src={item.chart}
                    alt={`${item.title} chart`}
                    width={400}
                    height={100}
                    className="w-full h-auto object-contain"
                  />
                </div>

                {/* Footer */}
                <p className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                  <span>©</span> Data Provider
                </p>
              </div>
            ))}
          </div>
        </section>

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
