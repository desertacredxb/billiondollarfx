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

export default function Forex() {
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
      pair: "EURUSD",
      name: "Euro / U.S. Dollar",
      price: "1.0932 USD",
      change: "+0.00072 +0.07%",
      changeColor: "text-green-400",
      flag1: "https://winprofx.com/_next/static/media/flag(1).480b259d.svg",
      flag2: "https://winprofx.com/_next/static/media/flag(2).1188a6c2.svg",
      chart: "https://winprofx.com/_next/static/media/grap.37f414da.svg",
    },
    {
      id: 2,
      pair: "ETHUSD",
      name: "Ethereum / U.S. Dollar",
      price: "1.0932 USD",
      change: "-0.00072 -0.07%",
      changeColor: "text-red-400",
      flag1: "https://winprofx.com/_next/static/media/flag(1).480b259d.svg",
      flag2: "https://winprofx.com/_next/static/media/flag(2).1188a6c2.svg",
      chart: "https://winprofx.com/_next/static/media/grap.37f414da.svg",
    },
    {
      id: 3,
      pair: "GBPUSD",
      name: "British Pound / U.S. Dollar",
      price: "1.2893 USD",
      change: "+0.00112 +0.09%",
      changeColor: "text-green-400",
      flag1: "https://winprofx.com/_next/static/media/flag(1).480b259d.svg",
      flag2: "https://winprofx.com/_next/static/media/flag(2).1188a6c2.svg",
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

        {/* Chart Section */}
        <section className=" py-10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
            {chartItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#0b1e26] p-4 rounded-lg shadow-md"
              >
                <div className="flex items-center gap-2">
                  <Image src={item.flag1} alt="flag1" width={24} height={24} />
                  <Image src={item.flag2} alt="flag2" width={24} height={24} />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{item.pair}</h3>
                <p className="text-sm text-gray-400">{item.name}</p>
                <p className="mt-2 text-xl font-semibold">{item.price}</p>
                <p className={`${item.changeColor} text-sm`}>{item.change}</p>
                <p className="text-xs mt-2 text-gray-400">Data Provider</p>
                <Image
                  src={item.chart}
                  alt="chart"
                  width={400}
                  height={100}
                  className="mt-4 w-full"
                />
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
