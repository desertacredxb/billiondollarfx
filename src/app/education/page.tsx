"use client";

import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

// const videoTabs = [
//   {
//     label: "Part 1. Basics of Forex",
//     videoId: "jx2nPMmw5Mc",
//   },
//   {
//     label: "Part 2. Basics of Forex",
//     videoId: "oUyNo9ISsAM",
//   },
// ];

const faqs = [
  {
    question: "How do I select the base currency?",
    answer:
      "You can choose your base currency from the dropdown menu before starting a trade. This is the currency you'll be using to buy or sell other currencies.",
  },
  {
    question: "How do I enter the amount to convert?",
    answer:
      "Simply type the desired amount in the input field next to your selected currency. The system will automatically calculate the conversion based on current rates.",
  },
  {
    question: "Are the exchange rates updated in real-time?",
    answer:
      "Yes, exchange rates are refreshed in real time to ensure accurate and up-to-date trading values.",
  },
  {
    question: "Can I trade Forex on my mobile device?",
    answer:
      "Absolutely. BillionDollarFX offers a fully optimised mobile trading experience through our web platform and supported apps.",
  },
  {
    question: "What is the minimum amount required to start trading?",
    answer:
      "You can begin trading with as little as the platform’s minimum deposit requirement, which is designed to be accessible for beginners.",
  },
  {
    question: "Is it safe to trade on BillionDollarFX?",
    answer:
      "Yes, BillionDollarFX uses advanced encryption and multi-layered security protocols to protect your funds and personal data.",
  },
  {
    question: "Do I need prior experience to start trading?",
    answer:
      "No experience is necessary. Our beginner courses and demo accounts are designed to help you learn and practise before committing real funds.",
  },
  {
    question: "How do I withdraw my earnings?",
    answer:
      "Withdrawals can be made easily through your dashboard by selecting your preferred withdrawal method and entering the desired amount.",
  },
  {
    question: "What support is available if I face issues while trading?",
    answer:
      "Our support team is available 24/7 via live chat, email, and phone to assist you with any questions or technical concerns.",
  },
  {
    question: "Can I access educational resources to improve my skills?",
    answer:
      "Yes, BillionDollarFX offers a wide range of free video courses, trading guides, and market analysis to help you grow as a trader.",
  },
];

export default function Education() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // const [activeTab, setActiveTab] = useState(0);

  const toggleIndex = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="bg-[var(--bg)] px-2">
      <Navbar />
      <section className=" text-white pb-8 text-center pt-36">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-4">
          <span className="text-white font-medium">
            <Link href={"/"}>Home</Link>
          </span>{" "}
          / Education
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold leading-snug max-w-4xl mx-auto mb-4">
          <span className="text-[var(--primary-color)]">
            Forex Foundations for Beginners
          </span>{" "}
          by BillionDollarFX
        </h1>
        <p className="text-center text-gray-400 max-w-4xl mx-auto px-4 text-medium">
          Build your forex skills from the ground up with BillionDollarFX. This
          beginner-friendly video program introduces you to how the Forex market
          works and how you can unlock its earning potential. Get familiar with
          essential trading terms and learn how to execute your first trades.
          Build your skills and confidence with the most trusted beginner course
          only at BillionDollarFX.
        </p>
      </section>

      {/* <section className="text-white py-8">
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="flex justify-center space-x-6  mb-6">
            {videoTabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`pb-2 font-medium transition-all ${
                  activeTab === i
                    ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
                    : "text-gray-400 hover:text-cyan-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoTabs[activeTab].videoId}`}
              title={videoTabs[activeTab].label}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          <p className="mt-4 text-start text-sm md:text-2xl text-gray-300">
            {videoTabs[activeTab].label}
          </p>
        </div>
      </section> */}

      <section className=" text-white py-12">
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
