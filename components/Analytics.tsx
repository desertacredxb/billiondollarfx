"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { analyticsAllowed, analyticsConsentKey, analyticsEnabled, analyticsOriginAllowed, gaId, landingAttribution, metaLandingEvent, publicAnalyticsPaths, publicBlogPath } from "../lib/analytics";
import { SITE_ORIGIN } from "../lib/seo";

export default function Analytics() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<"granted" | "denied" | null>(null);
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState(false);
  const [productionOrigin, setProductionOrigin] = useState(false);
  const attribution = useRef<ReturnType<typeof landingAttribution> | null>(null);
  const metaLanding = useRef<{ path: string; event: NonNullable<ReturnType<typeof metaLandingEvent>> } | null>(null);
  useEffect(() => {
    if (!analyticsOriginAllowed()) return;
    attribution.current ??= landingAttribution(document.referrer, window.location.search);
    const path = window.location.pathname;
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (navigation?.type !== "reload" && navigation?.type !== "back_forward" &&
        (publicAnalyticsPaths.has(path) || publicBlogPath.test(path))) {
      const event = metaLandingEvent(document.referrer, window.location.search);
      if (event) metaLanding.current = { path, event };
    }
    setProductionOrigin(true);
    try {
      const value = localStorage.getItem(analyticsConsentKey);
      if (value === "granted" || value === "denied") setConsent(value);
    } catch { /* Optional analytics stays off when browser storage is unavailable. */ }
  }, []);
  useEffect(() => {
    if (!ready || consent !== "granted" || !pathname || !analyticsAllowed()) return;
    const path = pathname;
    const sendPageView = () => {
      if (!analyticsAllowed() || !window.gtag) return;
      const page = {
        send_to: gaId,
        page_location: `${SITE_ORIGIN}${path}`,
        page_referrer: attribution.current?.page_referrer ?? "",
        page_title: path === "/" ? "Billion Dollar FX" : path.slice(1),
      };
      window.gtag("event", "page_view", page);
      if (metaLanding.current?.path === path) {
        const { event } = metaLanding.current;
        metaLanding.current = null;
        window.gtag("event", event, { ...page, page_referrer: "" });
      }
    };
    if (publicAnalyticsPaths.has(path)) {
      sendPageView();
      return;
    }
    if (!publicBlogPath.test(path)) return;
    const content = document.getElementById("main-content");
    if (!content) return;
    const publishedArticle = () => content.querySelector(`main[data-bdfx-blog-path="${path}"]`);
    if (publishedArticle()) {
      sendPageView();
      return;
    }
    // An article may stream in after the pathname changes.
    const observer = new MutationObserver(() => {
      if (!publishedArticle()) return;
      observer.disconnect();
      sendPageView();
    });
    observer.observe(content, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [ready, consent, pathname]);
  function choose(value: "granted" | "denied") {
    (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] = value !== "granted";
    try { localStorage.setItem(analyticsConsentKey, value); } catch { setConsent("denied"); setSettings(false); return; }
    window.gtag?.("consent", "update", { analytics_storage: value, ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    setConsent(value); setSettings(false);
  }
  if (!analyticsEnabled || !productionOrigin) return null;
  return <>
    {consent === "granted" && <Script id="bdfx-ga4" src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" onReady={() => {
      if (!analyticsAllowed()) return;
      (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] = false;
      window.dataLayer ||= [];
      window.gtag = function () { window.dataLayer!.push(arguments); };
      window.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      window.gtag("js", new Date());
      window.gtag("config", gaId, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: `${SITE_ORIGIN}/`,
        page_title: "Billion Dollar FX",
        page_referrer: "",
        ...attribution.current,
      });
      setReady(true);
    }} />}
    {consent === null || settings ? <section aria-label="Optional analytics preferences" className="fixed inset-x-3 bottom-4 z-[10030] mx-auto max-h-[calc(100dvh-24px)] max-w-2xl overflow-y-auto rounded-xl border border-slate-600 bg-[#101827] p-5 text-white shadow-xl"><p className="text-sm leading-6">Allow optional analytics to help us understand website use? You can change your choice at any time. <Link href="/Privacy-Policy" className="text-[#d6b659] underline">Privacy Policy</Link></p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => choose("granted")} className="min-h-11 rounded-lg bg-[#d6b659] px-4 py-2 text-sm font-semibold text-black">Allow analytics</button><button type="button" onClick={() => choose("denied")} className="min-h-11 rounded-lg border border-slate-500 px-4 py-2 text-sm">Decline analytics</button></div></section> : <button type="button" onClick={() => setSettings(true)} className="fixed bottom-3 left-3 z-50 rounded border border-slate-600 bg-[#101827] px-3 py-2 text-xs text-white">Analytics preferences</button>}
  </>;
}
