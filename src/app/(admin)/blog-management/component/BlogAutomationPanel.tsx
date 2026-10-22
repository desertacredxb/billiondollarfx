"use client";
import { useEffect, useState } from "react";
import { authenticatedFetch } from "../../../../../lib/apiClient";

type State = {
  enabled: boolean; environmentDisabled: boolean; cadenceDays: number; starterArticles: number;
  nextPublishAt: string | null; lastRunAt: string | null; lastOutcome: string; lastError: string;
  queued: { title: string; slug: string; scheduledAt: string | null }[];
  history: { at: string; outcome: string; slug: string; code: string }[];
};
const dateLabel = (value: string | null) => value ? new Date(value).toLocaleString("en-GB", { timeZone: "Asia/Dubai", dateStyle: "medium", timeStyle: "short" }) : "Waiting for the first run";

export default function BlogAutomationPanel({ onChange }: { onChange: () => void }) {
  const [data, setData] = useState<State | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await authenticatedFetch("/api/blogs/automation"); const result = await response.json();
        if (!response.ok || !result.success) throw new Error("Automatic publishing status is unavailable.");
        if (active) setData(result.data);
      } catch { if (active) setError("Automatic publishing status is unavailable. Try refreshing the page."); }
    }
    void load(); return () => { active = false; };
  }, []);
  async function toggle() {
    if (!data || busy) return;
    setBusy(true); setError("");
    try {
      const response = await authenticatedFetch("/api/blogs/automation", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: !data.enabled }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Could not update automatic publishing.");
      setData(result.data); onChange();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not update automatic publishing."); }
    finally { setBusy(false); }
  }
  const headTime = data?.queued[0]?.scheduledAt;
  const nextTime = data?.nextPublishAt && headTime ? new Date(Math.max(Date.parse(data.nextPublishAt), Date.parse(headTime))).toISOString() : data?.nextPublishAt || headTime || null;
  return <section aria-label="Automatic blog publishing" className="max-w-7xl mx-auto mb-6 rounded-2xl border border-[#927948]/40 bg-[#121829] p-5 text-sm">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold text-white">Auto SEO &amp; blogs</h2>
        <p className="mt-1 max-w-2xl text-slate-300">Publish one educational article every seven days. Six starter guides are included. Add your own drafts to the weekly queue to continue the series.</p>
        <p className="mt-2 text-xs text-slate-400">SEO titles, descriptions and image text are filled when left blank. Published articles receive structured data, relevant guide links and sitemap updates.</p>
      </div>
      {data && <button type="button" disabled={busy || data.environmentDisabled} onClick={toggle} className="rounded-xl border border-[#927948] px-4 py-2 font-semibold text-[#c3aa76] disabled:opacity-50">
        {busy ? "Updating…" : data.enabled ? "Pause publishing" : "Resume publishing"}
      </button>}
    </div>
    {error && <p role="alert" className="mt-3 text-rose-300">{error}</p>}
    {!data && !error && <p role="status" className="mt-3 text-slate-400">Loading publishing status…</p>}
    {data && <>
      <dl className="mt-4 grid gap-4 text-xs sm:grid-cols-3">
        <div><dt className="text-slate-400">Publishing</dt><dd className="mt-1 font-semibold text-white">{data.environmentDisabled ? "Disabled in hosting settings" : data.enabled ? "Enabled" : "Paused"}</dd></div>
        <div><dt className="text-slate-400">Next slot · Dubai time</dt><dd className="mt-1 font-semibold text-white">{data.enabled && data.queued.length ? dateLabel(nextTime) : data.enabled ? "Add another draft to the queue" : "Paused"}</dd></div>
        <div><dt className="text-slate-400">Last check · Dubai time</dt><dd className="mt-1 font-semibold text-white">{dateLabel(data.lastRunAt)}</dd></div>
      </dl>
      {data.lastError && <p role="status" className="mt-3 text-amber-300">The last publishing attempt needs a retry. Existing articles remain available.</p>}
      <details className="mt-4 border-t border-slate-700 pt-3">
        <summary className="cursor-pointer font-semibold text-slate-200">Queue and recent activity</summary>
        <ul className="mt-3 space-y-2 text-xs text-slate-300">{data.queued.map(post => <li key={post.slug}>{post.title} <span className="text-slate-500">· queued</span></li>)}{!data.queued.length && <li>No drafts are queued.</li>}</ul>
        <ul className="mt-4 space-y-2 text-xs text-slate-400">{data.history.slice(-8).reverse().map((event, index) => <li key={`${event.at}-${index}`}>{dateLabel(event.at)} · {event.outcome.replace(/_/g, " ")}{event.slug ? ` · ${event.slug}` : ""}</li>)}</ul>
      </details>
    </>}
  </section>;
}
