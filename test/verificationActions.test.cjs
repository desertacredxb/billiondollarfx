const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const originalLoader = require.extensions[".ts"];
const originalTsxLoader = require.extensions[".tsx"];
const compile = (module, filename) => {
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  });
  module._compile(outputText, filename);
};
require.extensions[".ts"] = compile;
require.extensions[".tsx"] = compile;
const { verificationActions } = require("../lib/verificationActions.ts");
const IdentityNameCorrection = require("../components/settings/IdentityNameCorrection.tsx").default;
if (originalLoader) require.extensions[".ts"] = originalLoader;
else delete require.extensions[".ts"];
if (originalTsxLoader) require.extensions[".tsx"] = originalTsxLoader;
else delete require.extensions[".tsx"];

test("ordinary review keeps Edit name & resubmit without starting over before the name is saved", () => {
  const view = verificationActions({ enabled: true, approved: false, status: "review", canEditDetails: true });
  assert.equal(view.canEditName, true);
  assert.equal(view.canStart, false);
});
test("a saved correction continues to show Resubmit verification after a status refresh", () => {
  const view = verificationActions({ enabled: true, approved: false, status: "not_started", canEditDetails: true, resubmissionRequired: true });
  assert.equal(view.canEditName, true); assert.equal(view.canStart, true);
  assert.equal(view.startLabel, "Resubmit verification");
});
test("provider resubmission and retryable declines retain both correction and resubmit actions", () => {
  for (const status of ["resubmission_requested", "declined"]) {
    const view = verificationActions({ enabled: true, approved: false, status, canEditDetails: true, canRetry: status === "declined" });
    assert.equal(view.canEditName, true); assert.equal(view.canStart, true);
    assert.equal(view.startLabel, "Resubmit verification");
  }
});
test("approved clients and support-only holds do not receive correction or resubmit actions", () => {
  for (const status of ["approved", "manual_rejected", "test_approved", "review", "declined"]) {
    const view = verificationActions({ enabled: true, approved: status === "approved", managedByVeriff: true, status, canEditDetails: false });
    assert.equal(view.canEditName, false); assert.equal(view.canStart, false);
  }
});
test("new-client verification and the existing manual-to-Veriff IB flow remain available", () => {
  assert.equal(verificationActions({ enabled: true, approved: false, status: "not_started", canEditDetails: true }).startLabel, "Continue to Verify");
  const ib = verificationActions({ enabled: true, approved: true, status: "approved", managedByVeriff: false }, true);
  assert.equal(ib.needsIbVerification, true); assert.equal(ib.canStart, true);
  assert.equal(verificationActions(null).canStart, false);
});

test("the actual client correction control renders Edit name & resubmit and a name-only form", () => {
  const props = { allowed: true, editing: false, busy: false, fullName: "Example Client", onEdit() {}, onChange() {}, onSave() {}, onCancel() {} };
  const action = renderToStaticMarkup(React.createElement(IdentityNameCorrection, props));
  assert.match(action, />Edit name &amp; resubmit<\/button>/);
  const form = renderToStaticMarkup(React.createElement(IdentityNameCorrection, { ...props, editing: true }));
  assert.match(form, /name="fullName"/); assert.match(form, />Save details<\/button>/);
  assert.equal((form.match(/<input /g) || []).length, 1);
  assert.doesNotMatch(form, /<(?:input|select|textarea)[^>]*name="(?:address|state|city|postalCode|email|phone|nationality|residenceCountry)"/);
  assert.equal(renderToStaticMarkup(React.createElement(IdentityNameCorrection, { ...props, allowed: false })), "");
});
