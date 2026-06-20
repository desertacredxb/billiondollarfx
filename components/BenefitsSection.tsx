"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaHeadset, FaRegClock, FaShieldAlt } from "react-icons/fa";
import { FiGift } from "react-icons/fi";

const baseCards = [
  {
    icon: <FaRegClock className="text-2xl text-[var(--primary)]" />,
    title: "Crypto Withdrawal",
    bold: "30 minutes",
    description: "Fast, guaranteed crypto payouts in just 30 minutes.",
  },
  {
    icon: <FiGift className="text-2xl text-[var(--primary)]" />,
    title: "Daily Trading",
    bold: "Daily Perks",
    description: "The more you trade, the more you gain.",
  },
  {
    icon: <FaHeadset className="text-2xl text-[var(--primary)]" />,
    title: "Globally Awarded",
    bold: "24x7 Support",
    description: "Round-the-clock professional help you can count on",
  },
  {
    icon: <FaShieldAlt className="text-2xl text-[var(--primary)]" />,
    title: "Built-In ",
    bold: "Loss Protection",
    description:
      "Safeguard your funds with automatic negative balance protection.",
  },
];

export default function BenefitsSection() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const cards = isMobile ? [...baseCards, baseCards[0]] : baseCards;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile || !scrollRef.current) return;

    const container = scrollRef.current;
    const cardWidth = container.clientWidth;
    let index = 0;

    const interval = setInterval(() => {
      index++;
      container.scrollTo({ left: cardWidth * index, behavior: "smooth" });

      if (index === cards.length - 1) {
        setTimeout(() => {
          container.scrollTo({ left: 0, behavior: "auto" });
          index = 0;
        }, 600);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isMobile, cards.length]);

  return (
    <section className="text-white py-12">
      <div className="w-11/12 md:w-4/5 mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Left Content */}
        <div data-aos="fade-right">
          <h2 className="text-2xl md:text-3xl font-bold leading-snug">
            Smart Reasons to{" "}
            <span className="text-[var(--primary)]">Trade With Us</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-md">
            Curated for traders who demand clarity, speed, and real results.
          </p>
          <Link href="/register">
            <button className="mt-6 relative overflow-hidden px-5 py-2 border border-[var(--primary)] text-[var(--primary)] rounded-full group">
              <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                Start Trading →
              </span>
              <span className="absolute inset-0 bg-[var(--primary)] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-in-out z-0"></span>
            </button>
          </Link>
        </div>

        {/* Right Cards */}
        <div
          ref={scrollRef}
          className={`${
            isMobile
              ? "flex overflow-x-auto gap-6 snap-x snap-mandatory no-scrollbar"
              : "grid grid-cols-2 gap-6"
          }`}
        >
          {cards.map((card, index) => (
            <div
              key={index}
              className={`group h-52 snap-center flex-shrink-0 ${
                isMobile ? "w-full min-w-full" : ""
              } [perspective:1000px]`}
              data-aos="zoom-in"
              data-aos-delay={index * 100}
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
                  isMobile
                    ? "rotate-y-180"
                    : "md:group-hover:[transform:rotateY(180deg)]"
                }`}
              >
                {/* Front - only visible on desktop */}
                {!isMobile && (
                  <div className="absolute w-full h-full backface-hidden border border-[#927948] rounded-3xl p-5 flex flex-col justify-between gap-3">
                    {card.icon}
                    <div>
                      <p className="text-gray-300 text-sm">{card.title}</p>
                      <p className="text-xl font-bold">{card.bold}</p>
                    </div>
                  </div>
                )}

                {/* Back */}
                <div className="absolute w-full h-full backface-hidden [transform:rotateY(180deg)] bg-[#927948] rounded-3xl p-5 flex flex-col gap-3">
                  {card.icon}
                  <p className="text-gray-300 text-sm">{card.title}</p>
                  <p className="text-xl font-bold">{card.bold}</p>
                  <p className="text-sm text-gray-200">{card.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
