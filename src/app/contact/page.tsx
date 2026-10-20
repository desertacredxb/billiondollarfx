"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { trackConversion } from "../../../lib/analytics";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { authenticatedFetch } from "../../../lib/apiClient";
import { countriesData } from "@/data/IsoCode";

const empty = { name: "", phone: "", email: "", country: "", message: "", privacyAccepted: false, marketingConsent: false, website: "" };

export default function ContactPage() {
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; success: boolean } | null>(null);
  const requestId = useRef("");
  const submitting = useRef(false);
  const input = "mt-2 w-full rounded-lg border border-slate-500 bg-[#0b1423] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#ffd700]";

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setFeedback(null);
    try {
      requestId.current ||= crypto.randomUUID();
      const params = new URLSearchParams(location.search);
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/enquiries`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, requestId: requestId.current, campaign: { source: params.get("utm_source"), medium: params.get("utm_medium"), campaign: params.get("utm_campaign") } }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to send your enquiry. Please try again.");
      trackConversion("generate_lead");
      setFeedback({ success: true, text: `${result.message} Reference: ${result.reference}` });
      setForm(empty);
      requestId.current = "";
    } catch (error) { setFeedback({ success: false, text: error instanceof Error ? error.message : "Unable to send your enquiry. Please try again." }); }
    finally { submitting.current = false; setBusy(false); }
  }

  return <><Navbar /><main className="bg-[#0a0f1c] text-white px-5 pt-32 pb-20">
    <div className="mx-auto max-w-5xl">
      <p className="text-[#ffd700] text-sm font-semibold">Billion Dollar FX Support</p>
      <h1 className="mt-3 text-3xl md:text-4xl font-semibold">How can we help?</h1>
      <p className="mt-4 max-w-2xl text-slate-300">Ask about account opening, verification, MT5 or our partner programme. Existing clients can also create a support ticket in their dashboard.</p>
      <p className="mt-3 text-sm text-slate-300">We don’t accept UAE clients.</p>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_2fr]">
        <aside className="space-y-6 text-slate-300">
          <div><h2 className="font-semibold text-white">Email support</h2><a className="mt-2 inline-block text-[#ffd700] break-all underline" href="mailto:support@billiondollarfx.com">support@billiondollarfx.com</a></div>
          <div><h2 className="font-semibold text-white">Phone / WhatsApp</h2><a className="mt-2 inline-block text-[#ffd700] underline" href="tel:+447999283366">+44 7999 283366</a><a className="mt-2 block text-[#ffd700] underline" href="https://wa.me/447999283366" target="_blank" rel="noopener noreferrer">Open WhatsApp</a></div>
          <div><h2 className="font-semibold text-white">Postal address</h2><p className="mt-2">P.O. Box 838, Castries, Saint Lucia.</p></div>
          <div><h2 className="font-semibold text-white">Already a client?</h2><Link href="/support" className="mt-2 inline-block text-[#ffd700] underline">Open a support ticket</Link></div>
        </aside>
        <form onSubmit={submit} className="rounded-2xl border border-white/15 bg-[#101827] p-5 sm:p-7 space-y-5">
          <h2 className="text-xl font-semibold">Send an enquiry</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block" htmlFor="contact-name">Full name<input id="contact-name" required minLength={2} maxLength={120} autoComplete="name" value={form.name} onChange={event => setForm(value => ({ ...value, name: event.target.value }))} className={input} /></label>
            <label className="block" htmlFor="contact-email">Email<input id="contact-email" required type="email" maxLength={254} autoComplete="email" value={form.email} onChange={event => setForm(value => ({ ...value, email: event.target.value }))} className={input} /></label>
            <label className="block" htmlFor="contact-phone">Mobile number <span className="text-xs text-slate-400">(optional)</span><input id="contact-phone" type="tel" maxLength={40} autoComplete="tel" placeholder="Include + and country code" value={form.phone} onChange={event => setForm(value => ({ ...value, phone: event.target.value }))} className={input} /></label>
            <label className="block" htmlFor="contact-country">Country of residence<select id="contact-country" required autoComplete="country-name" value={form.country} onChange={event => setForm(value => ({ ...value, country: event.target.value }))} className={input}><option value="">Select country</option>{countriesData.filter(country => country.iso !== "AE").map(country => <option key={country.iso} value={country.country}>{country.country}</option>)}</select></label>
          </div>
          <label className="block" htmlFor="contact-message">Your message<textarea id="contact-message" required minLength={10} maxLength={5000} rows={5} value={form.message} onChange={event => setForm(value => ({ ...value, message: event.target.value }))} className={input} /></label>
          <div hidden aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={event => setForm(value => ({ ...value, website: event.target.value }))} /></label></div>
          <label className="flex items-start gap-3 text-sm text-slate-300"><input required type="checkbox" checked={form.privacyAccepted} onChange={event => setForm(value => ({ ...value, privacyAccepted: event.target.checked }))} className="mt-1" /><span>I have read the <Link href="/Privacy-Policy" className="text-[#ffd700] underline">Privacy Policy</Link> and agree that BDFX may use these details to respond to this enquiry.</span></label>
          <label className="flex items-start gap-3 text-sm text-slate-300"><input type="checkbox" checked={form.marketingConsent} onChange={event => setForm(value => ({ ...value, marketingConsent: event.target.checked }))} className="mt-1" /><span>Send me occasional BDFX news and offers. This is optional.</span></label>
          {feedback && <p role={feedback.success ? "status" : "alert"} aria-live="polite" className={`rounded-lg border p-4 text-sm ${feedback.success ? "border-emerald-500/40 text-emerald-200" : "border-red-400/40 text-red-200"}`}>{feedback.text}</p>}
          <button type="submit" disabled={busy} className="rounded-lg bg-[#ffd700] px-6 py-3 font-semibold text-black disabled:opacity-50">{busy ? "Sending enquiry…" : "Send enquiry"}</button>
        </form>
      </div>
      <section className="mt-16 rounded-2xl border border-white/15 p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5"><div><h2 className="text-xl font-semibold">Ready to open an account?</h2><p className="mt-2 text-slate-300">Register and complete identity verification to get started.</p></div><Link href="/register" className="rounded-lg bg-[#ffd700] px-6 py-3 font-semibold text-black text-center">Create account</Link></section>
    </div>
  </main><Footer /></>;
}
