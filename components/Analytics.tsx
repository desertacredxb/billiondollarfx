"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { analyticsAllowed, analyticsConsentKey, analyticsEnabled, gaId, publicAnalyticsPaths } from "../lib/analytics";
import { SITE_ORIGIN } from "../lib/seo";

export default function Analytics() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<"granted" | "denied" | null>(null);
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState(false);
  useEffect(() => {
    try {
      const value = localStorage.getItem(analyticsConsentKey);
      if (value === "granted" || value === "denied") setConsent(value);
    } catch { /* Optional analytics stays off when browser storage is unavailable. */ }
  }, []);
  useEffect(() => {
    if (!ready || consent !== "granted" || !pathname || !publicAnalyticsPaths.has(pathname)) return;
    window.gtag?.("event", "page_view", { send_to: gaId, page_location: `${SITE_ORIGIN}${pathname}`, page_referrer: "", page_title: pathname === "/" ? "Billion Dollar FX" : pathname.slice(1) });
  }, [ready, consent, pathname]);
  function choose(value: "granted" | "denied") {
    (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] = value !== "granted";
    try { localStorage.setItem(analyticsConsentKey, value); } catch { setConsent("denied"); setSettings(false); return; }
    window.gtag?.("consent", "update", { analytics_storage: value, ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    setConsent(value); setSettings(false);
  }
  if (!analyticsEnabled) return null;
  return <>
    {consent === "granted" && <Script id="bdfx-ga4" src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" onReady={() => {
      if (!analyticsAllowed()) return;
      (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] = false;
      window.dataLayer ||= [];
      window.gtag = function () { window.dataLayer!.push(arguments); };
      window.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      window.gtag("js", new Date());
      window.gtag("config", gaId, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, page_location: `${SITE_ORIGIN}/`, page_referrer: "", page_title: "Billion Dollar FX" });
      setReady(true);
    }} />}
    {consent === null || settings ? <section aria-label="Optional analytics preferences" className="fixed inset-x-3 bottom-4 z-[90] mx-auto max-w-2xl rounded-xl border border-slate-600 bg-[#101827] p-5 text-white shadow-xl"><p className="text-sm leading-6">Allow optional analytics to help us understand website use? You can change your choice at any time. <Link href="/Privacy-Policy" className="text-[#d6b659] underline">Privacy Policy</Link></p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => choose("granted")} className="rounded-lg bg-[#d6b659] px-4 py-2 text-sm font-semibold text-black">Allow analytics</button><button type="button" onClick={() => choose("denied")} className="rounded-lg border border-slate-500 px-4 py-2 text-sm">Decline analytics</button></div></section> : <button type="button" onClick={() => setSettings(true)} className="fixed bottom-3 left-3 z-50 rounded border border-slate-600 bg-[#101827] px-3 py-2 text-xs text-white">Analytics preferences</button>}
  </>;
}
