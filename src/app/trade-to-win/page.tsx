import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export const metadata: Metadata = { title: "Previous Trading Campaign | Billion Dollar FX", robots: { index: false, follow: true } };
export default function PreviousCampaignPage() {
  return <><Navbar /><main className="min-h-[70vh] bg-[#0a0f1c] text-white px-5 pt-36 pb-20"><section className="mx-auto max-w-3xl rounded-2xl border border-white/15 bg-[#101827] p-8"><p className="text-[#ffd700] font-semibold">Previous campaign</p><h1 className="mt-3 text-3xl font-semibold">The 2025 Trade to Win campaign has ended.</h1><p className="mt-5 leading-7 text-slate-300">This promotion ran from 1 January to 31 May 2025. It is closed to new entries. Contact the BDFX team if you have a question about an existing campaign claim.</p><div className="mt-7 flex flex-wrap gap-4"><Link href="/contact" className="rounded-lg bg-[#ffd700] px-5 py-3 font-semibold text-black">Contact support</Link><Link href="/ib-broker" className="rounded-lg border border-slate-500 px-5 py-3">Explore the IB programme</Link></div></section></main><Footer /></>;
}
