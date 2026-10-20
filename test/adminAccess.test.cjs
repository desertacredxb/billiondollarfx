const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const ts = require("typescript");
const Module = require("node:module");
const source = ts.transpileModule(readFileSync(require.resolve("../lib/adminAccess.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const compiled = new Module("adminAccessTest"); compiled._compile(source, "adminAccessTest.js");
const { adminHome, canAccessAdminPath } = compiled.exports;

test("manager navigation opens an allowed section and hides owner-only controls", () => {
  const manager = { role: "manager", permissions: ["support", "enquiries"] };
  assert.equal(adminHome(manager), "/tickets");
  assert.equal(canAccessAdminPath(manager, "/tickets"), true);
  assert.equal(canAccessAdminPath(manager, "/enquiries"), true);
  for (const path of ["/users", "/payout-requests", "/staff-users", "/activity-log", "/adminDashboard"]) assert.equal(canAccessAdminPath(manager, path), false);
});

test("owners retain staff/history access while managers only receive their selected operational sections", () => {
  const owner = { role: "owner", permissions: [] };
  assert.equal(adminHome(owner), "/adminDashboard");
  assert.equal(canAccessAdminPath(owner, "/staff-users"), true);
  assert.equal(canAccessAdminPath(owner, "/activity-log"), true);
  assert.equal(canAccessAdminPath({ role: "manager", permissions: ["content"] }, "/blog-management/add"), true);
});
