"use client";
import { useId, useState, type FormEvent } from "react";
import type { ChatLanguage } from "../../lib/supportChat";
import type { ChatContact } from "../../lib/supportChatSession";
import { chatSessionCopy } from "../../lib/chatSessionCopy";
export default function ChatContactForm({ language, submit }: { language: ChatLanguage; submit: (language: ChatLanguage, details: ChatContact) => Promise<void> }) {
  const copy = chatSessionCopy[language], id = useId();
  const [busy, setBusy] = useState(false), [sent, setSent] = useState(false), [error, setError] = useState("");
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const form = event.currentTarget, data = new FormData(form);
    setBusy(true); setError("");
    try {
      await submit(language, { name: String(data.get("name") || ""), email: String(data.get("email") || ""), phone: String(data.get("phone") || ""), country: String(data.get("country") || ""), privacyAccepted: data.get("consent") === "on", website: String(data.get("website") || "") });
      form.reset(); setSent(true);
    } catch (error) { setError(error instanceof Error ? error.message : copy.error); }
    finally { setBusy(false); }
  }
  if (sent) return <p role="status" className="rounded-lg border border-emerald-700 bg-emerald-950/40 p-3 text-sm">{copy.sent}</p>;
  return <form onSubmit={send} className="space-y-3 rounded-lg border border-slate-600 p-3">
    {([ ["name", copy.name, "text", 120, true], ["email", copy.email, "email", 254, true], ["phone", copy.phone, "tel", 40, false], ["country", copy.country, "text", 100, true] ] as const).map(([name, label, type, maxLength, required]) => <div key={name}><label className="block text-xs" htmlFor={`${id}-${name}`}>{label}</label><input id={`${id}-${name}`} name={name} type={type} maxLength={maxLength} minLength={name === "name" ? 2 : undefined} required={required} autoComplete={name === "phone" ? "tel" : name === "country" ? "country-name" : name} placeholder={name === "phone" ? "+…" : undefined} className="mt-1 w-full rounded border border-slate-600 bg-[#101827] p-2 text-sm" /></div>)}
    <div hidden aria-hidden="true"><label htmlFor={`${id}-website`}>Website</label><input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" /></div>
    <label className="flex items-start gap-2 text-xs leading-5"><input name="consent" type="checkbox" required className="mt-1 shrink-0" />{copy.consent}</label>
    {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
    <button type="submit" disabled={busy} className="rounded-lg bg-[#d6b659] px-3 py-2 text-sm font-semibold text-black disabled:opacity-50">{busy ? copy.saving : copy.submit}</button>
  </form>;
}
