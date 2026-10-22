import Link from "next/link";
import { Smartphone, Monitor, Globe, ArrowUpRight } from "lucide-react";
import { tradingPlatform } from "../lib/tradingPlatform";

const options = [
  { title: "Android", description: "Install MetaTrader 5 from Google Play.", href: tradingPlatform.android, label: "Get it on Google Play", icon: Smartphone },
  { title: "iPhone & iPad", description: "Install MetaTrader 5 from the App Store.", href: tradingPlatform.ios, label: "Download on the App Store", icon: Smartphone },
  { title: "Windows", description: "Get the desktop installer from the official MetaTrader 5 download page.", href: tradingPlatform.windows, label: "Get MT5 for Windows", icon: Monitor },
  { title: "WebTrader", description: "Open the browser terminal and sign in to your trading account.", href: tradingPlatform.web, label: "Open WebTrader", icon: Globe },
];

export default function PlatformDownloads() {
  return <div className="space-y-10">
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{options.map(option => <section key={option.title} className="rounded-2xl border border-white/15 bg-[#101827] p-6 flex flex-col">
      <option.icon size={32} className="text-[#ffd700]" aria-hidden="true" />
      <h2 className="mt-5 text-xl font-semibold">{option.title}</h2>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-300">{option.description}</p>
      <a href={option.href} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center justify-between gap-3 rounded-lg bg-[#ffd700] px-4 py-3 text-sm font-semibold text-black">{option.label}<ArrowUpRight size={18} aria-hidden="true" /></a>
    </section>)}</div>
    <section className="rounded-2xl border border-white/15 bg-[#101827] p-6 sm:p-8">
      <h2 className="text-2xl font-semibold">Connect your BDFX trading account</h2>
      <ol className="mt-5 list-decimal pl-5 space-y-4 text-slate-300">
        <li>Complete registration and identity verification, then create your trading account from the dashboard.</li>
        <li>Install MetaTrader 5 or open WebTrader using the links above.</li>
        <li>Select the server shown in your account email: <strong className="text-white">{tradingPlatform.serverName}</strong>.</li>
        <li>Sign in with your trading account number and MT5 password from your account details.</li>
      </ol>
      <p className="mt-6 text-sm text-slate-300">Need help connecting? <Link href="/contact" className="text-[#ffd700] underline">Contact BDFX support</Link> or <Link href="/support" className="text-[#ffd700] underline">open a support ticket</Link>.</p>
      <p className="mt-3 text-xs leading-5 text-slate-400">MetaTrader 5 is software provided by MetaQuotes. Account access and available instruments depend on your trading account. For macOS or Linux, visit the <a href={tradingPlatform.officialDownloads} target="_blank" rel="noopener noreferrer" className="underline">official MetaTrader 5 download page</a>.</p>
    </section>
  </div>;
}
