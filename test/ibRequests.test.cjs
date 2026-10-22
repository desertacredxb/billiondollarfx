const assert = require("node:assert/strict");
const test = require("node:test");
const { readFileSync } = require("node:fs");
const ts = require("typescript");
const originalLoader = require.extensions[".ts"];
require.extensions[".ts"] = (module, filename) => {
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  module._compile(outputText, filename);
};
const { loadIBRequests } = require("../lib/ibRequests.ts");
if (originalLoader) require.extensions[".ts"] = originalLoader; else delete require.extensions[".ts"];
const response = (data, status = 200) => async () => ({ ok: status >= 200 && status < 300, status, json: async () => data });

test("HTTP failure, error objects and malformed rows never become a renderable IB list", async () => {
  await assert.rejects(loadIBRequests(response({ message: "Server error" }, 500)), /Unable to load/);
  await assert.rejects(loadIBRequests(response({ message: "Server error" })), /Unable to read/);
  await assert.rejects(loadIBRequests(response([{ _id: "ib1", email: null, status: "pending" }])), /Unable to read/);
  await assert.rejects(loadIBRequests(response(null)), /Unable to read/);
  await assert.rejects(loadIBRequests(response({}, 401)), /session has expired/);
});
test("successful retry returns the real IB list and normalizes legacy commission amounts for rendering", async () => {
  const records = ["12.5", null, "not-a-number"].map((commission, index) => ({ _id: `ib${index}`, email: `synthetic${index}@example.invalid`, status: "rejected", statusReason: "Original reason", commission }));
  const result = await loadIBRequests(response(records));
  assert.equal(result.length, 3); assert.equal(result[0].commission.toFixed(2), "12.50");
  assert.equal(result[1].commission, undefined); assert.equal(result[2].commission, undefined);
  assert.equal(result[0].statusReason, "Original reason"); assert.deepEqual(await loadIBRequests(response([])), []);
});
