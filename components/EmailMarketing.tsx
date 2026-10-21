"use client";
import { useEffect, useState } from "react";
import api from "../lib/apiClient";
type Report = { registered: number; optedIn: number; enrolled: number; accepted: number; held: number; unsubscribed: number; paused: boolean; sendingConfigured: boolean; dailyLimit: number; lastSyncAt: string | null; plan: { day: number; subject: string; heading: string; body: string; action: string; path: string; pendingKycOnly?: boolean }[] };
const endpoint = `${process.env.NEXT_PUBLIC_API_BASE}/api/email-marketing`;
export default function EmailMarketing() {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try { const { data } = await api.get<Report>(`${endpoint}/report`, { signal: controller.signal, timeout: 15000 }); setReport(data); setError(""); }
      catch { if (!controller.signal.aborted) setError("Unable to load current email marketing status. Refresh to try again."); }
    }
    load(); const timer = setInterval(load, 60000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [refresh]);
  async function toggle() {
    if (!report || busy || error) return;
    setBusy(true);
    try { const { data } = await api.patch<Report>(`${endpoint}/state`, { paused: !report.paused }, { timeout: 15000 }); setReport(data); }
    catch { setError("Delivery change could not be confirmed. Refresh to check the current state."); }
    finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-6xl space-y-6"><div className="flex flex-wrap justify-between gap-4"><div><h1 className="text-2xl font-semibold">Email Marketing</h1><p className="mt-2 text-sm text-slate-300">Seven-day sequence · support@billiondollarfx.com · 11:00 Dubai time</p></div><button type="button" onClick={() => setRefresh(v => v + 1)} className="rounded-lg border border-slate-600 px-4 py-2">Refresh</button></div>{error && <p role="alert" className="rounded-lg border border-amber-600 p-4">{error}</p>}{!report && !error && <p role="status">Loading campaign status…</p>}{report && <><section className="rounded-xl border border-slate-700 bg-[#101827] p-5 space-y-3"><h2 className="font-semibold">{error ? "Status needs refresh" : report.paused || !report.sendingConfigured ? "Delivery paused" : "Delivery active"}</h2><p className="text-sm text-slate-300">Only verified clients who explicitly opt in enter the sequence. New eligible clients are checked automatically every minute. Existing accounts are not automatically subscribed.</p>{!report.sendingConfigured && <p className="text-sm text-amber-300">Confirm the mailbox sending allowance and configure delivery before resuming.</p>}<p className="text-sm">Daily campaign cap: {report.dailyLimit || "Not configured"}. Up to one email per minute; each client receives at most one sequence email per day.</p><button type="button" onClick={toggle} disabled={busy || !!error || (report.paused && !report.sendingConfigured)} className="rounded-lg bg-[#d6b659] text-black px-4 py-2 font-semibold disabled:opacity-50">{busy ? "Saving…" : report.paused ? "Resume delivery" : "Pause delivery"}</button></section><dl className="grid grid-cols-2 lg:grid-cols-3 gap-3">{([["Registered clients", report.registered], ["Opted in", report.optedIn], ["In sequence", report.enrolled], ["Accepted by mail server", report.accepted], ["Held for review", report.held], ["Unsubscribed", report.unsubscribed]] as const).map(([label, value]) => <div key={label} className="rounded-xl border border-slate-700 p-4"><dt className="text-sm text-slate-400">{label}</dt><dd className="mt-2 text-2xl font-semibold">{value}</dd></div>)}</dl><p className="text-xs text-slate-400">Mail server acceptance does not confirm inbox delivery. Uncertain sends are held for review to avoid duplicate emails. Last enrolment check: {report.lastSyncAt ? new Date(report.lastSyncAt).toLocaleString("en-GB", { timeZone: "Asia/Dubai" }) + " Dubai" : "Not run yet"}.</p><section className="space-y-3"><h2 className="text-xl font-semibold">Seven-day email preview</h2>{report.plan.map(day => <details key={day.day} className="rounded-xl border border-slate-700 p-4"><summary className="cursor-pointer font-medium">Day {day.day} · {day.subject}{day.pendingKycOnly ? " · KYC pending only" : ""}</summary><div className="mt-4 space-y-3 text-sm text-slate-300"><p className="font-semibold">{day.heading}</p><p className="whitespace-pre-line leading-6">{day.body}</p><p>{day.action}: https://www.billiondollarfx.com{day.path}</p><p>Every email includes support details, a risk notice and unsubscribe link.</p></div></details>)}</section></>}</div>;
}
