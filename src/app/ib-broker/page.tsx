import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import IBEarningsCalculator from "../../../components/IBEarningsCalculator";

export const metadata: Metadata = {
  title: "Introducing Broker Programme | Billion Dollar FX",
  description: "Apply to the BDFX Introducing Broker programme, complete identity verification, share your referral link and track referred clients from your partner dashboard.",
  alternates: { canonical: "https://www.billiondollarfx.com/ib-broker" },
};

export default function IntroducingBrokerPage() {
  return <><Navbar /><main className="bg-[#0a0f1c] text-white px-5 pt-32 pb-20"><div className="mx-auto max-w-6xl space-y-12">
    <section className="max-w-3xl"><p className="text-sm font-semibold text-[#ffd700]">BDFX Partners</p><h1 className="mt-3 text-3xl md:text-5xl font-semibold leading-tight">Build your introducing broker business with BDFX.</h1><p className="mt-5 leading-7 text-slate-300">Apply through your client account, complete identity verification and manage your referrals from one dashboard.</p><div className="mt-7 flex flex-wrap gap-4"><Link href="/register?intent=ib" className="rounded-lg bg-[#ffd700] px-6 py-3 font-semibold text-black">Apply as an IB partner</Link><Link href="/introducing-broker" className="rounded-lg border border-slate-500 px-6 py-3 font-semibold">Existing client? Open IB dashboard</Link></div></section>
    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[
      ["1. Register", "Create your BDFX profile and verify your email."],
      ["2. Verify identity", "Complete identity verification. UAE clients and UAE-issued identity documents are not accepted."],
      ["3. Submit your IB application", "Answer the partner onboarding questions. Eligible applications can be approved automatically after a successful live identity check."],
      ["4. Manage referrals", "Copy your referral link and track your referred clients and available commission in the IB dashboard."],
    ].map(([title, description]) => <div key={title} className="rounded-xl border border-white/15 bg-[#101827] p-6"><h2 className="font-semibold">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-300">{description}</p></div>)}</section>
    <IBEarningsCalculator />
    <section className="rounded-2xl border border-white/15 p-7"><h2 className="text-2xl font-semibold">Your partner dashboard</h2><ul className="mt-5 list-disc pl-5 space-y-3 text-slate-300"><li>Your unique referral link.</li><li>A list of clients attributed to your IB account.</li><li>Client verification status and linked trading account numbers.</li><li>Your available commission balance and transfers to your own trading account, subject to the applicable minimum and account checks.</li></ul><p className="mt-6 text-sm leading-6 text-slate-300">Commission rates and eligibility are governed by your approved IB terms. Contact the partner team if you need help understanding your agreement.</p><Link href="/contact" className="mt-5 inline-block text-[#ffd700] underline">Contact the partner team</Link></section>
    <section className="rounded-xl border border-white/15 p-6"><h2 className="font-semibold">Previous promotions</h2><p className="mt-3 text-sm leading-6 text-slate-300">The February–April 2025 IB trip promotion has ended. No current reward campaign is advertised on this page. For questions about a previous promotion, contact support.</p></section>
  </div></main><Footer /></>;
}
