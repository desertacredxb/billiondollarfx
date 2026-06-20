"use client";

import Button from "../../../components/Button";
import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar";
import image from "../../../assets/new-mobile.png";
import trade from "../../../assets/trade-img2.webp";
import Image from "next/image";
import { CheckCircle, Minus, Plus } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How do I select the base currency?",
    answer:
      "You can select your base currency from the six available dropdown lists. This will be the currency you are converting from",
  },
  {
    question: "How do I enter the amount to convert?",
    answer:
      "Simply enter the amount you wish to convert from your base currency in the designated field. The converter will automatically calculate the equivalent values in the selected currencies.",
  },
  {
    question: "Are the exchange rates updated in real-time?",
    answer:
      "Yes, the exchange rates used by the Billion Dollar FX Currency Converter are updated in real-time to ensure accuracy.",
  },
];

export default function TradeToWin() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const handleClick = () => alert("Account Opening Started!");

  const toggleIndex = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="bg-[var(--bg)] text-white">
      <Navbar />

      <section className="w-11/12 md:w-4/5 mx-auto pt-36 pb-20 flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Left Content */}
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold leading-snug mb-4">
            Unlock Amazing{" "}
            <span className="text-[var(--primary)]">Rewards</span> <br />
            with Every Trade!
          </h2>
          <p className="italic text-gray-300 mb-6">
            Achieve specific trading volumes in 30 days and claim incredible
            prizes!
          </p>

          {/* Primary CTA */}
          <Button text="Join Now" onClick={handleClick} />

          {/* Secondary CTA */}
          <button
            className="mt-6 ml-5 relative overflow-hidden px-6 py-2 border border-[var(--primary)] text-[var(--primary)] rounded-full group text-sm font-medium"
            onClick={handleClick}
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
              View Brochure →
            </span>
            <span className="absolute inset-0 bg-[var(--primary)] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-in-out z-0"></span>
          </button>
        </div>

        {/* Right Image */}
        <div className="md:w-1/2 flex justify-center md:justify-end">
          <Image
            src={image}
            alt="Rewards Image"
            className="w-[280px] md:w-[350px] object-contain"
            priority
          />
        </div>
      </section>

      <section className="w-11/12 md:w-4/5 mx-auto py-12 text-white text-center">
        <h3 className="text-2xl md:text-3xl font-bold mb-4">
          How the <span className="text-[var(--primary)]">Trade to Win</span>{" "}
          Program Works?
        </h3>

        <p className="text-gray-300 mb-2">
          The more you trade, the bigger your reward! Reach specific trading
          volumes within{" "}
          <span className="font-semibold text-white">30 days</span> to unlock
          exciting prizes.
        </p>

        <p className="text-gray-300 mb-6">
          Each reward tier can be listed with its corresponding trading volume,
          making it easier to track your progress and stay motivated!
        </p>

        <div className="flex justify-center">
          <Image
            src={trade}
            alt="Trade to Win tiers"
            className="rounded-lg shadow-xl w-full max-w-2xl"
          />
        </div>
      </section>

      <section className="w-11/12 md:w-4/5 mx-auto bg-gradient-to-b from-[#121E2C] to-[#132735] text-white rounded-xl p-6 md:p-10 space-y-10 mt-10 shadow-lg">
        {/* Program Period & Eligibility */}
        <div>
          <h3 className="text-xl md:text-2xl font-bold mb-1">
            Program{" "}
            <span className="text-[var(--primary)]">Period & Eligibility:</span>
          </h3>
          <p className="italic text-sm text-gray-300 mb-4">
            Get started now and make the most of your trades.
          </p>
          <ul className="space-y-3 text-sm md:text-base">
            {[
              {
                title: "Active Dates",
                desc: "January 1, 2025 – May 31, 2025",
              },
              {
                title: "Trading Timeline",
                desc: "You have 30 days from your start date to reach your target volume.",
              },
              {
                title: "Who Can Join",
                desc: "Exclusively for retail clients. IBs are excluded.",
              },
              {
                title: "Entry Criteria",
                desc: "One entry per participant per program.",
              },
              {
                title: "Trading Criteria",
                desc: "Eligible trades must be held for at least 3 minutes to qualify.",
              },
              {
                title: "Excluded Instruments",
                desc: "Stocks and cryptocurrency pairs are excluded.",
              },
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle className="text-[var(--primary)] w-5 h-5 mt-1" />
                <span>
                  <strong>{item.title}:</strong> {item.desc}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <hr className="border-gray-700" />

        {/* Terms & Conditions */}
        <div>
          <h3 className="text-xl md:text-2xl font-bold mb-1">
            Important{" "}
            <span className="text-[var(--primary)]">Terms & Conditions</span>
          </h3>
          <p className="italic text-sm text-gray-300 mb-4">
            Ensure you meet all the criteria before participating.
          </p>
          <ul className="space-y-3 text-sm md:text-base">
            {[
              {
                title: "Fair Play",
                desc: "Market manipulation or abuse, such as latency arbitrage, will result in disqualification.",
              },
              {
                title: "Eligibility Limitations",
                desc: "Self-directed individual accounts only.",
              },
              {
                title: "Liability Disclaimer",
                desc: "Billion Dollar FX will not be responsible for trading losses. Program participation does not alter risk profiles.",
              },
              {
                title: "Dispute Resolution",
                desc: "Any issues will be handled by management fairly.",
              },
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle className="text-[var(--primary)] w-5 h-5 mt-1" />
                <span>
                  <strong>{item.title}:</strong> {item.desc}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <h3 className="text-2xl font-bold mb-2">
            Start Trading &{" "}
            <span className="text-[var(--primary)]">Win Big!</span>
          </h3>
          <p className="italic mb-6">
            Sign up today and start your journey to amazing rewards with Billion
            Dollar FX.
          </p>
          <Button text="Sign up Now" onClick={handleClick} />
        </div>
      </section>

      <section className=" text-white py-16">
        <div className="w-11/12 md:w-4/5 mx-auto">
          {/* Heading */}
          <h2 className="text-2xl md:text-3xl font-bold mb-5">
            FAQs: Your Guide to
            <span className="text-[var(--primary)]"> Seamless Trading</span>
          </h2>

          {/* Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-700 pb-2">
                <button
                  onClick={() => toggleIndex(i)}
                  className="w-full flex items-center justify-between text-left text-white text-lg font-medium"
                >
                  {faq.question}
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-[var(--primary)]">
                    {activeIndex === i ? (
                      <Minus className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </span>
                </button>

                {/* Animated Answer */}
                <div
                  className={`transition-all duration-500 overflow-hidden ${
                    activeIndex === i
                      ? "max-h-40 opacity-100 mt-3"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-gray-400 text-sm md:text-base">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
