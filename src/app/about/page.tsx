"use client";

import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Button from "../../../components/Button";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "What is BillionDollarFX?",
    answer:
      "BillionDollarFX is a global trading platform offering access to Forex, CFDs, and commodities, built for both beginners and experienced traders.",
  },
  {
    question: "How do I start trading with BillionDollarFX?",
    answer:
      "Simply create an account, verify your identity, fund your wallet, and access the trading platform in just a few easy steps.",
  },
  {
    question: "Which financial instruments can I trade with BillionDollarFX?",
    answer:
      "You can trade a wide range of instruments including major and minor currency pairs, commodities, indices, and CFDs.",
  },
  {
    question: "How can I deposit and withdraw funds on BillionDollarFX?",
    answer:
      "We support multiple payment methods such as bank transfers, credit/debit cards, and e-wallets. Withdrawals are processed quickly and securely.",
  },
  {
    question: "What trading platforms does BillionDollarFX support?",
    answer:
      "Our platform is compatible with industry-standard tools like MetaTrader, along with our own intuitive web and mobile trading interfaces.",
  },
  {
    question: "Does BillionDollarFX provide educational resources for traders?",
    answer:
      "Yes, we offer webinars, trading tutorials, market insights, and strategy guides to help traders grow at every level.",
  },
  {
    question: "How can I contact BillionDollarFX customer support?",
    answer:
      "Our support team is available 24/7 via live chat, email, and phone to assist with any queries or technical concerns.",
  },
];

export default function About() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleClick = () => alert("Account Opening Started!");
  return (
    <div className="bg-[var(--bg)] px-2">
      <Navbar />
      <section className=" text-white pb-16 text-center pt-36">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-4">
          <span className="text-white font-medium">
            <Link href={"/"}>Home</Link>
          </span>{" "}
          / About Us
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold leading-snug max-w-4xl mx-auto mb-4">
          Redefining the Future of{" "}
          <span className="text-[var(--primary)]">Global Trading</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-400 mb-6">
          BillionDollarFX empowers every trade and every trader
        </p>

        {/* Paragraph */}
        <p className="text-gray-400 max-w-4xl mx-auto text-base leading-relaxed">
          At BillionDollarFX, we offer a cutting-edge trading experience for
          everyone, from first-time investors to seasoned professionals. Our
          platform provides easy access to global markets, including forex,
          commodities, and CFD opportunities. With real-time insights, advanced
          tools, and dedicated assistance, we help you stay ahead and make smart
          decisions.
        </p>
      </section>

      <section className=" text-white py-12  text-center">
        {/* Section Heading */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            <span className="text-[var(--primary)]">Standing Out</span> in a Sea
            of Brokers
          </h2>
          <p className="text-gray-400 mb-12 text-base md:text-lg">
            BillionDollarFX is committed to reshaping the financial landscape by
            driving innovation and accessibility. Our goal is to deliver a
            powerful, secure, and user-centric trading platform that empowers
            both experienced investors and newcomers to thrive in global
            markets.
          </p>
        </div>

        {/* Grid Items */}
        <div className="w-11/12 md:w-4/5 mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
          {/* Item 1 */}
          <div>
            <h3 className="text-[var(--primary)] font-semibold text-xl mb-2">
              1. Vision-Led Performance
            </h3>
            <p className="text-gray-300">
              Driven by clarity and purpose, we combine strategy with technology
              to deliver trading solutions that exceed expectations.
            </p>
          </div>

          {/* Item 2 */}
          <div>
            <h3 className="text-[var(--primary)] font-semibold text-xl mb-2">
              2. Confidence Through Clarity
            </h3>
            <p className="text-gray-300">
              We simplify complex markets with intuitive tools and clear
              communication because informed traders are confident traders.
            </p>
          </div>

          {/* Item 3 */}
          <div>
            <h3 className="text-[var(--primary)] font-semibold text-xl mb-2">
              3. Resilience in Every Trade
            </h3>
            <p className="text-gray-300">
              Markets fluctuate, but our commitment doesn’t. We’re your constant
              in an unpredictable landscape from market swings to personal
              goals.
            </p>
          </div>

          {/* Item 4 */}
          <div>
            <h3 className="text-[var(--primary)] font-semibold text-xl mb-2">
              4. Together, We Grow
            </h3>
            <p className="text-gray-300">
              Success is stronger when shared. We foster meaningful
              relationships and grow as a united, global trading community.
            </p>
          </div>
        </div>
      </section>

      <section className=" text-white py-16">
        <div className="w-11/12 md:w-4/5 mx-auto">
          {/* Heading */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            <span className="text-[var(--primary)]"> FAQs – </span>Everything
            You Need to Know
          </h2>
          <p className="text-gray-400 mb-10 text-base md:text-lg">
            Have questions? We&#39;ve got answers. Whether you&#39;re getting
            started or refining your strategy, our FAQs cover the essentials to
            keep your experience with BillionDollarFX effortless and informed.
          </p>

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

      <section className="w-11/12 md:w-4/5 mx-auto py-12 space-y-5">
        <h2 className="text-center max-w-3xl mx-auto text-gray-200 text-xl md:text-2xl font-bold">
          <span className="text-[var(--primary)]"> Start Your Trading</span>{" "}
          Journey with Purpose
        </h2>
        <p className="text-gray-400 text-center max-w-4xl mx-auto">
          At Billion Dollar FX, trading is all about making an impact. Step into
          a platform where every move shapes your future and defines your edge.
        </p>
        <p className="text-gray-400 text-center max-w-4xl mx-auto">
          Trade with intention. Stand out. Make a difference.
        </p>

        <div className="flex justify-center">
          <Button text="Create Account Now" onClick={handleClick} />
        </div>
      </section>
      <Footer />
    </div>
  );
}
