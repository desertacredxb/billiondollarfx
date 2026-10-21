"use client";
import { useEffect, useState } from "react";
import api from "../lib/apiClient";
interface ConnectedReport {
  connected: true; generatedAt: string; range: { from: string; to: string; timezone: string };
  totals: { users: number; sessions: number; views: number; leads: number; signups: number; activeUsers30Minutes: number };
  daily: { date: string; views: number }[]; pages: { path: string; views: number }[]; channels: { channel: string; sessions: number }[]; thresholded: boolean;
}
type Report = ConnectedReport | { connected: false };
const count = (value: number) => new Intl.NumberFormat("en-GB").format(value);
export default function WebsiteAnalytics() {
  const [days, setDays] = useState("7"), [refresh, setRefresh] = useState(0);
  const [report, setReport] = useState<Report | null>(null), [loading, setLoading] = useState(true), [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError("");
      try {
        const { data } = await api.get<Report>(`${process.env.NEXT_PUBLIC_API_BASE}/api/analytics/report`, { params: { days }, signal: controller.signal, timeout: 20000 });
        if (!controller.signal.aborted) setReport(data);
      } catch {
        if (!controller.signal.aborted) { setReport(null); setError("Unable to load website reporting. Please retry shortly."); }
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    setReport(null); void load();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void load(); }, 60000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [days, refresh]);
  const connected = report?.connected ? report : null;
  const maximum = Math.max(1, ...(connected?.daily.map(row => row.views) || []));
  return <div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm text-[#d6b659]">Billion Dollar FX · GA4</p><h1 className="mt-2 text-3xl font-semibold">Website Analytics</h1><p className="mt-2 text-sm text-slate-400">Consented website traffic and completed lead/signup events. Reporting dates use Dubai time.</p></div></header>
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-700 bg-[#101827] p-4"><label htmlFor="analytics-period" className="text-sm text-slate-300">Period</label><select id="analytics-period" value={days} onChange={event => setDays(event.target.value)} className="rounded-lg border border-slate-600 bg-[#080f1c] px-3 py-2"><option value="7">Last 7 days</option><option value="28">Last 28 days</option><option value="90">Last 90 days</option></select><button type="button" disabled={loading} onClick={() => setRefresh(value => value + 1)} className="rounded-lg bg-[#d6b659] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50">{loading ? "Loading…" : "Refresh"}</button><p className="text-xs text-slate-400">Refreshes every minute while this page is visible.</p></div>
    {error && <p role="alert" className="rounded-xl border border-red-900 bg-red-950/30 p-5 text-sm">{error}</p>}
    {loading && !report && <p role="status" className="text-sm text-slate-300">Loading website analytics…</p>}
    {report && !report.connected && <section role="status" className="rounded-xl border border-amber-700/60 bg-[#101827] p-6"><h2 className="text-xl font-semibold">Google reporting connection required</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Website tracking is active. A secure server connection is needed to show live reports here. This page uses your existing BDFX administrator login; no separate Google login is needed.</p><p className="mt-3 text-xs text-slate-400">Numbers appear after a successful connection. This page does not use sample visitor or conversion counts.</p></section>}
    {connected && <>
      <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-400"><p>{connected.range.from} – {connected.range.to} · {connected.range.timezone}</p><p>Updated {new Date(connected.generatedAt).toLocaleString("en-GB", { timeZone: "Asia/Dubai" })} Dubai</p></div>
      <section aria-label="Website traffic totals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[["Users", connected.totals.users, "Google's distinct users for the selected period"], ["Page views", connected.totals.views, "Includes repeat views"], ["Sessions", connected.totals.sessions, "Sessions in the selected period"], ["Lead events", connected.totals.leads, "After successful contact submission"], ["Signup events", connected.totals.signups, "After successful email verification"], ["Active users · last 30 minutes", connected.totals.activeUsers30Minutes, "Current activity, independent of the selected period"]].map(([label, value, note]) => <article key={label} className="rounded-xl border border-slate-700 bg-[#101827] p-5"><h2 className="text-sm text-slate-400">{label}</h2><p className="mt-3 text-3xl font-semibold text-white">{count(value as number)}</p><p className="mt-2 text-xs text-slate-400">{note}</p></article>)}</section>
      <section className="rounded-xl border border-slate-700 bg-[#101827] p-5"><h2 className="text-lg font-semibold">Daily page views</h2><div role="img" aria-label={`Daily page views from ${connected.range.from} to ${connected.range.to}. Exact values are in the table below.`} className="mt-5 flex h-36 items-end gap-1 border-b border-slate-700">{connected.daily.map(row => <div key={row.date} aria-hidden="true" title={`${row.date}: ${count(row.views)} views`} className="min-w-0 flex-1 rounded-t bg-[#d6b659]" style={{ height: `${row.views / maximum * 100}%` }} />)}</div><div className="mt-2 flex justify-between text-xs text-slate-400"><span>{connected.range.from}</span><span>{connected.range.to}</span></div><details className="mt-5"><summary className="cursor-pointer text-sm text-[#d6b659]">View daily numbers</summary><div className="mt-3 max-h-64 overflow-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Dubai date</th><th className="p-2 text-right">Page views</th></tr></thead><tbody>{connected.daily.map(row => <tr key={row.date} className="border-t border-slate-800"><td className="p-2">{row.date}</td><td className="p-2 text-right">{count(row.views)}</td></tr>)}</tbody></table></div></details></section>
      <div className="grid gap-6 lg:grid-cols-2"><section className="rounded-xl border border-slate-700 bg-[#101827] p-5"><h2 className="text-lg font-semibold">Top public pages</h2>{connected.pages.length ? <table className="mt-4 w-full text-left text-sm"><thead><tr><th className="py-2">Page</th><th className="py-2 text-right">Views</th></tr></thead><tbody>{connected.pages.map(row => <tr key={row.path} className="border-t border-slate-800"><td className="py-3 break-all">{row.path}</td><td className="py-3 text-right">{count(row.views)}</td></tr>)}</tbody></table> : <p className="mt-4 text-sm text-slate-400">No public page views reported for this period.</p>}</section><section className="rounded-xl border border-slate-700 bg-[#101827] p-5"><h2 className="text-lg font-semibold">Traffic channels</h2>{connected.channels.length ? <table className="mt-4 w-full text-left text-sm"><thead><tr><th className="py-2">Channel</th><th className="py-2 text-right">Sessions</th></tr></thead><tbody>{connected.channels.map(row => <tr key={row.channel} className="border-t border-slate-800"><td className="py-3">{row.channel}</td><td className="py-3 text-right">{count(row.sessions)}</td></tr>)}</tbody></table> : <p className="mt-4 text-sm text-slate-400">No traffic channels reported for this period.</p>}</section></div>
      <p className="text-xs leading-6 text-slate-400">Only visitors who allow analytics are included. Google processing delays and privacy controls can affect reports. Lead/signup numbers count events, not verified sales or unique customers. Private account pages and contact details are excluded. {connected.thresholded && "Google privacy thresholds apply to this report."}</p>
    </>}
  </div>;
}
