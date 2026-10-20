"use client";

import { useState } from "react";

export default function IBEarningsCalculator() {
  const [lots, setLots] = useState("");
  const [rate, setRate] = useState("");
  const quantity = Number(lots), perLot = Number(rate);
  const valid = lots !== "" && rate !== "" && Number.isFinite(quantity) && Number.isFinite(perLot) && quantity >= 0 && quantity <= 1000000 && perLot >= 0 && perLot <= 10000;
  const estimate = valid ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(quantity * perLot) : "—";
  return <section className="rounded-2xl border border-white/15 bg-[#101827] p-6 sm:p-8" aria-labelledby="ib-calculator-title">
    <h2 id="ib-calculator-title" className="text-2xl font-semibold">Estimate your IB earnings</h2>
    <p className="mt-3 text-sm leading-6 text-slate-300">Use the commission rate from your approved IB agreement and the eligible closed trading volume you expect.</p>
    <div className="mt-6 grid gap-5 sm:grid-cols-3 items-end">
      <label className="block">Eligible closed lots<input type="number" min="0" max="1000000" step="0.01" inputMode="decimal" value={lots} onChange={event => setLots(event.target.value)} placeholder="Enter lots" className="mt-2 w-full rounded-lg border border-slate-500 bg-[#0b1423] p-3" /></label>
      <label className="block">Agreed commission (USD / lot)<input type="number" min="0" max="10000" step="0.01" inputMode="decimal" value={rate} onChange={event => setRate(event.target.value)} placeholder="Enter your rate" className="mt-2 w-full rounded-lg border border-slate-500 bg-[#0b1423] p-3" /></label>
      <div className="rounded-lg border border-[#ffd700]/40 p-4"><p className="text-sm text-slate-300">Estimated commission</p><output aria-live="polite" className="mt-2 block break-words text-2xl font-semibold text-[#ffd700]">{estimate}</output></div>
    </div>
    <p className="mt-5 text-xs leading-5 text-slate-400">Estimate = eligible closed lots × your agreed commission per lot. This estimate does not change your account balance. Actual commission depends on your approved terms and eligible trading activity.</p>
  </section>;
}
