const test = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const { readFileSync } = require("node:fs");
const previousLoader = require.extensions[".ts"];
require.extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
const { dubaiScheduleInput, dubaiScheduleValue, blogAuthor, blogResourceLinks } = require("../lib/blogSeo.ts");
if (previousLoader) require.extensions[".ts"] = previousLoader; else delete require.extensions[".ts"];

test("Dubai publication times round-trip across UTC midnight without using the server/browser zone", () => {
  assert.equal(dubaiScheduleInput("2026-10-20T22:30:00Z"), "2026-10-21T02:30");
  assert.equal(dubaiScheduleValue("2026-10-21T02:30"), "2026-10-20T22:30:00.000Z");
  assert.equal(dubaiScheduleValue(""), null);
  for (const value of ["2026-02-30T09:00", "2026-10-21T25:10", "not-a-date", "2026-10-21T09:00:00Z"]) assert.throws(() => dubaiScheduleValue(value));
});
test("publisher bylines use Organization markup while named writers remain people", () => {
  assert.equal(blogAuthor("Billion Dollar FX")["@type"], "Organization");
  assert.equal(blogAuthor("Admin Panel").name, "Billion Dollar FX");
  assert.deepEqual(blogAuthor("Example Writer"), { "@type": "Person", name: "Example Writer" });
});
test("automatic internal links stay on allowlisted public guides and match the article context", () => {
  assert.ok(blogResourceLinks({ title: "How forex pip value works" }).some(link => link.href === "/currency-calculator"));
  assert.ok(blogResourceLinks({ title: "Economic calendar release times" }).some(link => link.href === "/economic-calendar"));
  assert.ok(blogResourceLinks({ title: "MT5 demo orders" }).some(link => link.href === "/platform"));
  const links = blogResourceLinks({ title: "https://evil.invalid/?token=secret /admin /dashboard", tags: ["/settings"] });
  assert.deepEqual(links, [{ href: "/help-centre", label: "Find account and platform answers" }]);
});
