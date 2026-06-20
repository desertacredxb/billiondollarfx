"use client";
import commodity from "../assets/icons1/commodities.png";
import forex from "../assets/icons1/forex.png";
import indices from "../assets/icons1/indices.png";
import crypto from "../assets/icons1/crypto.png";
import metals from "../assets/icons1/metals.png";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const originalItems = [
  {
    title: "Commodities",
    image: commodity,
    description:
      "Trade CFDs on spot and futures to harness market volatility in oil, gas, and more.",
    link: "/commodities",
  },
  {
    title: "Forex",
    image: forex,
    description:
      "Access non-stop trading of major, minor, and exotic currencies in the global forex market.",
    link: "/forex",
  },
  {
    title: "Indices",
    image: indices,
    description:
      "Speculate on the world’s leading stock markets with real-time access, all in one place.",
    link: "/indices",
  },
  {
    title: "Crypto Currency",
    image: crypto,
    description:
      "Trade the future of finance. Access top digital currencies with ultra-fast execution.",
    link: "/crypto",
  },
  {
    title: "Metals",
    image: metals,
    description:
      "Tap into the value of gold and silver, ideal for both safety and strategy.",
    link: "/metals",
  },
];

export default function TradeSection() {
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clone first & last for circular effect (only on mobile)
  const items = isMobile
    ? [
        originalItems[originalItems.length - 1],
        ...originalItems,
        originalItems[0],
      ]
    : originalItems;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile || !scrollRef.current) return;

    const container = scrollRef.current;
    const cardWidth = container.offsetWidth * 0.8;

    // Start from first actual item
    container.scrollLeft = cardWidth;

    let index = 1;

    intervalRef.current = setInterval(() => {
      index++;
      container.scrollTo({ left: cardWidth * index, behavior: "smooth" });

      // Reset when reaching clone of last (end)
      if (index === items.length - 1) {
        setTimeout(() => {
          container.scrollTo({ left: cardWidth, behavior: "auto" });
          index = 1;
        }, 600); // After scroll completes
      }
    }, 3000);

    return () => clearInterval(intervalRef.current!);
  }, [isMobile, items.length]);

  return (
    <section className=" text-white py-16">
      <div className="w-11/12 md:w-4/5 mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          <span className="text-[var(--primary)]">Markets </span>We Offer
        </h2>
        <p className="text-gray-400 mb-10 max-w-3xl">
          Step into billion-dollar markets with FX, Metals, and CFDs.
        </p>

        <div
          ref={scrollRef}
          className={`${
            isMobile
              ? "flex overflow-x-auto snap-x snap-mandatory gap-4 no-scrollbar"
              : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6"
          }`}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className={`relative group overflow-hidden border border-[#927948] rounded-3xl h-[330px] p-6 flex-shrink-0 ${
                isMobile ? "snap-center w-[80%]" : ""
              }`}
            >
              {/* Background zoom on hover */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 scale-0 rounded-full bg-[#ffebbf] transition-transform duration-1000 ease-out group-hover:scale-[3]" />
              </div>

              <div className="flex flex-col justify-end h-full relative z-10 transition-all duration-1000 ease-in-out group-hover:pt-6">
                {/* Image */}
                <div className="mb-4 transition-all duration-1000 ease-in-out transform group-hover:-translate-y-6">
                  <Image
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16"
                  />
                </div>

                {/* Title + Description */}
                <div className="transition-all duration-1000 ease-in-out transform group-hover:-translate-y-2  px-2">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-black">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-300 line-clamp-2 group-hover:line-clamp-none group-hover:mb-4 group-hover:text-gray-800">
                    {item.description}
                  </p>
                </div>

                {/* Learn More */}
                <Link
                  href={item.link}
                  className={`text-sm text-cyan-300 underline mt-2 transition-all duration-700 ease-in-out ${
                    isMobile
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-6"
                  }`}
                >
                  Learn More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
