"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

// Replace these with your actual images
import visa from "../assets/icons/visa.png";
import bitcoin from "../assets/icons/bitcoin.svg";
import ethereum from "../assets/icons/ethereum.svg";
import tether from "../assets/icons/tether.svg";
import solana from "../assets/icons/abc.svg";
import ripple from "../assets/icons/maskgroup.svg";
import mastercard from "../assets/icons/mastercard.png";
import bank from "../assets/icons/bankt.png";
import upi from "../assets/icons/upi.webp";

const paymentIcons = [
  { src: mastercard, alt: "Mastercard" },
  { src: visa, alt: "Visa" },
  { src: bitcoin, alt: "Bitcoin" },
  { src: ethereum, alt: "Ethereum" },
  { src: tether, alt: "Tether" },
  { src: solana, alt: "Solana" },
  { src: ripple, alt: "Ripple" },
  { src: bank, alt: "Bank Transfer" },
  { src: upi, alt: "UPI" },
];

export default function PaymentMethods() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Infinite loop to cycle active icon
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % paymentIcons.length);
    }, 1000); // change image every 1 second
    return () => clearInterval(interval);
  }, []);

  return (
    <section className=" py-12 text-white">
      <div className="w-11/12 md:w-4/5 mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Icons Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full md:w-1/2">
          {paymentIcons.map((icon, i) => (
            <div key={i} className="w-20 h-20">
              <Image
                src={icon.src}
                alt={icon.alt}
                width={80}
                height={80}
                className="w-full h-full object-contain transition-all duration-500"
                style={{
                  filter:
                    i === activeIndex ? "grayscale(0%)" : "grayscale(100%)",
                  opacity: i === activeIndex ? 1 : 0.4,
                  transition: "all 0.5s ease-in-out",
                }}
              />
            </div>
          ))}
        </div>

        {/* Text Section */}
        <div className="md:w-1/2 flex flex-col justify-between gap-8 ">
          <h2 className="text-2xl md:text-3xl font-bold mb-5 ">
            Instant Deposits,
            <span className="text-[var(--primary)]"> Smooth Withdrawals</span>
          </h2>
          <p className="text-gray-400 mx-auto md:mx-0 ">
            Say goodbye to delays. Our deposit and withdrawal system is built
            for speed, ease, and reliability.
          </p>
        </div>
      </div>
    </section>
  );
}
