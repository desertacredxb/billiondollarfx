const test = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const { readFileSync } = require("node:fs");
const originalLoader = require.extensions[".ts"];
require.extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
process.env.NEXT_PUBLIC_GA4_ENABLED = "true";
process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID = "G-TEST123456";
const { validateTicket } = require("../lib/supportForms.ts");
const { analyticsConsentKey, landingAttribution, metaLandingEvent, publicAnalyticsPaths, publicBlogPath, trackConversion } = require("../lib/analytics.ts");
if (originalLoader) require.extensions[".ts"] = originalLoader; else delete require.extensions[".ts"];
test("support fields reject whitespace, invalid categories and excessive input while accepting trimmed client text", () => {
  assert.deepEqual(validateTicket({ category: "MT5 Support", subject: " Help with MT5 ", description: " Connection is failing. " }), {});
  const errors = validateTicket({ category: "invented", subject: "   ", description: "x".repeat(5001) });
  assert.deepEqual(Object.keys(errors).sort(), ["category", "description", "subject"]);
});
test("conversion events require consent and contain only fixed metadata, never private URLs or form data", () => {
  const captured = []; let granted = false;
  global.window = { location: { origin: "https://www.billiondollarfx.com", href: "https://www.billiondollarfx.com/register?email=private@example.invalid&token=secret" }, gtag: (...args) => captured.push(args) };
  global.localStorage = { getItem: key => key === analyticsConsentKey && granted ? "granted" : "denied" };
  trackConversion("sign_up"); assert.equal(captured.length, 0);
  granted = true; trackConversion("sign_up"); trackConversion("generate_lead");
  assert.equal(captured.length, 2);
  assert.equal(captured[0][1], "sign_up"); assert.equal(captured[1][1], "generate_lead");
  granted = false; trackConversion("sign_up"); assert.equal(captured.length, 2);
  const payload = JSON.stringify(captured);
  for (const value of ["private@example.invalid", "token=secret", "?email="]) assert.equal(payload.includes(value), false);
  for (const path of ["/settings", "/register", "/dashboard", "/verify-identity", "/staff-users", "/business-report"]) assert.equal(publicAnalyticsPaths.has(path), false);
});
test("a saved consent choice cannot send production conversions from a preview, localhost or lookalike domain", () => {
  const captured = [];
  global.localStorage = { getItem: () => "granted" };
  for (const origin of ["http://localhost:3000", "https://bdfx-preview.vercel.app", "https://www.billiondollarfx.com.example.invalid"]) {
    global.window = { location: { origin }, gtag: (...args) => captured.push(args) };
    trackConversion("generate_lead"); trackConversion("sign_up");
  }
  assert.equal(captured.length, 0);
  global.window.location.origin = "https://www.billiondollarfx.com";
  trackConversion("generate_lead");
  assert.equal(captured.length, 1);
  global.localStorage = { getItem: () => { throw new Error("Storage unavailable"); } };
  trackConversion("sign_up"); assert.equal(captured.length, 1);
});

test("Google Search attribution uses fixed metadata for the supported domains", () => {
  for (const host of ["www.google.com", "www.google.co.in", "google.com.pk", "www.google.com.vn"]) {
    assert.deepEqual(landingAttribution(`https://${host}/search?q=private`, "?email=private"), {
      page_referrer: "https://www.google.com/",
      campaign_source: "google",
      campaign_medium: "organic",
    });
  }
  for (const referrer of ["", "https://google.com.example.invalid/", "https://www.billiondollarfx.com/verify-identity?token=private", "ftp://google.com/"]) {
    assert.deepEqual(landingAttribution(referrer, ""), { page_referrer: "" });
  }
});

test("the tagged staff link and tagged ad landings stay separate from organic traffic", () => {
  const google = "https://www.google.com/";
  assert.deepEqual(landingAttribution(google, "?utm_source=bdfx_team&utm_medium=internal&email=private"), {
    page_referrer: "",
    campaign_source: "bdfx_team",
    campaign_medium: "internal",
  });
  for (const search of ["?gclid=private", "?wbraid=private", "?fbclid=private", "?utm_medium=cpc", "?utm_source=bdfx_team", "?utm_source=unknown&utm_medium=internal"]) {
    assert.deepEqual(landingAttribution(google, search), { page_referrer: "" });
  }
});

test("Meta landings return only fixed event names and reserve paid for explicit Meta campaign tags", () => {
  assert.equal(metaLandingEvent("", "?utm_source=IG&utm_medium=paid-social&fbclid=private-click-id"), "bdfx_meta_paid_landing");
  assert.equal(metaLandingEvent("", "?utm_source=facebook&utm_medium=cpc&email=private"), "bdfx_meta_paid_landing");
  assert.equal(metaLandingEvent("", "?fbclid=private-click-id"), "bdfx_meta_landing");
  assert.equal(metaLandingEvent("https://l.facebook.com/l.php?u=private", ""), "bdfx_meta_landing");
  assert.equal(metaLandingEvent("", "?utm_source=instagram&utm_medium=organic"), "bdfx_meta_landing");
  assert.equal(metaLandingEvent("https://instagram.com.example.invalid/", ""), null);
  assert.equal(metaLandingEvent("https://l.instagram.com/", "?utm_source=bdfx_team&utm_medium=internal&fbclid=private"), null);
  assert.equal(metaLandingEvent("https://facebook.com/", "?gclid=private"), null);
});

test("article path candidates match canonical public slug syntax", () => {
  assert.equal(publicBlogPath.test("/blogs/mt5-symbol-specifications"), true);
  for (const path of ["/blogs", "/blogs/a/b", "/blogs/%40example", "/blogs/slug?email=private", "/blogs/slug#fragment"]) {
    assert.equal(publicBlogPath.test(path), false);
  }
});
