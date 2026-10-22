"use client";
import { useEffect, useState } from "react";
import api from "../../lib/apiClient";
const endpoint = `${process.env.NEXT_PUBLIC_API_BASE}/api/email-marketing/preferences`;
export default function EmailPreferences() {
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    api.get<{ subscribed: boolean }>(endpoint, { signal: controller.signal, timeout: 15000 }).then(({ data }) => setSubscribed(data.subscribed)).catch(() => { if (!controller.signal.aborted) setNotice("Unable to load preferences. Please try again later."); });
    return () => controller.abort();
  }, []);
  async function save() {
    if (subscribed === null || busy) return;
    setBusy(true); setNotice("");
    try { const { data } = await api.put<{ subscribed: boolean }>(endpoint, { subscribed }, { timeout: 15000 }); setSubscribed(data.subscribed); setNotice("Email preference saved."); }
    catch { setNotice("Unable to confirm your preference was saved. Reload to check, or try again."); }
    finally { setBusy(false); }
  }
  return <section className="max-w-xl space-y-5"><h2 className="text-xl font-semibold">Email Preferences</h2><p className="text-sm leading-6 text-slate-300">Choose whether to receive BDFX educational updates and offers. This is optional. Account, security and service emails continue as needed.</p>{subscribed === null ? <p role="status">Loading email preferences…</p> : <label className="flex items-start gap-3"><input type="checkbox" checked={subscribed} disabled={busy} onChange={e => setSubscribed(e.target.checked)} className="mt-1" /><span>Email me BDFX educational updates and offers. I can unsubscribe anytime.</span></label>}<button type="button" disabled={busy || subscribed === null} onClick={save} className="rounded-lg bg-[#d6b659] px-4 py-2 text-black font-semibold disabled:opacity-50">{busy ? "Saving…" : "Save preference"}</button><p role="status" className="text-sm text-slate-300">{notice}</p></section>;
}
