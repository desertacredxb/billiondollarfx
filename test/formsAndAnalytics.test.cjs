const test = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const { readFileSync } = require("node:fs");
const originalLoader = require.extensions[".ts"];
require.extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
process.env.NEXT_PUBLIC_GA4_ENABLED = "true";
process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID = "G-TEST123456";
const { validateTicket } = require("../lib/supportForms.ts");
const { analyticsConsentKey, publicAnalyticsPaths, trackConversion } = require("../lib/analytics.ts");
if (originalLoader) require.extensions[".ts"] = originalLoader; else delete require.extensions[".ts"];
test("support fields reject whitespace, invalid categories and excessive input while accepting trimmed client text", () => {
  assert.deepEqual(validateTicket({ category: "MT5 Support", subject: " Help with MT5 ", description: " Connection is failing. " }), {});
  const errors = validateTicket({ category: "invented", subject: "   ", description: "x".repeat(5001) });
  assert.deepEqual(Object.keys(errors).sort(), ["category", "description", "subject"]);
});
test("conversion events require consent and contain only fixed metadata, never private URLs or form data", () => {
  const captured = []; let granted = false;
  global.window = { location: { href: "https://bdfx.example.invalid/register?email=private@example.invalid&token=secret" }, gtag: (...args) => captured.push(args) };
  global.localStorage = { getItem: key => key === analyticsConsentKey && granted ? "granted" : "denied" };
  trackConversion("sign_up"); assert.equal(captured.length, 0);
  granted = true; trackConversion("sign_up"); trackConversion("generate_lead");
  assert.equal(captured.length, 2);
  assert.equal(captured[0][1], "sign_up"); assert.equal(captured[1][1], "generate_lead");
  const payload = JSON.stringify(captured);
  for (const value of ["private@example.invalid", "token=secret", "?email="]) assert.equal(payload.includes(value), false);
  for (const path of ["/settings", "/register", "/dashboard", "/verify-identity", "/staff-users", "/business-report"]) assert.equal(publicAnalyticsPaths.has(path), false);
});
