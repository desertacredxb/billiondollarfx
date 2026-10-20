import { tradingPlatform } from "../../../../lib/tradingPlatform";

export default function WebTraderPage() {
  return <section className="space-y-4 text-white">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold">BDFX WebTrader</h1><p className="mt-2 text-sm text-slate-300">Use your trading account number, MT5 password and the server shown in your account email.</p></div><a href={tradingPlatform.web} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-[#ffd700] px-4 py-3 font-semibold text-black">Open in a new tab</a></div>
    <div className="h-[75vh] min-h-[480px] overflow-hidden rounded-xl border border-slate-700 bg-[#0a0f1d]"><iframe src={tradingPlatform.web} title="BDFX MetaTrader 5 WebTrader" className="h-full w-full border-0" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /></div>
  </section>;
}
