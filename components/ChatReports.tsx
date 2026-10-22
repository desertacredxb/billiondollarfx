"use client";
import { useEffect, useState, type FormEvent } from "react";
import api from "../lib/apiClient";
import { chatCopy, chatLanguages, type ChatLanguage, type TopicId } from "../lib/supportChat";
type Contact = { name: string; email: string; phone: string; country: string; privacyAcceptedAt: string };
type Activity = { id: string; type: string; language: ChatLanguage; topic?: TopicId; question?: number; at: string };
type Session = { _id: string; reference: string; language: ChatLanguage; createdAt: string; lastActiveAt: string; consentedAt: string; expiresAt: string; guideVersion: number; status: "new" | "contacted" | "closed"; note: string; contact?: Contact; events?: Activity[] };
type Report = { data: Session[]; total: number; page: number; limit: number; summary: { sessions: number; contacts: number; active: number } };
const today = () => new Date(Date.now() + 4 * 3600000).toISOString().slice(0, 10);
const when = (value: string) => new Date(value).toLocaleString("en-GB", { timeZone: "Asia/Dubai" });
const languageName = (value: string) => chatLanguages.find(item => item.id === value)?.label || value;
const activityLabels: Record<string, string> = { open: "Guide opened", close: "Guide closed", language: "Language changed", topic: "Topic selected", answer: "Question selected", guide: "Guide link opened", team: "Contact page opened" };
const inputClass = "mt-1 w-full rounded-lg border border-slate-600 bg-[#0b1423] p-2";
export default function ChatReports() {
  const [draft, setDraft] = useState({ from: today(), to: today(), language: "", status: "", contacts: false });
  const [filters, setFilters] = useState(draft), [page, setPage] = useState(1), [refresh, setRefresh] = useState(0);
  const [report, setReport] = useState<Report | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null), [detail, setDetail] = useState<Session | null>(null), [detailError, setDetailError] = useState("");
  const [saving, setSaving] = useState(false), [saved, setSaved] = useState(false);
  useEffect(() => {
    const abort = new AbortController(); setBusy(true); setError("");
    api.get<Report>(`${process.env.NEXT_PUBLIC_API_BASE}/api/support-chat/admin/sessions`, { params: { ...filters, contacts: filters.contacts ? "true" : "", page }, signal: abort.signal })
      .then(response => setReport(response.data))
      .catch(error => { if (!abort.signal.aborted) setError(error.response?.data?.message || "Unable to load saved chat sessions."); })
      .finally(() => { if (!abort.signal.aborted) setBusy(false); });
    return () => abort.abort();
  }, [filters, page, refresh]);
  useEffect(() => {
    const timer = setInterval(() => { if (document.visibilityState === "visible") setRefresh(value => value + 1); }, 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!selected) return;
    const abort = new AbortController(); setDetail(null); setDetailError(""); setSaved(false);
    api.get<{ data: Session }>(`${process.env.NEXT_PUBLIC_API_BASE}/api/support-chat/admin/sessions/${selected}`, { signal: abort.signal })
      .then(response => setDetail(response.data.data))
      .catch(error => { if (!abort.signal.aborted) setDetailError(error.response?.data?.message || "Unable to load this session."); });
    return () => abort.abort();
  }, [selected]);
  function apply(event: FormEvent) { event.preventDefault(); setFilters({ ...draft }); setPage(1); }
  async function save() {
    if (!detail || saving) return;
    const item = detail; setSaving(true); setDetailError(""); setSaved(false);
    try {
      await api.patch(`${process.env.NEXT_PUBLIC_API_BASE}/api/support-chat/admin/sessions/${item._id}`, { status: item.status, note: item.note });
      setSaved(true); setRefresh(value => value + 1);
    } catch (error) { setDetailError(api.isAxiosError(error) ? error.response?.data?.message || "Unable to save." : "Unable to save."); }
    finally { setSaving(false); }
  }
  return <div className="mx-auto max-w-7xl space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-semibold">Chat Reports</h1><p className="mt-2 text-slate-300">Saved BDFX Help sessions and visitor follow-up requests.</p></div><button type="button" disabled={busy} onClick={() => setRefresh(value => value + 1)} className="rounded-lg border border-slate-500 px-4 py-2 disabled:opacity-50">{busy ? "Refreshing…" : "Refresh"}</button></div>
    <p className="rounded-xl border border-slate-700 bg-[#101827] p-4 text-sm leading-6 text-slate-300">Only sessions visitors choose to save appear here. Counts are sessions, not unique people or verified accounts. Guests have no contact details until they submit the form. Activity is kept for up to 90 days; earlier unsaved chats cannot be recovered. Times and date filters use Dubai time.</p>
    <form onSubmit={apply} className="grid items-end gap-3 rounded-xl border border-slate-700 p-4 sm:grid-cols-2 lg:grid-cols-6">
      <label>From<input type="date" required value={draft.from} onChange={event => setDraft(value => ({ ...value, from: event.target.value }))} className={inputClass} /></label>
      <label>To<input type="date" required value={draft.to} onChange={event => setDraft(value => ({ ...value, to: event.target.value }))} className={inputClass} /></label>
      <label>Language<select value={draft.language} onChange={event => setDraft(value => ({ ...value, language: event.target.value }))} className={inputClass}><option value="">All languages</option>{chatLanguages.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <label>Status<select value={draft.status} onChange={event => setDraft(value => ({ ...value, status: event.target.value }))} className={inputClass}><option value="">All statuses</option><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></label>
      <label className="flex items-center gap-2 py-3 text-sm"><input type="checkbox" checked={draft.contacts} onChange={event => setDraft(value => ({ ...value, contacts: event.target.checked }))} />Contact requests only</label>
      <button type="submit" className="rounded-lg bg-[#d6b659] px-4 py-2 font-semibold text-black">Apply filters</button>
    </form>
    {error && <p role="alert" className="text-red-300">{error}</p>}
    {report && <section aria-label="Saved chat summary" className="grid gap-4 sm:grid-cols-3">{[["Saved sessions", report.summary.sessions], ["Contact requests", report.summary.contacts], ["Active in last 5 minutes", report.summary.active]].map(([label, count]) => <div key={label} className="rounded-xl border border-slate-700 bg-[#101827] p-5"><p className="text-sm text-slate-300">{label}</p><p className="mt-2 text-3xl font-semibold">{count}</p></div>)}</section>}
    {!report && busy ? <p role="status">Loading saved sessions…</p> : report && !report.data.length ? <p className="rounded-xl border border-slate-700 p-6">No saved chat sessions match these filters. Recording begins when a visitor chooses to save a session or submits a follow-up request.</p> : report && <div className="overflow-x-auto rounded-xl border border-slate-700"><table className="w-full text-left text-sm"><thead className="bg-[#101827] text-slate-300"><tr>{["Visitor / reference", "Contact details", "Language", "Last activity (Dubai)", "Status", "Activity"].map(label => <th key={label} className="p-4">{label}</th>)}</tr></thead><tbody>{report.data.map(item => <tr key={item._id} className="border-t border-slate-700"><td className="p-4"><p className="font-semibold">{item.contact?.name || "Guest"}</p><p className="mt-1 text-xs text-slate-400">{item.reference}</p></td><td className="p-4">{item.contact ? <><p className="break-all">{item.contact.email}</p><p>{item.contact.phone || "Phone not supplied"}</p><p>{item.contact.country}</p></> : "Not supplied"}</td><td className="p-4">{languageName(item.language)}</td><td className="p-4">{when(item.lastActiveAt)}</td><td className="p-4 capitalize">{item.status}</td><td className="p-4"><button type="button" onClick={() => setSelected(item._id)} className="text-[#e3c569] underline">View session</button></td></tr>)}</tbody></table></div>}
    {report && report.total > report.limit && <nav aria-label="Chat report pages" className="flex justify-between gap-3"><button disabled={page === 1 || busy} onClick={() => setPage(value => value - 1)} className="rounded border border-slate-500 px-4 py-2 disabled:opacity-40">Previous</button><span>Page {page} of {Math.ceil(report.total / report.limit)}</span><button disabled={page * report.limit >= report.total || busy} onClick={() => setPage(value => value + 1)} className="rounded border border-slate-500 px-4 py-2 disabled:opacity-40">Next</button></nav>}
    {selected && <section aria-label="Selected chat session" className="space-y-4 rounded-xl border border-slate-600 bg-[#101827] p-5">
      <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">{detail?.reference || "Session details"}</h2><button type="button" onClick={() => { setSelected(null); setDetail(null); }} className="text-[#e3c569] underline">Close details</button></div>
      {detailError && <p role="alert" className="text-red-300">{detailError}</p>}
      {!detail && !detailError && <p role="status">Loading session…</p>}
      {detail && <><p className="text-sm text-slate-300">Saved with permission at {when(detail.consentedAt)}. Expires {when(detail.expiresAt)}. Contact details are visitor-provided and unverified.</p>
        {detail.contact && <div className="rounded-lg border border-slate-600 p-4 text-sm"><h3 className="font-semibold">Follow-up request</h3><p>{detail.contact.name} · {detail.contact.email}</p><p>{detail.contact.phone || "Phone not supplied"} · {detail.contact.country}</p><p className="mt-2 text-xs text-slate-400">Contact permission: {when(detail.contact.privacyAcceptedAt)}. No marketing consent.</p></div>}
        <h3 className="font-semibold">Guide activity</h3><p className="text-xs text-slate-400">Selected menu questions and published guide answers, not a free-text or live-agent transcript. Search text is not recorded.</p>
        <ol className="space-y-3">{detail.events?.map(event => {
          const copy = chatCopy[event.language] || chatCopy.en;
          return <li key={event.id} className="rounded-lg border border-slate-700 p-3"><p className="text-xs text-slate-400">{when(event.at)} · {languageName(event.language)} · {activityLabels[event.type] || "Guide activity"}</p>{event.topic && <p className="mt-1 text-sm text-[#e3c569]">{copy.topics[event.topic]}</p>}{typeof event.question === "number" && <><p className="mt-2 font-medium">{copy.questions[event.question]}</p><p className="mt-2 text-sm leading-6 text-slate-300">{copy.answers[event.question]}</p></>}</li>;
        })}</ol>
        <fieldset disabled={saving} className="grid gap-4 border-t border-slate-700 pt-4 sm:grid-cols-[200px_1fr]"><label>Team status<select value={detail.status} onChange={event => { const status = event.target.value as Session["status"]; setDetail(value => value ? { ...value, status } : value); setSaved(false); }} className={inputClass}><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></label><label>Team notes<textarea rows={3} maxLength={2000} value={detail.note} onChange={event => { const note = event.target.value; setDetail(value => value ? { ...value, note } : value); setSaved(false); }} className={inputClass} /></label></fieldset>
        <button type="button" disabled={saving} onClick={save} className="rounded-lg bg-[#d6b659] px-4 py-2 font-semibold text-black disabled:opacity-50">{saving ? "Saving…" : "Save team changes"}</button>{saved && <span role="status" className="ml-3 text-sm text-emerald-300">Saved</span>}
      </>}
    </section>}
    <p className="text-xs leading-5 text-slate-400">Summary follows the selected dates and filters. “Active” means a saved activity occurred in the last 5 minutes, not a live connection. Auto-refreshes every 30 seconds while this page is visible. This guide does not operate a live-agent inbox.</p>
  </div>;
}
