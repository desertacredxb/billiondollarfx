const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const previous = require.extensions[".ts"];
require.extensions[".ts"] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, file);
const { buddyContext, buddyLinkContext, buddyField, buddyCopy, buddyGuides, buddyQuestion, registrationBuddyIssue, announceBuddyIssue, BUDDY_ISSUE_EVENT } = require("../lib/bdfxBuddy.ts");
if (previous) require.extensions[".ts"] = previous; else delete require.extensions[".ts"];

test("Buddy never offers proactive guidance on staff or API pages and actions remain fixed internal routes", () => {
  for (const path of ["/admin", "/admin-login", "/users", "/IB", "/chat-reports", "/business-report", "/staff-users", "/website-analytics", "/blog-management/secret/edit", "/api/private"]) assert.equal(buddyContext(path), null);
  for (const path of ["/register", "/verify-identity", "/deposits", "/withdrawals", "/platform"]) assert.match(buddyContext(path).href, /^\/(?!\/)/);
  assert.deepEqual(buddyContext("/register?token=private#secret"), buddyContext("/register"));
  for (const path of ["https://outside.invalid/register", "//outside.invalid", "/Privacy-Policy", "/unknown"]) assert.equal(buddyLinkContext(path), null);
  assert.equal(buddyLinkContext("/deposits").question, 4);
});
test("field guidance uses form schema only and recognizes OTP, international phone and confirmation fields", () => {
  assert.equal(buddyField("confirmPassword", "password"), "confirm");
  assert.equal(buddyField("phone", "tel"), "phone");
  assert.equal(buddyField("", "text", "otp"), "otp");
  assert.equal(buddyField("amount", "number"), "amount");
  assert.equal(buddyField("city", "text"), null);
  assert.equal(buddyField("unrelated", "text", "untrusted-help"), null);
});
test("real registration errors reduce to safe help IDs rather than echoing personal data", () => {
  const cases = [
    ["Email already registered: private@example.invalid", "duplicate"],
    ["Passwords do not match.", "confirm"],
    ["Password must be between 8 and 16 characters long.", "password"],
    ["The code could not be verified.", "otp"],
    ["We don't accept UAE clients.", "country"],
    ["Please accept the terms and conditions.", "terms"],
    ["Unable to register. Please check your connection.", "connection"],
  ];
  for (const [message, expected] of cases) assert.equal(registrationBuddyIssue(message), expected);
});
test("every new guidance branch and control is translated in all six existing languages", () => {
  assert.deepEqual(Object.keys(buddyCopy).sort(), ["bn", "en", "hi", "id", "th", "vi"]);
  const controls = Object.keys(buddyCopy.en).filter(key => key !== "guides");
  for (const copy of Object.values(buddyCopy)) {
    for (const key of controls) assert.ok(copy[key].trim(), key);
    assert.deepEqual(Object.keys(copy.guides).sort(), [...buddyGuides].sort());
    for (const id of buddyGuides) { assert.ok(copy.guides[id].length > 20); assert.ok(buddyQuestion(id) >= 0 && buddyQuestion(id) < 14); }
  }
  assert.match(buddyCopy.en.guides.payment, /instead of paying again/);
  assert.match(buddyCopy.en.guides.terms, /Marketing consent is optional/);
});
test("error notification exposes only an allowlisted ID and performs no request or transaction", () => {
  const oldWindow = global.window, oldEvent = global.CustomEvent, oldFetch = global.fetch;
  const received = [];
  global.CustomEvent = class { constructor(type, init) { this.type = type; this.detail = init.detail; } };
  global.window = { dispatchEvent: event => received.push(event) };
  global.fetch = () => { throw new Error("Buddy guidance must stay local"); };
  try {
    announceBuddyIssue("payment");
    announceBuddyIssue("private@example.invalid");
    assert.equal(received.length, 1);
    assert.equal(received[0].type, BUDDY_ISSUE_EVENT);
    assert.deepEqual(received[0].detail, { guide: "payment" });
  } finally { global.window = oldWindow; global.CustomEvent = oldEvent; global.fetch = oldFetch; }
});
