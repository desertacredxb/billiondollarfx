"use client";

import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

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

export default function CurrencyCoverter() {
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
          / Currency Converter
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold leading-snug max-w-4xl mx-auto mb-4">
          Currency Converter
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-400 mb-6">
          Convert major and exotic currencies in seconds using our sleek,
          real-time converter.
        </p>
      </section>

      <section className=" text-white py-12">
        <div className="w-11/12 md:w-4/5 mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 ">
            How to Use{" "}
            <span className="text-[var(--primary)]">
              the BillionDollarFX Currency Converter?
            </span>
          </h2>

          <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-6">
            Easily convert one currency to multiple others with real-time rates.
            This tool is perfect for managing deposits, withdrawals, or checking
            live values before trading.
          </p>

          <ul className="text-left text-gray-300 text-base space-y-4  list-disc pl-5">
            <li>Start by selecting your base currency.</li>
            <li> Pick up to five currencies you&#39;d like to convert to.</li>
            <li>
              Enter the amount, and the converter will instantly show the latest
              exchange rates.
            </li>
          </ul>
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
