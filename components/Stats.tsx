import { Banknote, Monitor, Wallet, UserCheck } from "lucide-react";
import { tradingOffer } from "../lib/tradingOffer";
export default function Stats() {
  return <section className="mx-auto w-11/12 py-12 text-white md:w-4/5"><h2 className="text-2xl font-semibold md:text-3xl">Your BDFX trading account, at a glance.</h2><div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">{[
    { icon: Banknote, value: `$${tradingOffer.minimumDepositUsd}`, label: "Liquid account minimum deposit" },
    { icon: Monitor, value: "MT5", label: "Mobile, desktop and web access" },
    { icon: Wallet, value: tradingOffer.commission, label: "Trading commission" },
    { icon: UserCheck, value: "ID verification", label: "Identity checks before account access" },
  ].map(item => <div key={item.label} className="rounded-xl border border-slate-700 bg-[#101827] p-5"><item.icon className="h-7 w-7 text-[#d6b659]" /><h3 className="mt-5 text-lg font-semibold">{item.value}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{item.label}</p></div>)}</div></section>;
}
