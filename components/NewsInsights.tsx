import Link from "next/link";
import { BookOpen, CalendarDays, LifeBuoy } from "lucide-react";
export default function NewsInsights() {
  return <section className="mx-auto w-11/12 py-12 text-white md:w-4/5"><h2 className="text-2xl font-semibold md:text-3xl">Guides, tools and support</h2><p className="mt-3 text-slate-400">Find the information you need to use your account.</p><div className="mt-7 grid gap-5 md:grid-cols-3">{[
    { href: "/blogs", icon: BookOpen, title: "Trading guides", text: "Browse published articles and platform guides." },
    { href: "/economic-calendar", icon: CalendarDays, title: "Economic calendar", text: "Follow scheduled market events and economic releases." },
    { href: "/help-centre", icon: LifeBuoy, title: "Help centre", text: "Get help with verification, MT5, payments and IB accounts." },
  ].map(item => <Link key={item.href} href={item.href} className="rounded-xl border border-slate-700 bg-[#101827] p-6 transition hover:border-[#d6b659] focus-visible:outline-2 focus-visible:outline-[#d6b659]"><item.icon className="h-7 w-7 text-[#d6b659]" /><h3 className="mt-5 text-lg font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{item.text}</p><span className="mt-5 block text-sm text-[#d6b659]">Explore →</span></Link>)}</div></section>;
}
