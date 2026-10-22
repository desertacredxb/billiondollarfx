"use client";
import BenefitsSection from "../../components/BenefitsSection";
import Footer from "../../components/Footer";
import Hero from "../../components/Hero";
import Navbar from "../../components/Navbar";
import mobile from "../../assets/new-mobile.png";

import Stats from "../../components/Stats";
import TradeSection from "../../components/Markets";
import Image from "next/image";
import Button from "../../components/Button";
import logo from "../../assets/bdfx.gif";

import NewsInsights from "../../components/NewsInsights";
import PaymentMethods from "../../components/PaymentMethods";
import InsightsSection from "../../components/Inside_Contact";
import Link from "next/link";
import { useRouter } from "next/navigation";
// import Maintenance from "../../components/Maintenance";

export default function Home() {
  const router = useRouter();
  const handleClick = () => {
    router.push("/register");
    // router.push("https://crm.billiondollarfx.com/#/client/signup");
  };
  return (
    <div className="bg-[var(--bg)]">
      <Navbar />
      <Hero />
      <Stats />

      <BenefitsSection />

      <TradeSection />
      <section className="py-16">
        <div className="relative w-11/12 md:w-4/5 mx-auto">
          <div className="bg-gradient-to-b from-[#0A0F1C] to-[#0B3554] text-white p-8 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between relative z-10">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                <span className="text-[var(--primary)]">Prepare</span> Before You Trade
              </h2>
              <p className="text-lg font-medium mb-5">
                Understand the platform, review contract specifications and set your own risk limits before placing an order.
              </p>

              <Link href="/education" className="inline-block rounded-full bg-[#d6b659] px-6 py-3 font-semibold text-black">Explore trading basics</Link>
            </div>
          </div>

          <div className="absolute -bottom-10 right-0 md:right-[-40px] z-10 hidden md:block">
            <Image
              src={mobile}
              alt="Mobile trading platform"
              className="w-60 md:w-80 object-contain"
            />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="w-11/12 md:w-4/5 mx-auto grid md:grid-cols-3 rounded-2xl overflow-hidden">
          <div className="md:col-span-2 bg-[#34404A] text-white p-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-2 uppercase">
              About{" "}
              <span className="text-[var(--primary)]">
                B<span className="text-xl md:text-2xl">illion</span>D
                <span className="text-xl md:text-2xl">ollar</span>FX
              </span>
            </h3>
            <p className="text-gray-400 mb-4 font-semibold">
              <span className="text-[var(--primary)]">
                Limitless Potential.
              </span>{" "}
              Smarter Trading.
            </p>
            <p className="mb-5 text-gray-300">
              Billion Dollar FX brings account verification, MT5 access, funding requests and client support together. Leveraged trading carries a high risk of loss; review the terms and risks before opening an account.
            </p>

            <ul className="list-none space-y-2 text-xs text-gray-300">
              <li>
                <span className="text-[var(--primary)] text-2xl">•</span> Account setup guides and client support
              </li>
              <li>
                <span className="text-[var(--primary)] text-2xl">•</span>{" "}
                All-in-One Platform: FX, Crypto, Indices, Commodities & Metals
              </li>
              <li>
                <span className="text-[var(--primary)] text-2xl">•</span>{" "}
                Advanced order management features
              </li>
              <li>
                <span className="text-[var(--primary)] text-2xl">• </span>
                Enhanced with new native technical indicators
              </li>
              <li>
                <span className="text-[var(--primary)] text-2xl">• </span>
                Fully customisable trading environment
              </li>
            </ul>
            <Link href="/about">
              <button className="mt-6 relative overflow-hidden px-4 py-1 border border-[var(--primary)] text-[var(--primary)] rounded-full group">
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white text-sm">
                  Explore More →
                </span>
                <span className="absolute inset-0 bg-[var(--primary)] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-in-out z-0"></span>
              </button>
            </Link>
          </div>

          <div className="bg-[#19232D] flex items-center justify-center p-6">
            <Image
              src={logo}
              alt="Billion Dollar FX Logo"
              className="w-40 md:w-52 object-contain"
            />
          </div>
        </div>
      </section>

      <NewsInsights />
      <PaymentMethods />
      <section className="w-11/12 md:w-4/5 mx-auto py-12 space-y-5">
        <h2 className="text-center max-w-3xl mx-auto text-gray-200 text-xl md:text-2xl font-bold">
          Know the Platform.{" "}
          <span className="text-[var(--primary)]">Understand the Risks.</span>
        </h2>
        <p className="text-gray-400 text-center max-w-4xl mx-auto">
          Review the Liquid account terms and country eligibility before registering with Billion Dollar FX.
        </p>
        <div className="flex justify-center">
          <Button text="Create Account" onClick={handleClick} />
        </div>
      </section>
      <Footer />
      {/* <Maintenance /> */}
    </div>
  );
}
