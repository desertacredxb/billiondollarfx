const test = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const { readFileSync } = require("node:fs");
const Module = require("node:module");
const filename = require.resolve("../src/app/api/reference-rates/route.ts");
const compiled = new Module(filename, module);
compiled.filename = filename;
compiled.paths = module.paths;
compiled._compile(ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
const { GET } = compiled.exports;
const request = query => new Request(`https://bdfx.example.invalid/api/reference-rates?${query}`);
test("reference rates reject invalid parameters before upstream requests and support identity conversion", async () => {
  global.fetch = () => assert.fail("invalid or identity conversion called upstream");
  assert.equal((await GET(request("base=USD&quote=../secret"))).status, 400);
  const same = await GET(request("base=USD&quote=USD"));
  assert.equal((await same.json()).rate, 1);
});
test("reference rates normalize provider currencies and return provider dates without invented fallback rates", async () => {
  let requested;
  global.fetch = async url => { requested = url; return Response.json([{ iso_code: "usd", name: "US Dollar" }, { iso_code: "bad/code", name: "Invalid" }]); };
  const currencies = await (await GET(request("currencies=1"))).json();
  assert.deepEqual(currencies.data, [{ code: "USD", name: "US Dollar" }]);
  assert.equal(requested, "https://api.frankfurter.dev/v2/currencies");
  global.fetch = async () => Response.json({ rate: 85.75, date: "2026-10-19" });
  const rate = await (await GET(request("base=usd&quote=inr"))).json();
  assert.equal(rate.base, "USD"); assert.equal(rate.rate, 85.75); assert.equal(rate.date, "2026-10-19");
  for (const data of [{ rate: "85", date: "2026-10-19" }, { rate: -1, date: "2026-10-19" }, { message: "missing" }]) {
    global.fetch = async () => Response.json(data);
    const failed = await GET(request("base=USD&quote=INR")); assert.equal(failed.status, 503); assert.equal((await failed.json()).rate, undefined);
  }
  global.fetch = async () => new Response("Upstream outage", { status: 503 });
  assert.equal((await GET(request("base=USD&quote=INR"))).status, 503);
});
