"use client";
import { useEffect, useRef, useState } from "react";
export default function EconomicCalendar() {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    element.replaceChildren();
    const widget = document.createElement("div"); widget.className = "tradingview-widget-container__widget"; element.appendChild(widget);
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.async = true;
    script.textContent = JSON.stringify({ colorTheme: "dark", isTransparent: false, locale: "en", importanceFilter: "-1,0,1", width: "100%", height: "650" });
    script.onerror = () => setError(true);
    element.appendChild(script);
    return () => { element.replaceChildren(); };
  }, []);
  return <section className="overflow-hidden rounded-2xl border border-slate-700 bg-[#101827] p-4 md:p-6"><h2 className="mb-3 text-xl font-semibold">Scheduled economic events</h2><p className="mb-5 text-sm leading-7 text-slate-400">Check the calendar's displayed time zone and use its filters to choose countries and event importance. Release times and data can change.</p><div ref={container} className="tradingview-widget-container min-h-[650px]" aria-label="Economic calendar by TradingView"></div>{error && <p role="status" className="mt-4 text-sm text-amber-200">The embedded calendar could not load. Open the calendar below to view events.</p>}<a href="https://www.tradingview.com/economic-calendar/" target="_blank" rel="noopener nofollow noreferrer" className="mt-4 block text-sm text-[#d6b659] underline">Economic Calendar by TradingView</a></section>;
}
