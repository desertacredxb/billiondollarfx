"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import api from "../lib/apiClient";
import { buttonClass, cardClass, crmError, fieldClass, secondaryClass } from "../lib/crm";

type CrmDraft = { fullName: string; hashmiId: string };
const staffUrl = `${process.env.NEXT_PUBLIC_API_BASE}/api/staff`;

export default function CrmStaffDrafts({ onActivated }: { onActivated: () => Promise<void> }) {
  const [drafts, setDrafts] = useState<CrmDraft[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [roster, setRoster] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<{ data: CrmDraft[] }>(`${staffUrl}/crm-drafts`);
      setDrafts(data.data);
    } catch (err) {
      setError(crmError(err, "Unable to load pending CRM agents."));
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function stage(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const agents = roster.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map((line, index) => {
        const comma = line.lastIndexOf(",");
        if (comma < 1) throw new Error(`Row ${index + 1} needs a name and Hashmi ID separated by a comma.`);
        return { fullName: line.slice(0, comma).trim(), hashmiId: line.slice(comma + 1).trim() };
      });
      const { data } = await api.post<{ staged: number; alreadyMapped: number }>(`${staffUrl}/crm-drafts`, { agents });
      setRoster("");
      setMessage(`Saved ${data.staged} pending CRM agents. ${data.alreadyMapped} already mapped.`);
      await load();
    } catch (err) { setError(crmError(err, "Unable to save the pending CRM agents.")); }
    finally { setBusy(false); }
  }

  async function activate(event: FormEvent, hashmiId: string) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const { data } = await api.post<{ message: string }>(staffUrl, { crmDraftId: hashmiId, email: email.trim() });
      setSelected(null); setEmail(""); setMessage(data.message);
      await Promise.all([load(), onActivated()]);
    } catch (err) { setError(crmError(err, "Unable to activate this CRM agent.")); }
    finally { setBusy(false); }
  }

  return <section aria-labelledby="crm-drafts-heading" className={cardClass}>
    <h2 id="crm-drafts-heading" className="text-xl font-semibold">Pending CRM agents</h2>
    <p className="mt-2 text-sm text-slate-400">Add a work email to create a CRM-only login with the saved Hashmi ID.</p>
    {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
    {message && <p role="status" className="mt-3 text-sm text-emerald-300">{message}</p>}
    {loading && <p role="status" className="mt-4 text-sm text-slate-300">Loading pending agents…</p>}
    {!loading && !drafts.length && !error && <p className="mt-4 text-sm text-slate-400">No agents are awaiting an email.</p>}
    {drafts.length > 0 && <ul className="mt-3 divide-y divide-slate-700">
      {drafts.map(draft => <li key={draft.hashmiId} className="py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">{draft.fullName}</p>
            <p className="mt-1 text-xs text-slate-400">Hashmi ID {draft.hashmiId}</p>
          </div>
          {selected !== draft.hashmiId && <button type="button" disabled={busy} className={secondaryClass} onClick={() => { setSelected(draft.hashmiId); setEmail(""); setError(""); }}>Add email</button>}
        </div>
        {selected === draft.hashmiId && <form onSubmit={event => void activate(event, draft.hashmiId)} className="mt-3 flex flex-wrap items-end gap-2">
          <label className="block min-w-52 flex-1 text-sm">Work email for {draft.fullName}
            <input className={`mt-1 ${fieldClass}`} type="email" autoComplete="off" maxLength={254} required value={email} onChange={event => setEmail(event.target.value)} />
          </label>
          <button type="submit" disabled={busy} className={buttonClass}>Create CRM login</button>
          <button type="button" disabled={busy} className={secondaryClass} onClick={() => { setSelected(null); setEmail(""); }}>Cancel</button>
        </form>}
      </li>)}
    </ul>}
    <details className="mt-4 border-t border-slate-700 pt-3">
      <summary className="cursor-pointer text-sm font-medium text-[#d6b659]">Stage Hashmi agents</summary>
      <form onSubmit={stage} className="mt-3 space-y-3">
        <label className="block text-sm">Name and Hashmi ID, separated by a comma on each line
          <textarea className={`mt-1 ${fieldClass}`} rows={4} required maxLength={12000} value={roster} onChange={event => setRoster(event.target.value)} />
        </label>
        <button type="submit" disabled={busy} className={buttonClass}>Save pending agents</button>
      </form>
    </details>
  </section>;
}
