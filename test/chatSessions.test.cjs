const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const previousTs = require.extensions[".ts"], previousTsx = require.extensions[".tsx"];
const compile = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText, file);
require.extensions[".ts"] = compile; require.extensions[".tsx"] = compile;
const { chatEvent, newChatCapability, supportChatRequest } = require("../lib/supportChatSession.ts");
const { chatSessionCopy } = require("../lib/chatSessionCopy.ts");
const ChatContactForm = require("../components/chat/ChatContactForm.tsx").default;
if (previousTs) require.extensions[".ts"] = previousTs; else delete require.extensions[".ts"];
if (previousTsx) require.extensions[".tsx"] = previousTsx; else delete require.extensions[".tsx"];

test("saved-session credentials are independent random capabilities and activity contains no typed search or contact values", () => {
  const first = newChatCapability(), second = newChatCapability();
  assert.notEqual(first.id, second.id); assert.notEqual(first.secret, second.secret); assert.match(first.secret, /^[a-f\d]{64}$/);
  const event = chatEvent("answer", "hi", { email: "never-send@example.invalid", query: "private OTP" }, 6);
  assert.deepEqual(Object.keys(event).sort(), ["eventId", "language", "question", "type"]);
  assert.equal(JSON.stringify(event).includes("private"), false);
  for (const call of [() => chatEvent("message", "en"), () => chatEvent("topic", "en", "outside"), () => chatEvent("answer", "en", undefined, { private: "secret" }), () => chatEvent("answer", "en", undefined, 999)]) assert.throws(call);
});
test("support activity uses its own header, no cookies or login credentials, no referrer and no secret in URLs", async () => {
  process.env.NEXT_PUBLIC_API_BASE = "https://api.example.invalid";
  const original = global.fetch, calls = [];
  global.fetch = async (url, init) => { calls.push({ url, init }); return { ok: true, status: 204 }; };
  try {
    const capability = newChatCapability();
    await supportChatRequest(`/sessions/${capability.id}/events`, chatEvent("topic", "en", "deposit"), capability);
    const { url, init } = calls[0];
    assert.equal(init.headers["X-BDFX-Chat-Token"], capability.secret);
    assert.equal(init.headers.Authorization, undefined); assert.equal(init.credentials, "omit"); assert.equal(init.cache, "no-store"); assert.equal(init.referrerPolicy, "no-referrer");
    assert.equal(url.includes(capability.secret), false); assert.equal(init.body.includes(capability.secret), false);
  } finally { global.fetch = original; }
});
test("all six follow-up forms show separate unchecked permission and optional international phone, without submitting during render", () => {
  assert.deepEqual(Object.keys(chatSessionCopy).sort(), ["bn", "en", "hi", "id", "th", "vi"]);
  const keys = Object.keys(chatSessionCopy.en).sort();
  for (const [language, copy] of Object.entries(chatSessionCopy)) {
    assert.deepEqual(Object.keys(copy).sort(), keys); for (const value of Object.values(copy)) assert.ok(value.length > 1);
    const html = renderToStaticMarkup(React.createElement(ChatContactForm, { language, submit: () => assert.fail("render submitted a lead") }));
    assert.match(html, /name="consent"/); assert.doesNotMatch(html, /checked=""/);
    assert.match(html, /type="email"[^>]*required/); assert.match(html, /type="tel"/);
    assert.ok(html.includes(copy.consent));
  }
  assert.match(chatSessionCopy.en.notice, /without saving/); assert.match(chatSessionCopy.en.consent, /not marketing consent/);
});
