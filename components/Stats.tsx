"use client";

import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import evolving from "../assets/icons1/evolving.png";
import awards from "../assets/icons1/awards.png";
import country from "../assets/icons1/countries.png";
import trading from "../assets/icons1/trading.png";
import Image, { StaticImageData } from "next/image";

interface StatItem {
  icon: StaticImageData;
  endValue?: number;
  title?: string;
  subtitle: string;
  suffix?: string;
}

const statsData: StatItem[] = [
  {
    icon: evolving,
    title: "Evolving",
    subtitle: "In The Market",
  },
  {
    icon: awards,
    endValue: 40,
    subtitle: "Global Honours",
    suffix: "+",
  },
  {
    icon: country,
    endValue: 99.9,
    subtitle: "Orders Filled in Under 50ms",
    suffix: "%",
  },
  {
    icon: trading,
    endValue: 300,
    subtitle: "Markets to Explore",
    suffix: "+",
  },
];

export default function Stats() {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <section
      ref={ref}
      className="w-11/12 md:w-4/5 mx-auto text-white py-12 font-montserrat"
    >
      {/* Heading */}
      <div className="text-start mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-[var(--primary)]"> Lead the Market</span> <br />
          with Asia&apos;s Top-Ranked Broker of 2025
        </h2>
        <hr className="border-[var(--primary)] border-t-1 mt-4" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2  md:grid-cols-4 gap-8 mt-12">
        {statsData.map((stat, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <Image
              src={stat.icon}
              alt={stat.subtitle}
              className="w-16 h-16 mb-4"
            />
            <h3 className="text-2xl font-bold mb-1">
              {typeof stat.endValue === "number" && inView ? (
                <CountUp
                  end={stat.endValue}
                  duration={2}
                  suffix={stat.suffix}
                />
              ) : (
                stat.title
              )}
            </h3>
            <p className="text-md text-gray-300">{stat.subtitle}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
