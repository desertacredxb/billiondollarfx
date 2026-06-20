"use client";
import heroImage from "../assets/hero.png";
import Button from "./Button";
import icon1 from "../assets/icons1/icon.png";
import icon2 from "../assets/icons1/icon2.png";
import icon3 from "../assets/icons1/icon3.png";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Hero() {
  const router = useRouter();
  const handleClick = () => {
    router.push("/register");
  };

  // 👇 Messages to rotate
  const messages = [
    "Global Markets \n Billion-Dollar Precision",
    // "Global Forex \n Local Impact",
    // "Step Into the World of Smart\n Profitable Trades",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 3000); // ⏱️ Change every 3s
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="relative font-montserrat bg-[var(--bg)] py-20 md:pt-0">
      {/* HERO SECTION */}
      <section className="relative md:h-[80vh] w-full text-white">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroImage.src})`,
          }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Centered Content */}
        <div className="relative mx-auto z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-2xl md:text-3xl max-w-2xl font-bold my-6 leading-tight whitespace-pre-wrap">
            <span
              key={currentIndex} // 👈 triggers animation when index changes
              className="block transition-opacity duration-700 ease-in-out opacity-100 animate-fade"
            >
              {messages[currentIndex]}
            </span>
          </h1>
          <p className="text-md md:max-w-3xl mb-6 text-gray-400">
            Access lightning-speed execution, 300+ tradable assets, and elite
            trading conditions trusted by professionals worldwide.
          </p>
          <Button text="Create Account" onClick={handleClick} />
        </div>
      </section>

      {/* OVERLAPPING BOX */}
      <div className="relative mt-6 md:-mt-36 px-4 z-10">
        <div
          className="mx-auto w-full md:w-4/5 rounded-3xl p-6 md:p-12 text-white"
          style={{
            background: "linear-gradient(to bottom, #0A0F1C 0%, #0B3554 100%)",
          }}
        >
          {/* Heading + Button */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 text-center md:text-left">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold leading-tight">
                Launch Your{" "}
                <span className="text-[var(--primary)]">Forex Career</span>{" "}
                Today
              </h2>
              <p className="text-sm italic">
                Start trading in minutes with Billion Dollar FX.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button text="Create Account" onClick={handleClick} />
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-14 text-center md:text-left">
            {/* Card 1 */}
            <div
              className="flex flex-col items-center md:items-start text-white"
              data-aos="zoom-in"
              data-aos-delay="200"
            >
              <Image
                src={icon1}
                alt="Open Account"
                className="w-12 h-12 mb-4"
              />
              <h3 className="text-lg font-semibold mb-2">Open An Account</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Create your account quickly and access 300+ trading instruments
                worldwide.
              </p>
            </div>

            {/* Card 2 */}
            <div
              className="flex flex-col items-center md:items-start text-white"
              data-aos="zoom-in"
              data-aos-delay="400"
            >
              <Image
                src={icon2}
                alt="Make Deposit"
                className="w-12 h-12 mb-4"
              />
              <h3 className="text-lg font-semibold mb-2">Add Funds Securely</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Deposit securely with USDT for the fastest and most reliable
                funding.
              </p>
            </div>

            {/* Card 3 */}
            <div
              className="flex flex-col items-center md:items-start text-white"
              data-aos="zoom-in"
              data-aos-delay="600"
            >
              <Image
                src={icon3}
                alt="Start Trading"
                className="w-12 h-12 mb-4"
              />
              <h3 className="text-lg font-semibold mb-2">Trade Instantly</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Begin trading with confidence and performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
