const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"), ts = require("typescript"), previous = require.extensions[".ts"];
require.extensions[".ts"] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, file);
const { askBuddyAi, buddyAiAvailable, buddyAiCopy } = require("../lib/buddyAi.ts");
if (previous) require.extensions[".ts"] = previous; else delete require.extensions[".ts"];
test("AI requires its own consent and sends only the submitted question and fixed context", async () => {
  const old = process.env.NEXT_PUBLIC_API_BASE; process.env.NEXT_PUBLIC_API_BASE = "https://backend.example.test";
  try {
    let calls = 0;
    const transport = async (url, opts) => {
      calls++; assert.equal(url, "https://backend.example.test/api/support-chat/n8n/reply");
      assert.equal(opts.credentials, "omit"); assert.equal(opts.referrerPolicy, "no-referrer");
      assert.deepEqual(JSON.parse(opts.body), { language: "hi", message: "How does verification work?", consent: true, contextQuestion: 2 });
      assert.deepEqual(Object.keys(opts.headers), ["Content-Type"]);
      return { ok: true, json: async () => ({ language: "hi", answer: "सुरक्षित क्लाइंट क्षेत्र में वेरिफिकेशन शुरू करें।" }) };
    };
    await assert.rejects(askBuddyAi("hi", "How does verification work?", false, 2, new AbortController().signal, transport));
    assert.equal(calls, 0);
    assert.match(await askBuddyAi("hi", " How does verification work? ", true, 2, new AbortController().signal, transport), /वेरिफिकेशन/);
    assert.equal(calls, 1);
  } finally { if (old === undefined) delete process.env.NEXT_PUBLIC_API_BASE; else process.env.NEXT_PUBLIC_API_BASE = old; }
});
test("AI panel stays unavailable until backend readiness and consent support are confirmed", async () => {
  const old = process.env.NEXT_PUBLIC_API_BASE; process.env.NEXT_PUBLIC_API_BASE = "https://backend.example.test";
  try {
    for (const data of [{ available: false, requiresConsent: true }, { available: true }, {}]) assert.equal(await buddyAiAvailable(new AbortController().signal, async () => ({ ok: true, json: async () => data })), false);
    assert.equal(await buddyAiAvailable(new AbortController().signal, async () => ({ ok: true, json: async () => ({ available: true, requiresConsent: true }) })), true);
    await assert.rejects(askBuddyAi("en", "Help me", true, null, new AbortController().signal, async () => ({ ok: false, json: async () => ({ code: "PRIVATE_PROVIDER_TRACE" }) })), { code: "ASSISTANT_UNAVAILABLE" });
  } finally { if (old === undefined) delete process.env.NEXT_PUBLIC_API_BASE; else process.env.NEXT_PUBLIC_API_BASE = old; }
});
test("AI consent, privacy, failure and controls are translated in all existing languages", () => {
  assert.deepEqual(Object.keys(buddyAiCopy).sort(), ["bn", "en", "hi", "id", "th", "vi"]);
  for (const copy of Object.values(buddyAiCopy)) for (const key of Object.keys(buddyAiCopy.en)) assert.ok(copy[key].length > 3, key);
});

