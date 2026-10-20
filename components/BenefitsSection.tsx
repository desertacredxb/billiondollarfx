import Link from "next/link";
import { Clock, Headset, BadgeCheck, Monitor } from "lucide-react";
import { tradingOffer } from "../lib/tradingOffer";

const cards = [
  { icon: Clock, title: "USDT withdrawals", value: tradingOffer.usdtWithdrawalTime, detail: "Typical processing time, subject to account checks and network conditions." },
  { icon: Monitor, title: "Liquid account", value: `$${tradingOffer.minimumDepositUsd} minimum deposit`, detail: "Commission-free and swap-free trading on MetaTrader 5." },
  { icon: Headset, title: "Client support", value: "Here to help", detail: "Contact the team or track a support ticket from your dashboard." },
  { icon: BadgeCheck, title: "Identity verification", value: "Clear account status", detail: "Complete identity verification and follow your progress in the dashboard." },
];
export default function BenefitsSection() {
  return <section className="text-white py-12"><div className="w-11/12 md:w-4/5 mx-auto grid gap-8 lg:grid-cols-[1fr_2fr] items-start">
    <div><h2 className="text-2xl md:text-3xl font-semibold">Your BDFX account, <span className="text-[var(--primary)]">at a glance.</span></h2><p className="mt-4 leading-7 text-slate-300">Clear account terms and access to verification, funding and support in one dashboard.</p><Link href="/accounts" className="mt-6 inline-block rounded-lg bg-[#ffd700] px-5 py-3 font-semibold text-black">View account details</Link></div>
    <div className="grid gap-5 sm:grid-cols-2">{cards.map(card => <div key={card.title} className="rounded-2xl border border-white/15 bg-[#101827] p-6"><card.icon className="text-[#ffd700]" size={26} aria-hidden="true" /><p className="mt-4 text-sm text-slate-300">{card.title}</p><h3 className="mt-2 text-xl font-semibold">{card.value}</h3><p className="mt-3 text-sm leading-6 text-slate-300">{card.detail}</p></div>)}</div>
  </div></section>;
}
