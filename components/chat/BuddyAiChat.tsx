"use client";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { askBuddyAi, buddyAiAvailable, buddyAiCopy, BuddyAiError } from "../../lib/buddyAi";
import type { ChatLanguage } from "../../lib/supportChat";
export default function BuddyAiChat({ language, contextQuestion }: { language: ChatLanguage; contextQuestion: number | null }) {
  const [available, setAvailable] = useState(false), [consent, setConsent] = useState(false);
  const [message, setMessage] = useState(""), [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const inFlight = useRef<AbortController | null>(null), label = useId(), copy = buddyAiCopy[language];
  useEffect(() => {
    const controller = new AbortController();
    void buddyAiAvailable(controller.signal).then(value => { if (!controller.signal.aborted) setAvailable(value); }).catch(() => {});
    return () => { controller.abort(); const pending = inFlight.current; inFlight.current = null; pending?.abort(); };
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!consent || busy || !message.trim()) return;
    inFlight.current?.abort();
    const controller = new AbortController(); inFlight.current = controller;
    const timer = setTimeout(() => controller.abort(), 13000);
    setBusy(true); setAnswer(""); setError("");
    try { const result = await askBuddyAi(language, message, consent, contextQuestion, controller.signal); if (!controller.signal.aborted) setAnswer(result); }
    catch (cause) { if (inFlight.current === controller) setError(cause instanceof BuddyAiError && cause.code === "REMOVE_PRIVATE_DETAILS" ? copy.private : copy.unavailable); }
    finally { clearTimeout(timer); if (inFlight.current === controller) { inFlight.current = null; setBusy(false); } }
  }
  if (!available) return null;
  return <section aria-label={copy.title} className="rounded-xl border border-[#927948] bg-[#101827] p-3 text-sm">
    <h3 className="font-semibold text-[#e3c569]">{copy.title}</h3>
    <form onSubmit={submit} className="mt-3 space-y-3">
      <p className="text-xs leading-5 text-slate-300">{copy.notice}</p>
      <label className="flex items-start gap-2 text-xs leading-5"><input type="checkbox" checked={consent} onChange={event => {
        const checked = event.target.checked; setConsent(checked);
        if (!checked) { inFlight.current?.abort(); inFlight.current = null; setBusy(false); setMessage(""); setAnswer(""); setError(""); }
      }} className="mt-1 shrink-0" />{copy.consent}</label>
      <label htmlFor={label} className="block text-xs">{copy.prompt}</label>
      <textarea id={label} value={message} onChange={event => setMessage(event.target.value)} maxLength={1000} rows={2} required disabled={!consent || busy} className="w-full rounded-lg border border-slate-600 bg-[#0a0f1c] p-3 text-base disabled:opacity-50" />
      <button type="submit" disabled={!consent || busy || !message.trim()} className="min-h-11 w-full rounded-lg bg-[#d6b659] px-3 py-2 font-semibold text-black disabled:opacity-50">{busy ? copy.sending : copy.send}</button>
      {error && <p role="status" className="text-xs leading-5 text-amber-200">{error}</p>}
      {answer && <p aria-live="polite" className="whitespace-pre-wrap rounded-lg bg-[#172033] p-3 leading-7">{answer}</p>}
    </form>
  </section>;
}

