const assert = require("node:assert/strict");
const test = require("node:test");
const { readFileSync } = require("node:fs");
const ts = require("typescript");
const originalLoader = require.extensions[".ts"];
require.extensions[".ts"] = (module, filename) => {
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  module._compile(outputText, filename);
};
const { authenticatedFetch, api } = require("../lib/apiClient.ts");
if (originalLoader) require.extensions[".ts"] = originalLoader; else delete require.extensions[".ts"];

const backend = "https://api.example.invalid";
process.env.NEXT_PUBLIC_API_BASE = backend;
global.window = { location: { origin: "https://bdfx.example.invalid", pathname: "/dashboard" } };
global.localStorage = { getItem: key => ({ token: "client-test-token", adminToken: "admin-test-token" })[key] || null };
const captured = [];
global.fetch = async (url, init) => { captured.push({ url, init }); return { ok: true }; };

test("authenticated fetch attaches the client token to backend account and KYC requests", async () => {
  await authenticatedFetch(`${backend}/api/auth/user/test@example.invalid`);
  assert.equal(captured.at(-1).init.headers.get("Authorization"), "Bearer client-test-token");
  await authenticatedFetch(`${backend}/api/mt5/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  assert.equal(captured.at(-1).init.headers.get("Authorization"), "Bearer client-test-token");
  assert.equal(captured.at(-1).init.headers.get("Content-Type"), "application/json");
});

test("admin requests select the admin session, including same-origin blog mutations", async () => {
  window.location.pathname = "/blog-management/edit/test";
  await authenticatedFetch("/api/blogs/test", { method: "PUT" });
  assert.equal(captured.at(-1).init.headers.get("Authorization"), "Bearer admin-test-token");
  window.location.pathname = "/dashboard";
});

test("external rates and lookalike origins never receive stored authentication tokens", async () => {
  for (const url of ["https://external.example.invalid/api/latest", "https://api.example.invalid.evil.test/api/auth", "https://api.example.invalid/other"]) {
    await authenticatedFetch(url);
    assert.equal(captured.at(-1).init.headers.has("Authorization"), false);
  }
});

test("axios-backed profile, payment and settings calls use the same scoped session policy", async () => {
  let header;
  await api.get(`${backend}/api/payment/deposit/1001`, { adapter: async config => {
    header = config.headers.get("Authorization");
    return { data: {}, status: 200, statusText: "OK", headers: {}, config };
  } });
  assert.equal(header, "Bearer client-test-token");
});
