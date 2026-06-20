"use client";
import { div } from "framer-motion/client";
import Button from "../../../components/Button";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import InsightsSection from "../../../components/Inside_Contact";

const TradingAccounts = () => {
  const handleClick = () => alert("Account Opening Started!");

  return (
    <div>
      <Navbar />
      <section className="bg-[var(--bg)] text-white px-4 py-12 md:pt-36">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl text-center font-bold text-[var(--primary)] mb-4">
            Trading Accounts:
          </h2>
          <p className="text-gray-300 max-w-2xl mb-12 text-center mx-auto">
            Unlock feature-packed, commission-free trading accounts designed for
            today&#39;s traders. Sign up now and enjoy the benefits of our most
            popular account.
          </p>

          {/* Cards */}
          <div className="grid gap-8 md:grid-cols-3 mb-16">
            {[
              {
                title: "Standard",
                desc: "Our most popular account. Great for all types of traders.",
                deposit: "$10",
                spread: "From 0.2 pips",
                commission: "No Commission",
                leverage: "1:500",
                instruments:
                  "Forex, metals, cryptocurrencies, energies, stocks, indices",
              },
              {
                title: "Pro",
                desc: "Our instant execution account, with zero commission & low spread.",
                deposit: "$2500",
                spread: "From 0.1 pips",
                commission: "No Commission",
                leverage: "1:500",
                instruments:
                  "Forex, metals, cryptocurrencies, energies, stocks, indices",
              },
              {
                title: "ECN",
                desc: "Our instant execution account, with zero commission & low sprea",
                deposit: "$5000",
                spread: "From 0.0 pips",
                commission: "Up to $3.50 each side per lot",
                leverage: "1:500",
                instruments:
                  "Forex, metals, cryptocurrencies, energies, stocks, indices",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-gradient-to-b from-[#0c2d47] to-[#0c243c] rounded-2xl p-6 text-white flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-white/80 mb-4">{item.desc}</p>
                  <hr className="border-white/10 mb-4" />

                  <ul className="space-y-3 text-sm">
                    <li>
                      <p className="text-white/70">Minimum Deposit</p>
                      <p className="font-bold">{item.deposit}</p>
                    </li>
                    <li>
                      <p className="text-white/70">Spread</p>
                      <p className="font-bold">{item.spread}</p>
                    </li>
                    <li>
                      <p className="text-white/70">Commission</p>
                      <p className="font-bold">{item.commission}</p>
                    </li>
                    <li>
                      <p className="text-white/70">Maximum Leverage</p>
                      <p className="font-bold">{item.leverage}</p>
                    </li>
                    <li>
                      <p className="text-white/70">Instruments</p>
                      <p className="font-bold">{item.instruments}</p>
                    </li>
                  </ul>
                </div>

                <Button
                  text="Open Account"
                  onClick={handleClick}
                  className="mt-6 px-6 py-2 rounded-full bg-cyan-500 hover:bg-cyan-600 transition"
                />
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="overflow-auto">
            <table className="min-w-full border-collapse text-sm text-left">
              <thead>
                <tr className="bg-[#12354D] text-white">
                  <th className="p-3 font-semibold"> </th>
                  <th className="p-3 font-semibold">Standard</th>
                  <th className="p-3 font-semibold">Pro</th>
                  <th className="p-3 font-semibold">ECN</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {[
                  ["Minimum Deposit", "$10", "$2500", "$5000"],
                  ["Spread", "From 0.2 pips", "From 0.1 pips", "From 0.0 pips"],
                  [
                    "Commission",
                    "No commission",
                    "No commission",
                    "Up to $3.50 each side per lot",
                  ],
                  ["Maximum Leverage", "1:500", "1:500", "1:500"],
                  [
                    "Instruments",
                    "Forex, metals, cryptocurrencies, energies, stocks, indices",
                    "Forex, metals, cryptocurrencies, energies, stocks, indices",
                    "Forex, metals, cryptocurrencies, energies, stocks, indices",
                  ],
                  ["Minimum lot size", "0.01 pips", "0.01 pips", "0.01 pips"],
                  [
                    "Maximum lot size",
                    "200 (7:00 - 20:59 GMT +0), 60 (21:00 - 6:59 GMT +0)",
                    "200 (7:00 - 20:59 GMT +0), 60 (21:00 - 6:59 GMT +0)",
                    "200 (7:00 - 20:59 GMT +0), 60 (21:00 - 6:59 GMT +0)",
                  ],
                  [
                    "Maximum number of positions",
                    "Unlimited",
                    "Unlimited",
                    "Unlimited",
                  ],
                  ["Hedged Margin", "0%", "0%", "0%"],
                  ["Margin Call", "30%", "30%", "30%"],
                  [
                    "Stop out",
                    "0% (see details about stocks)",
                    "0% (see details about stocks)",
                    "0% (see details about stocks)",
                  ],
                  ["Order execution", "Market", "Instant / Market", "Market"],
                  ["Swap-Free", "Available", "Available", "Available"],
                ].map((row, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-[#0B1F31]" : "bg-[#0E2436]"}
                  >
                    {row.map((cell, j) => (
                      <td key={j} className="p-3 border border-[#1E3A56]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <InsightsSection />
      <Footer />
    </div>
  );
};

export default TradingAccounts;
