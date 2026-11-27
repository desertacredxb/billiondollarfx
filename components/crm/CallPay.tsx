"use client";

import { useEffect, useState } from "react";
import api from "../../lib/apiClient";
import { buttonClass, cardClass, crmApi, crmError, dubaiDate, fieldClass, type Agent } from "../../lib/crm";

type PayRow = { id: string; name: string; unique: number; repeats: number; unresolved: number; units: number;
  target: number; currency?: string; dailyMinor?: number; effectiveFrom?: string; payMinor: number | null };
type MonthRow = { id: string; name: string; unique: number; repeat: number; units: number; uncertain: number; missingRates: number; amounts: Record<string, number> };
function money(minor: number | null | undefined, currency?: string) {
  if (minor == null || !currency) return "Rate needed";
  const format = new Intl.NumberFormat("en", { style: "currency", currency });
  return format.format(minor / 10 ** (format.resolvedOptions().maximumFractionDigits ?? 2));
}

export default function CallPay({ day, agents, version }: { day: string; agents: Agent[]; version: number }) {
  const [report, setReport] = useState<{ day: string; rows: PayRow[] } | null>(null);
  const [period, setPeriod] = useState<"day" | "month">("day");
  const [monthReport, setMonthReport] = useState<{ month: string; target: number; rows: MonthRow[] } | null>(null);
  const [error, setError] = useState("");
  const [agent, setAgent] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [effectiveFrom, setEffective] = useState(dubaiDate);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError(""); setReport(null); setMonthReport(null);
    if (period === "month") {
      api.get(crmApi + "/call-pay/month", { params: { month: day.slice(0, 7) }, signal: controller.signal })
        .then(({ data }) => { if (!controller.signal.aborted) setMonthReport(data); })
        .catch(err => { if (!controller.signal.aborted) setError(crmError(err, "Monthly payroll could not be loaded.")); });
      return () => controller.abort();
    }
    api.get(crmApi + "/call-pay", { params: { day }, signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setReport(data); })
      .catch(err => { if (!controller.signal.aborted) setError(crmError(err, "Call pay could not be loaded.")); });
    return () => controller.abort();
  }, [day, period, refresh, version]);
  async function save() {
    setBusy(true); setError("");
    try {
      await api.post(crmApi + "/team/" + agent + "/call-pay-rate", { daily: amount.trim(), currency: currency.trim().toUpperCase(), effectiveFrom });
      setAmount(""); setEditing(false); setRefresh(x => x + 1);
    } catch (err) { setError(crmError(err, "Daily rate could not be saved.")); }
    finally { setBusy(false); }
  }
  return <section className={cardClass} aria-label="Call-based pay">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-lg font-semibold">Call-based pay · {period === "month" ? day.slice(0, 7) : day} Dubai</h2>
      <button type="button" className={buttonClass} onClick={() => setEditing(!editing)}>Set daily rate</button>
    </div>
    <p className="mt-1 text-sm text-slate-300">Estimated from provider-confirmed pickups. Each customer counts once per agent per Dubai day. Late call reports can change the estimate.</p>
    <label className="mt-2 block text-sm">Payroll period <select className={fieldClass + " max-w-40"} value={period} onChange={e => setPeriod(e.target.value === "month" ? "month" : "day")}><option value="day">Selected day</option><option value="month">Selected month</option></select></label>
    {monthReport && <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm">
      <thead><tr>{["Agent", "Daily unique pickups (total)", "Day credits", "Amount by currency", "Days missing rate", "Unmatched pickups"].map(h => <th key={h} className="p-2">{h}</th>)}</tr></thead>
      <tbody>{monthReport.rows.map(row => <tr key={row.id} className="border-t border-slate-700"><th className="p-2">{row.name}</th><td>{row.unique}</td>
        <td>{(row.units / monthReport.target).toFixed(3)}</td><td>{Object.entries(row.amounts).map(([cur, minor]) => money(minor, cur)).join(" + ") || "—"}</td>
        <td>{row.missingRates}</td><td>{row.uncertain}</td></tr>)}</tbody></table></div>}
    {error && <p role="alert">{error}</p>}
    {report?.day === day && <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm">
      <thead><tr>{["Agent", "Unique pickups", "Repeat pickups", "Missing number", "Day credit", "Daily rate", "Estimated pay"].map(h => <th key={h} className="px-2 py-2">{h}</th>)}</tr></thead>
      <tbody>{report.rows.map(row => <tr key={row.id} className="border-t border-slate-700"><th className="px-2 py-2">{row.name}</th>
        <td>{row.unique}</td><td>{row.repeats}</td><td>{row.unresolved}</td><td>{row.units}/{row.target} · {(100 * row.units / row.target).toFixed(1)}%</td>
        <td>{money(row.dailyMinor, row.currency)}</td><td>{money(row.payMinor, row.currency)}</td>
      </tr>)}</tbody>
    </table></div>}
    {editing && <form className="mt-4 grid gap-2 sm:grid-cols-2" onSubmit={event => { event.preventDefault(); void save(); }}>
      <label>Agent<select className={fieldClass} required value={agent} onChange={e => setAgent(e.target.value)}><option value="">Select agent</option>{agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
      <label>Effective from (Dubai)<input type="date" required className={fieldClass} value={effectiveFrom} onChange={e => setEffective(e.target.value)} /></label>
      <label>Full-day rate<input inputMode="decimal" required className={fieldClass} value={amount} onChange={e => setAmount(e.target.value)} /></label>
      <label>Currency code<input maxLength={3} minLength={3} placeholder="INR" required className={fieldClass} value={currency} onChange={e => setCurrency(e.target.value.toUpperCase())} /></label>
      <button disabled={busy} className={buttonClass}>Save effective rate</button>
    </form>}
  </section>;
}
