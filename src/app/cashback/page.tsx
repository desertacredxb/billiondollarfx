"use client";
import React, { useState } from "react";
import Navbar from "../../../components/Navbar";
import cashback from "../../../assets/cashback.webp";
import cashback2 from "../../../assets/Cashback-03-1.svg";
import Button from "../../../components/Button";
import Image from "next/image";
import Footer from "../../../components/Footer";
import img1 from "../../../assets/icons1/Why-Choose-1.png";
import img2 from "../../../assets/icons1/Why-Choose-2.png";
import img3 from "../../../assets/icons1/Why-Choose-3.png";
import img4 from "../../../assets/icons1/Why-Choose-4.png";
import TradeSection from "../../../components/Markets";
import PaymentMethods from "../../../components/PaymentMethods";
import register from "../../../assets/icons1/register.png";
import fund from "../../../assets/icons1/fund.png";
import trade from "../../../assets/icons1/trade.png";

function Cashback() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const handleClick = () => alert("Account Opening Started!");

  const toggleIndex = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  return (
    <div className="bg-[var(--bg)] text-white">
      <Navbar />
      <section className="w-11/12 md:w-4/5 mx-auto pt-36 pb-20 flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Left Content */}
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold leading-snug mb-4">
            Switch to Billion Dollar FX & Earn
            <span className="text-[var(--primary)]"> 2.5% CASHBACK*</span>
          </h2>
          <h3>Minimum Deposit: 10,000$</h3>
          <p className=" text-gray-400 mt-6">Limited Time Offer</p>
          <p className=" text-gray-400 mb-6 italic">*T&C Apply</p>

          {/* Primary CTA */}
          <Button text="Open Live Account" onClick={handleClick} />
        </div>

        {/* Right Image */}
        <div className="md:w-1/2 flex justify-center md:justify-end">
          <Image src={cashback} alt="Rewards Image" priority />
        </div>
      </section>
      <hr className="border-gray-700 w-11/12 md:w-4/5 mx-auto" />
      <section className="w-11/12 md:w-4/5 mx-auto text-center py-12 space-y-12">
        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-bold text-white ">
          How To <span className="text-[var(--primary)]">Earn Cashback?</span>
        </h2>

        {/* Image */}
        <div className="flex justify-center">
          <Image
            src={cashback2}
            alt="billion dollar fx"
            className=" w-full max-w-5xl"
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
          {/* Secondary CTA */}
          <button
            className="relative overflow-hidden px-6 py-2 border border-[var(--primary)] text-[var(--primary)] rounded-full group text-sm font-medium transition-all"
            onClick={handleClick}
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
              Terms & Conditions
            </span>
            <span className="absolute inset-0 bg-[var(--primary)] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-in-out z-0 rounded-full"></span>
          </button>

          {/* Primary CTA */}
          <Button text="Open Live Account" onClick={handleClick} />
        </div>
      </section>
      <hr className="border-gray-700 w-11/12 md:w-4/5 mx-auto" />
      <section className="w-11/12 md:w-4/5 mx-auto text-center py-16 space-y-12">
        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Why Switch to{" "}
          <span className="text-[var(--primary)]">Billion Dollar FX?</span>
        </h2>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { img: img1, title: "Multiple Opportunities" },
            { img: img2, title: "Powerful Technology" },
            { img: img3, title: "Lowest Spreads" },
            { img: img4, title: "Offers & Rewards" },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-gradient-to-b from-[#0a0f1c] to-[#0B3554] p-6 rounded-xl hover:shadow-xl transition duration-300 group"
            >
              <div className="w-20 h-20 mx-auto mb-4">
                <Image
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <p className="text-white font-medium text-sm md:text-base">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </section>
      <TradeSection />
      <PaymentMethods />

      <section className="w-11/12 md:w-4/5 mx-auto text-center py-12 mb-10 rounded-2xl space-y-12 bg-gradient-to-b from-[#0a0f1c] to-[#0B3554]">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Start Trading with{" "}
          <span className="text-[var(--primary)]">Billion Dollar FX!</span>
        </h2>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 p-6">
          {[
            { img: register, label: "Register" },
            { img: fund, label: "Fund" },
            { img: trade, label: "Trade" },
          ].map((item, index) => (
            <div key={index} className="   px-10 py-5 ">
              <div className="w-20 h-20 mx-auto mb-4">
                <Image
                  src={item.img}
                  alt={item.label}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <p className="text-white font-semibold text-lg">{item.label}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button text="Open Live Account" onClick={handleClick} />
      </section>

      <Footer />
    </div>
  );
}

export default Cashback;
