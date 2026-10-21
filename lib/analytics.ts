import { SITE_ORIGIN } from "./seo";
export const analyticsConsentKey = "bdfx_analytics_consent_v1";
export const gaId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "";
export const analyticsEnabled = process.env.NEXT_PUBLIC_GA4_ENABLED === "true" && /^G-[A-Z0-9]{4,20}$/.test(gaId);
export const publicAnalyticsPaths = new Set(["/", "/about", "/accounts", "/platform", "/contact", "/help-centre", "/ib-broker", "/education", "/analytical-tools", "/economic-calendar", "/currency-converter", "/currency-calculator", "/forex", "/metals", "/indices", "/commodities", "/crypto", "/oil", "/blogs", "/news", "/cashback", "/career"]);
declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void } }
export function analyticsOriginAllowed() {
  return typeof window !== "undefined" && window.location.origin === SITE_ORIGIN;
}
export function analyticsAllowed() {
  try { return analyticsEnabled && analyticsOriginAllowed() && localStorage.getItem(analyticsConsentKey) === "granted"; } catch { return false; }
}
export function trackConversion(event: "generate_lead" | "sign_up") {
  if (typeof window === "undefined" || !analyticsAllowed()) return;
  // Only fixed event names and paths; no form values, IDs, email, URL parameters or trading data.
  window.gtag?.("event", event, { send_to: gaId, method: event === "sign_up" ? "email" : "contact_form", page_location: `${SITE_ORIGIN}${event === "sign_up" ? "/register" : "/contact"}`, page_referrer: "", page_title: event === "sign_up" ? "Registration complete" : "Contact enquiry received" });
}
