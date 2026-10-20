const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");
const ts = require("typescript");
const PhoneInput = require("react-phone-input-2").default;

const originalLoader = require.extensions[".ts"];
require.extensions[".ts"] = (module, filename) => {
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  module._compile(outputText, filename);
};
const { getAccountRegistrationDetails } = require("../lib/accountRegistration.ts");
if (originalLoader) require.extensions[".ts"] = originalLoader;
else delete require.extensions[".ts"];

function assertPhoneInputAccepts(mobile) {
  assert.equal(typeof mobile, "string");
  const input = new PhoneInput({ ...PhoneInput.defaultProps, country: "us", value: mobile });
  input.setState = state => { input.state = { ...input.state, ...state }; };
  assert.doesNotThrow(() => input.updateFormattedNumber(mobile));
}

test("the minimal OTP user does not crash the account phone field", () => {
  const details = getAccountRegistrationDetails({ fullName: "Test Client", email: "test@example.com" });
  assert.equal(details.mobile, "");
  assertPhoneInputAccepts(details.mobile);
});

test("a fetched Veriff profile keeps its international phone prefix once", () => {
  const details = getAccountRegistrationDetails({
    fullName: "Test Client", email: "test@example.com", nationality: "India", phone: "+919876543210",
  });
  assert.equal(details.mobile, "919876543210");
  assert.equal(details.Fname, "Test");
  assert.equal(details.Lname, "Client");
  assertPhoneInputAccepts(details.mobile);
});

test("a phone calling code may differ from the client's nationality", () => {
  const details = getAccountRegistrationDetails({ nationality: "India", phone: "+44 7700 900123" });
  assert.equal(details.mobile, "447700900123");
  assertPhoneInputAccepts(details.mobile);
});

test("legacy national phone numbers still receive their calling code", () => {
  const details = getAccountRegistrationDetails({ nationality: "India", phone: "9876543210" });
  assert.equal(details.mobile, "919876543210");
  assert.equal(details.countryIso, "in");
  assertPhoneInputAccepts(details.mobile);
});

test("a 00 international prefix is preserved without a duplicate calling code", () => {
  const details = getAccountRegistrationDetails({ nationality: "India", phone: "00447700900123" });
  assert.equal(details.mobile, "447700900123");
  assertPhoneInputAccepts(details.mobile);
});

test("missing and malformed profile fields stay safe for the form", () => {
  for (const profile of [null, {}, { fullName: null, phone: NaN, email: null }, { nationality: "Unknown", phone: "+995 555 010101" }]) {
    const details = getAccountRegistrationDetails(profile);
    assert.equal(details.Fname, "");
    assert.equal(details.Lname, "");
    assertPhoneInputAccepts(details.mobile);
  }
});
