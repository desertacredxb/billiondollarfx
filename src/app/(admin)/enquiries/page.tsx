"use client";

import { useEffect, useState } from "react";
import api from "../../../../lib/apiClient";

type Enquiry = { _id: string; reference: string; name: string; email: string; phone: string; country: string; message: string; createdAt: string; status: "new" | "contacted" | "closed"; note: string; notificationStatus: string; marketingConsent: boolean };
type Result = { data: Enquiry[]; page: number; limit: number; total: number };

export default function EnquiriesPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const abort = new AbortController();
    setBusy(true); setError("");
    api.get<Result>(`${process.env.NEXT_PUBLIC_API_BASE}/api/enquiries`, { params: { page, limit: 25, status }, signal: abort.signal })
      .then(response => setResult(response.data))
      .catch(error => { if (!abort.signal.aborted) setError(error.response?.data?.message || "Unable to load enquiries."); })
      .finally(() => { if (!abort.signal.aborted) setBusy(false); });
    return () => abort.abort();
  }, [page, status, reload]);

  async function save(item: Enquiry) {
    setSaving(item._id); setError("");
    try { await api.patch(`${process.env.NEXT_PUBLIC_API_BASE}/api/enquiries/${item._id}`, { status: item.status, note: item.note }); setReload(value => value + 1); }
    catch (error) { setError(api.isAxiosError(error) ? error.response?.data?.message || "Unable to save enquiry." : "Unable to save enquiry."); }
    finally { setSaving(null); }
  }

  function edit(id: string, patch: Partial<Enquiry>) {
    setResult(value => value ? { ...value, data: value.data.map(item => item._id === id ? { ...item, ...patch } : item) } : value);
  }

  return <div className="max-w-6xl mx-auto space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-semibold">Website enquiries</h1><p className="mt-2 text-slate-300">Contact requests received through the BDFX website.</p></div><button onClick={() => setReload(value => value + 1)} disabled={busy} className="rounded-lg border border-slate-500 px-4 py-2 disabled:opacity-50">Refresh</button></div>
    <label className="block max-w-xs">Filter by status<select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} className="mt-2 w-full rounded-lg border border-slate-500 bg-[#0b1423] p-3"><option value="">All enquiries</option><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></label>
    {error && <p role="alert" className="text-red-300">{error}</p>}
    {busy ? <p role="status">Loading enquiries…</p> : !result?.data.length ? <p className="rounded-xl border border-white/15 p-7 text-slate-300">No enquiries found.</p> : <div className="space-y-5">{result.data.map(item => <article key={item._id} className="rounded-xl border border-white/15 bg-[#101827] p-5 space-y-4">
      <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-semibold">{item.name}</h2><p className="mt-1 text-sm text-slate-300">{item.reference} · {new Date(item.createdAt).toLocaleString()}</p></div><span className="text-sm text-slate-300">Notification: {item.notificationStatus}</span></div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm"><a className="text-[#ffd700] underline" href={`mailto:${encodeURIComponent(item.email)}`}>{item.email}</a>{item.phone && <span>{item.phone}</span>}<span>{item.country}</span></div>
      <p className="whitespace-pre-wrap break-words text-slate-200">{item.message}</p>
      <p className="text-xs text-slate-400">Marketing updates: {item.marketingConsent ? "Client opted in" : "No marketing consent"}</p>
      <div className="grid gap-4 sm:grid-cols-[180px_1fr]"><label>Status<select value={item.status} onChange={event => edit(item._id, { status: event.target.value as Enquiry["status"] })} className="mt-2 w-full rounded-lg border border-slate-500 bg-[#0b1423] p-3"><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></label><label>Team notes<textarea maxLength={2000} rows={2} value={item.note} onChange={event => edit(item._id, { note: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-500 bg-[#0b1423] p-3" /></label></div>
      <button onClick={() => save(item)} disabled={saving === item._id} className="rounded-lg bg-[#ffd700] px-5 py-2 font-semibold text-black disabled:opacity-50">{saving === item._id ? "Saving…" : "Save changes"}</button>
    </article>)}</div>}
    {result && result.total > result.limit && <nav aria-label="Enquiry pages" className="flex items-center justify-between gap-3"><button disabled={page === 1 || busy} onClick={() => setPage(value => value - 1)} className="rounded-lg border border-slate-500 px-4 py-2 disabled:opacity-40">Previous</button><span>Page {page} of {Math.ceil(result.total / result.limit)}</span><button disabled={page * result.limit >= result.total || busy} onClick={() => setPage(value => value + 1)} className="rounded-lg border border-slate-500 px-4 py-2 disabled:opacity-40">Next</button></nav>}
  </div>;
}
