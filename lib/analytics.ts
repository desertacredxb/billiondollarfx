import { SITE_ORIGIN } from "./seo";
import { countryGuidePublicPaths } from "./countryGuidePaths";
export const analyticsConsentKey = "bdfx_analytics_consent_v1";
export const gaId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "";
export const analyticsEnabled = process.env.NEXT_PUBLIC_GA4_ENABLED === "true" && /^G-[A-Z0-9]{4,20}$/.test(gaId);
export const publicAnalyticsPaths = new Set(["/", "/about", "/accounts", "/platform", "/contact", "/help-centre", "/ib-broker", "/education", "/analytical-tools", "/economic-calendar", "/currency-converter", "/currency-calculator", "/forex", "/metals", "/indices", "/commodities", "/crypto", "/oil", "/blogs", "/news", "/cashback", "/career"]);
for (const path of countryGuidePublicPaths) publicAnalyticsPaths.add(path);

const googleSearchHosts = new Set(["google.com", "google.co.in", "google.com.pk", "google.com.vn"]);
const paidClickParameters = new Set(["gclid", "dclid", "gbraid", "wbraid", "gclsrc", "msclkid"]);
export const officeTestCampaign = { campaign_source: "bdfx_team", campaign_medium: "internal" } as const;
export const officeTestUrl = `${SITE_ORIGIN}/?utm_source=${officeTestCampaign.campaign_source}&utm_medium=${officeTestCampaign.campaign_medium}`;
export const publicBlogPath = /^\/blogs\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function landingAttribution(referrer: string, search: string) {
  const parameters = new URLSearchParams(search);
  if (parameters.get("utm_source") === officeTestCampaign.campaign_source && parameters.get("utm_medium") === officeTestCampaign.campaign_medium) {
    return { page_referrer: "", ...officeTestCampaign };
  }
  // Keep tagged campaigns separate from search and never send raw landing data.
  const taggedCampaign = Array.from(parameters.keys()).some(key => {
    const name = key.toLowerCase();
    return name.startsWith("utm_") || paidClickParameters.has(name);
  });
  if (taggedCampaign) return { page_referrer: "" };
  try {
    const source = new URL(referrer);
    const host = source.hostname.replace(/^www\./, "");
    if ((source.protocol === "https:" || source.protocol === "http:") && googleSearchHosts.has(host)) {
      return { page_referrer: "https://www.google.com/", campaign_source: "google", campaign_medium: "organic" };
    }
  } catch { /* A missing or malformed referrer has no search attribution. */ }
  return { page_referrer: "" };
}

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
