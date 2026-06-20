"use client";
import Image from "next/image";
import logo from "../assets/logo.webp";

const newsLogos = [
  { image: logo, text: "Street Insider" },
  { image: logo, text: "Yahoo Finance" },
  { image: logo, text: "Digital Journal" },
  { image: logo, text: "Whig Standard" },
];

export default function NewsInsights() {
  return (
    <section className="text-white py-12 relative">
      <div className="w-11/12 md:w-4/5 mx-auto text-center">
        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-bold mb-3">News & Insights</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Informed trading starts with informed reading.
        </p>

        {/* Cards for Desktop */}
        <div className="hidden sm:block relative h-60">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[-30px] flex items-end z-0">
              {newsLogos.map((logo, i) => {
                const rotations = [
                  "-rotate-[8deg]",
                  "-rotate-[4deg]",
                  "rotate-[2deg]",
                  "rotate-[10deg]",
                ];
                const overlaps = ["", "-ml-5", "-ml-5", "-ml-5"];

                return (
                  <div
                    key={i}
                    className={`relative w-60 h-40 bg-gray-500 border-black rounded-lg px-6 py-5 
                    transition-all duration-500 transform origin-bottom cursor-pointer
                    hover:-translate-y-16 hover:rotate-0 hover:z-50 hover:shadow-2xl border-4 
                    hover:bg-white hover:border-[var(--primary)]
                    ${rotations[i]} ${overlaps[i]} z-10`}
                    style={{ transformOrigin: "bottom center" }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <Image
                        src={logo.image}
                        alt={logo.text}
                        width={140}
                        height={80}
                        className="object-contain"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cards for Mobile  */}
        <div className="sm:hidden mt-10 space-y-4">
          {newsLogos.slice(0, 2).map((logo, i) => (
            <div
              key={i}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3"
            >
              <div className="w-full flex items-center justify-center">
                <Image
                  src={logo.image}
                  alt={logo.text}
                  width={120}
                  height={70}
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Button */}
        <button className="mt-6 relative overflow-hidden px-5 py-2 border border-[var(--primary)] text-[var(--primary)] rounded-full group">
          <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
            Show More →
          </span>
          <span className="absolute inset-0 bg-[var(--primary)] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-in-out z-0"></span>
        </button>
      </div>
    </section>
  );
}
