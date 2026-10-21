"use client";

import IdentityReadinessNotice from "../IdentityReadinessNotice";
import { authenticatedFetch } from "../../lib/apiClient";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { countriesData } from "@/data/IsoCode";

interface VerificationStatus {
  enabled: boolean;
  canRetry?: boolean;
  approved: boolean;
  status: string;
  message: string;
  residenceCountry: string;
  managedByVeriff?: boolean;
  ibApproved?: boolean;
}

const labels: Record<string, string> = {
  not_started: "Verify your identity", creating: "Preparing verification",
  created: "Verification in progress", approved: "Identity verified",
  declined: "Verification unsuccessful", review: "Further review needed",
  resubmission_requested: "More information needed", expired: "Session expired",
  abandoned: "Verification incomplete", error: "Please try again",
  test_approved: "Test verification completed",
};

function isUae(country: string) {
  return ["AE", "ARE", "UAE", "UNITEDARABEMIRATES"].includes(country.toUpperCase().replace(/[^A-Z]/g, ""));
}

export default function VeriffVerification({ forIb = false }: { forIb?: boolean }) {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [country, setCountry] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ibIntent, setIbIntent] = useState(false);
  useEffect(() => { setIbIntent(localStorage.getItem("bdfx_onboarding_intent") === "ib"); }, []);
  const returnToIb = forIb || ibIntent;

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { setError("Please sign in to continue identity verification."); return; }
    try {
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/veriff/status`, {
        headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(response.status === 401 ? "Your session expired. Please sign in again." : "Unable to load verification status. Please try again.");
      setStatus(data);
      if (data.residenceCountry) setCountry(data.residenceCountry);
      setError("");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to load verification status.");
    }
  }, []);

  useEffect(() => {
    void refresh();
    let attempts = 0;
    const timer = window.setInterval(() => {
      if (++attempts > 24) { window.clearInterval(timer); return; }
      if (document.visibilityState === "visible") void refresh();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const start = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/veriff/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        body: JSON.stringify({ residenceCountry: country, purpose: forIb ? "ib" : "client" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to start verification.");
      if (response.status === 202) { setStatus(data); return; }
      if (data.approved) { setStatus(data); return; }
      const destination = new URL(data.url);
      const allowed = ["veriff.com", "veriff.me"].some(host => destination.hostname === host || destination.hostname.endsWith(`.${host}`));
      if (!allowed || destination.protocol !== "https:" || destination.username || destination.password ||
          (destination.port && destination.port !== "443")) throw new Error("Unable to open verification. Please contact support.");
      window.location.assign(destination.href);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to start verification.");
    } finally { setBusy(false); }
  };

  const needsSupport = status && (["review", "test_approved"].includes(status.status) || (status.status === "declined" && !status.canRetry));
  const identityApproved = status?.approved && (!forIb || status.managedByVeriff);
  const needsIbVerification = forIb && status?.approved && !status.managedByVeriff;
  const canStart = status?.enabled && !identityApproved && !needsSupport;

  return (
    <section className="rounded-2xl border border-[#c6a15b]/30 bg-[#0f172a] p-6 md:p-10 text-white max-w-2xl mx-auto space-y-5">
      <p className="text-xs uppercase tracking-widest text-[#c6a15b]">Billion Dollar FX · Identity verification</p>
      <h1 className="text-2xl font-semibold">{needsIbVerification ? "Verify identity for your IB application" : status ? labels[status.status] || "Identity verification" : "Identity verification"}</h1>
      {status && <p role="status" className="text-gray-300">{needsIbVerification ? "Your IB application requires a Veriff identity check." : status.message}</p>}
      {returnToIb && identityApproved && <p className="text-gray-300">{status?.ibApproved ? "Your IB application is approved. Your referral code is available in your IB dashboard." : "Your identity is verified. Continue to the IB application to complete or check your details."}</p>}
      {error && <p role="alert" className="text-red-300">{error}</p>}
      {!status && !error && <p className="text-gray-400">Loading your verification status…</p>}
      {status && !status.enabled && !status.approved && <p className="text-amber-200">Identity verification is temporarily unavailable. Please contact support.</p>}
      {status?.canRetry && <p className="text-sm text-amber-200">You can try again with your original physical ID. Use clear lighting and make sure your details match the document.</p>}
      {canStart && <>
        <IdentityReadinessNotice />
        <p className="text-sm leading-6 text-gray-400">Continue to Veriff to verify your identity using a supported government-issued ID and selfie. Your account will be approved automatically after a successful verification and BDFX eligibility checks.</p>
        {needsIbVerification && <p className="text-sm text-amber-200">Starting this new check will put your identity verification status back into pending until it completes.</p>}
        <div>
          <label htmlFor="residence-country" className="block text-sm mb-2">Country of residence</label>
          <select id="residence-country" value={country} onChange={event => setCountry(event.target.value)} disabled={!!status.residenceCountry}
            className="w-full rounded-lg border border-gray-600 bg-[#10151f] p-3 disabled:opacity-70">
            <option value="">Select your country of residence</option>
            {countriesData.filter(item => !isUae(item.country)).map(item => <option key={item.country} value={item.country}>{item.country}</option>)}
          </select>
        </div>
        <p className="text-sm text-gray-400">BDFX does not accept UAE clients or UAE-issued identity documents.</p>
        <button type="button" onClick={start} disabled={busy || !country || status.status === "creating"}
          className="rounded-lg bg-[#c6a15b] px-5 py-3 font-semibold text-black disabled:opacity-50">
          {busy ? "Opening verification…" : status.canRetry ? "Try verification again" : status.status === "resubmission_requested" ? "Continue verification" : "Continue to Verify"}
        </button>
      </>}
      {identityApproved && <Link href={returnToIb ? "/introducing-broker" : "/dashboard"} className="inline-block rounded-lg bg-[#c6a15b] px-5 py-3 font-semibold text-black">{returnToIb ? "Continue to IB application" : "Continue to dashboard"}</Link>}
      <p className="text-sm text-gray-300">Need more support? Contact <a href="tel:+447999283366" className="text-[#00cfff] underline">+447999283366</a>.</p>
      <div className="flex flex-wrap gap-5 text-sm">
        <button type="button" onClick={() => void refresh()} disabled={busy} className="text-[#00cfff]">Check status</button>
        <Link href="/login" className="text-[#00cfff]">Sign in</Link>
        <a href="mailto:support@billiondollarfx.com" className="text-[#00cfff]">Contact support</a>
      </div>
    </section>
  );
}
