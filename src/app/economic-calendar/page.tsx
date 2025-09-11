"use client";

import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import img1 from "../../../assets/icons/feature1.png";
import img2 from "../../../assets/icons/feature2.png";
import img3 from "../../../assets/icons/feature3.png";
import Image from "next/image";

const faqs = [
  {
    question:
      "Which tools on your platform provide the most accurate market predictions?",
    answer:
      "Track major economic events using the Economic Calendar, stay informed with real-time updates via FXStreet News, and access expert insights through Trading Central WebTV.",
  },
  {
    question:
      "What tools on your website are best for analysing trading patterns?",
    answer:
      "BillionDollarFX provides a combination of fundamental and technical analysis tools to help you predict price movements and identify patterns. These tools are free, easy to use, and available across all devices.",
  },
  {
    question:
      "Where can I access free trading signals on the BillionDollarFX website?",
    answer:
      "You can access free trading signals from Trading Central via your Personal Area or the BillionDollarFX Trade App. These signals use various analytical approaches and are ideal for building smart trade strategies.",
  },
  {
    question: "How do I open a trading account on BillionDollarFX?",
    answer:
      "Click on the “Register” button, fill in your details, verify your identity, and your account will be ready in minutes.",
  },
  {
    question: "Is a demo account available for new users?",
    answer:
      "Yes, we offer a free demo account with virtual funds so you can practise strategies and explore the platform without any financial risk.",
  },
  {
    question: "Can I use the platform on my mobile device?",
    answer:
      "Absolutely. The BillionDollarFX Trade App offers full access to charts, signals, trading tools, and account management on the go.",
  },
  {
    question: "How do I withdraw funds from my account?",
    answer:
      "Go to the withdrawal section in your Personal Area, choose a preferred method, enter the amount, and follow the steps to complete the process.",
  },
  {
    question: "Is my personal and financial data secure on BillionDollarFX?",
    answer:
      "Yes. We use bank-level encryption, two-factor authentication, and secure protocols to ensure your data and funds are fully protected.",
  },
  {
    question:
      "Where can I find beginner-friendly resources to learn Forex trading?",
    answer:
      "Our Education section includes beginner video courses, trading guides, glossaries, and webinars which are ideal for building a strong foundation in Forex trading.",
  },
];

const features = [
  {
    title: "Strategic",
    highlight: "Trading Signals",
    content:
      "Make optimal use of Trading Central&#39;s signals to formulate your trade plans and techniques. These signals combine a number of analytical techniques, providing traders with a useful tool across all periods and market conditions. You may easily access them through the Billion Dollar FX Trade app or your Billion Dollar FX Personal Area.",
    image: img1,
  },
  {
    title: "Real-Time",
    highlight: "Market News from Billion Dollar FX",
    content:
      "Stay up to date with market news and the most recent updates from the FXStreet News team in real time. Use the Billion Dollar FX Trade app or your Billion Dollar FX Personal Area to gain access to this useful data.",
    image: img2,
  },
  {
    title: "Advanced",
    highlight: "Charting Tools",
    content:
      "Analyze trends and execute strategies with our advanced charting tools. Packed with indicators and drawing tools to empower your decision-making process across all major asset classes.",
    image: img3,
  },
];

export default function EconomicCalendar() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="bg-[var(--bg)]">
      <Navbar />
      <section className=" text-white pb-8 text-center pt-36">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-4">
          <span className="text-white font-medium">
            <Link href={"/"}>Home</Link>
          </span>{" "}
          / Economic Calendar
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold leading-snug max-w-4xl mx-auto mb-4">
          Economic Calendar
        </h1>
      </section>

      <section className=" text-white py-12">
        <div className="w-11/12 md:w-4/5 mx-auto">
          {/* Title */}
          <h2 className="text-xl font-bold mb-6">
            How to Use the Forex Economic Calendar Smartly?
          </h2>

          {/* Description */}
          <p className="text-gray-400 text-medium  leading-relaxed mb-6">
            The Forex Economic Calendar is a powerful resource for traders,
            helping them track and interpret events that influence market trends
            and price movements. It provides a chronological overview of major
            national and global economic events, including central bank
            decisions, GDP releases, interest rate updates, Non-Farm Payrolls
            (NFP), and other key indicators.
          </p>

          <p className="text-gray-400 text-medium  leading-relaxed mb-6">
            These events can significantly impact the financial markets, and
            traders are alerted in real time through notifications available
            under the &#34;Mailbox&#34; tab on their trading platform. Since
            each event may affect instruments differently, understanding the
            relevance and timing of these updates is essential for informed and
            strategic trading.
          </p>

          {/* Subheading */}
          <h3 className="text-xl font-semibold mb-4">
            Your Secret Weapon in Forex? The Economic Calendar
          </h3>

          {/* Benefits */}
          <p className="text-gray-400 text-medium  leading-relaxed">
            The Forex Economic Calendar is a vital tool for tracking key news,
            reports, and announcements that can drive market volatility. It
            helps traders anticipate potential price movements across forex
            pairs, stocks, and other assets. By checking the calendar before
            trading, you can plan more strategically and stay prepared for
            shifts in chart patterns and technical indicators triggered by
            economic events.
          </p>
        </div>
      </section>

      <section className=" text-white py-16">
        <div className="w-11/12 md:w-4/5 mx-auto">
          {/* Heading */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Frequently
            <span className="text-[var(--primary)]"> asked questions</span>
          </h2>
          <p className="text-gray-400 mb-10 text-base md:text-lg">
            Unlock the answers you need with our FAQs. From account setup to
            trading strategies, find quick solutions to common queries, ensuring
            your trading journey with Billion Dollar FX is smooth and
            successful.
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

      <Footer />
    </div>
  );
}
