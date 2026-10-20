import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { tradingOffer } from "../../../lib/tradingOffer";

export const metadata: Metadata = {
  title: "Liquid Trading Account | Billion Dollar FX",
  description: "Explore the BDFX Liquid account: $50 minimum deposit, leverage up to 1:500, commission-free and swap-free trading on MetaTrader 5.",
  alternates: { canonical: "https://www.billiondollarfx.com/accounts" },
};

const details = [
  ["Minimum deposit", `$${tradingOffer.minimumDepositUsd} USD`],
  ["Maximum leverage", `Up to ${tradingOffer.maximumLeverage}`],
  ["Commission", tradingOffer.commission],
  ["Swaps", tradingOffer.swaps],
  ["Spreads", tradingOffer.spreads],
  ["Platform", tradingOffer.platform],
  ["USDT withdrawals", `Typically ${tradingOffer.usdtWithdrawalTime}, subject to checks and network conditions`],
];

export default function AccountsPage() {
  return <><Navbar /><main className="bg-[#0a0f1c] text-white px-5 pt-32 pb-20"><div className="mx-auto max-w-5xl">
    <p className="text-sm font-semibold text-[#ffd700]">BDFX Trading Accounts</p><h1 className="mt-3 text-3xl md:text-5xl font-semibold">The Liquid account.</h1>
    <p className="mt-5 max-w-2xl leading-7 text-slate-300">Clear account terms, access to MetaTrader 5, and a single dashboard for verification, trading accounts and funding.</p>
    <div className="mt-10 grid gap-7 md:grid-cols-[1fr_2fr]">
      <section className="rounded-2xl border border-[#ffd700]/50 bg-[#101827] p-7"><h2 className="text-2xl font-semibold">{tradingOffer.accountName}</h2><p className="mt-7 text-sm text-slate-300">Minimum deposit</p><p className="mt-2 text-5xl font-semibold">$50 <span className="text-lg text-slate-300">USD</span></p><p className="mt-5 text-slate-300">{tradingOffer.commission}<br />{tradingOffer.swaps}<br />MetaTrader 5</p><Link href="/register" className="mt-8 block rounded-lg bg-[#ffd700] px-5 py-3 text-center font-semibold text-black">Open account</Link><Link href="/login" className="mt-4 block text-center text-sm text-[#ffd700] underline">Already registered? Sign in</Link></section>
      <section className="rounded-2xl border border-white/15 bg-[#101827] p-6"><h2 className="text-xl font-semibold">Account details</h2><dl className="mt-4 divide-y divide-white/10">{details.map(([label, value]) => <div key={label} className="grid gap-2 py-4 sm:grid-cols-2"><dt className="text-slate-300">{label}</dt><dd className="font-medium">{value}</dd></div>)}</dl></section>
    </div>
    <section className="mt-10 grid gap-5 sm:grid-cols-3">{[
      ["1. Register", "Create your profile and confirm your email address."],
      ["2. Verify your identity", "Complete identity verification and check the result in your dashboard."],
      ["3. Create your trading account", "Open your trading account, connect to MT5 and review funding options."],
    ].map(([title, description]) => <div key={title} className="rounded-xl border border-white/15 p-5"><h2 className="font-semibold">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-300">{description}</p></div>)}</section>
    <p className="mt-8 text-sm leading-6 text-slate-300">Instrument availability and trading conditions are shown in MT5. We don’t accept UAE clients or UAE-issued identity documents. Read the <Link href="/Restricted-Countries" className="text-[#ffd700] underline">eligibility policy</Link> and <Link href="/risk-discloser" className="text-[#ffd700] underline">risk disclosure</Link> before opening an account.</p>
  </div></main><Footer /></>;
}
