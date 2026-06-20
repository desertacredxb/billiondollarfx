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
      "Use Trading Central signals to strengthen your trading strategy. These signals combine multiple analysis techniques to offer valuable insights for all timeframes. You can access them easily through the BillionDollarFX Trade App or your BillionDollarFX Personal Area.",
    image: img1,
  },
  {
    title: "Live ",
    highlight: "Market News Updates",
    content:
      "Real-time market updates powered by FXStreet keep you informed of key events, price shifts, and global trends. Access the latest news directly through the BillionDollarFX Trade App or your Personal Area to make smart trading decisions.",
    image: img2,
  },
  {
    title: "Precision Trading with ",
    highlight: "Advanced Charts",
    content:
      "Track price action, spot patterns, and execute with purpose using powerful charting tools. Equipped with a wide range of indicators and visual aids to support technical analysis. Ideal for traders working across forex, commodities, indices, and more.",
    image: img3,
  },
];

export default function AnalyticalTools() {
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
          /Analytical Tools
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold leading-snug max-w-4xl mx-auto mb-4">
          Analytics Tools
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-400 mb-6">
          BillionDollarFX gives you the tools you need to trade with clarity and
          confidence.
        </p>
      </section>

      <section className=" text-white py-12">
        <div className="w-11/12 md:w-4/5 mx-auto space-y-16">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`flex flex-col-reverse ${
                i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } items-center gap-10`}
            >
              {/* Image */}
              <div
                className="w-full md:w-1/2 rounded-xl overflow-hidden bg-gradient-to-b from-[var(--bg)] to-[#0B3554]"
                data-aos="fade-up"
              >
                <Image
                  src={feature.image}
                  alt={feature.highlight}
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Text */}
              <div className="w-full md:w-1/2" data-aos="fade-up">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  {feature.title}{" "}
                  <span className="text-[var(--primary)]">
                    {feature.highlight}
                  </span>
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  {feature.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className=" text-white py-12">
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
