import Link from "next/link";
import { SlidersHorizontal, Clock3, Monitor, ShieldCheck } from "lucide-react";
export default function MarketOverview() {
  return <section className="mx-auto max-w-6xl px-4 py-10 text-white"><h2 className="text-2xl font-semibold">Check the instrument before you trade</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">Available symbols, executable prices and contract specifications are shown in your connected MT5 terminal. Check the current spread and trading conditions there.</p><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[
    { icon: SlidersHorizontal, title: "Contract specifications", text: "Review contract size, price digits, minimum lot size and volume steps." },
    { icon: Clock3, title: "Trading sessions", text: "Check the symbol's trading hours and any holiday changes in MT5." },
    { icon: Monitor, title: "Current market prices", text: "Use the bid and ask prices in your connected terminal before placing an order." },
    { icon: ShieldCheck, title: "Margin and risk", text: "Review margin requirements and understand the potential loss before trading." },
  ].map(item => <article key={item.title} className="rounded-xl border border-slate-700 bg-[#101827] p-5"><item.icon className="h-7 w-7 text-[#d6b659]" /><h3 className="mt-4 font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{item.text}</p></article>)}</div><Link href="/platform" className="mt-6 inline-block text-sm text-[#d6b659] underline">MT5 downloads and connection guide</Link></section>;
}
