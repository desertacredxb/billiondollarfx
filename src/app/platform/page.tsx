import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import PlatformDownloads from "../../../components/PlatformDownloads";

export const metadata: Metadata = {
  title: "MetaTrader 5 Downloads & Setup | Billion Dollar FX",
  description: "Download MetaTrader 5 for Android, iPhone and Windows, open WebTrader, and follow the BDFX account connection guide.",
  alternates: { canonical: "https://www.billiondollarfx.com/platform" },
};

export default function PlatformPage() {
  return <><Navbar /><main className="bg-[#0a0f1c] text-white px-5 pt-32 pb-20"><div className="mx-auto max-w-6xl">
    <p className="text-sm font-semibold text-[#ffd700]">BDFX Trading Platform</p>
    <h1 className="mt-3 text-3xl md:text-5xl font-semibold">MetaTrader 5, on your device.</h1>
    <p className="mt-5 max-w-2xl text-slate-300 leading-7">Download MT5 for mobile or desktop, or access WebTrader in your browser. Use the connection guide below to sign in to your BDFX trading account.</p>
    <div className="mt-7 mb-12 flex flex-wrap gap-4"><Link href="/register" className="rounded-lg bg-[#ffd700] px-6 py-3 font-semibold text-black">Create account</Link><Link href="/login" className="rounded-lg border border-white/40 px-6 py-3 font-semibold">Client login</Link></div>
    <PlatformDownloads />
  </div></main><Footer /></>;
}
