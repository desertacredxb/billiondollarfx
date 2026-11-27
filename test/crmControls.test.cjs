const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const Module = require("node:module");
const { dirname } = require("node:path");
const test = require("node:test");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const ts = require("typescript");

function load(path, imports) {
  const filename = require.resolve(path);
  const compiled = new Module(filename, module);
  compiled.filename = filename;
  compiled.paths = Module._nodeModulePaths(dirname(filename));
  const requireModule = compiled.require.bind(compiled);
  compiled.require = name => Object.hasOwn(imports, name) ? imports[name] : requireModule(name);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } });
  compiled._compile(outputText, filename);
  return compiled.exports;
}

function find(tree, predicate) {
  if (Array.isArray(tree)) return tree.map(node => find(node, predicate)).find(Boolean);
  if (!tree?.props) return;
  return predicate(tree) ? tree : find(tree.props.children, predicate);
}

const api = { get() {}, post() {} };
const crm = load("../lib/crm.ts", { "./apiClient": api });
const LeadDetails = load("../components/crm/LeadDetails.tsx", { "../../lib/crm": crm, "../../lib/apiClient": api, "./WorkChat": () => null }).default;
const lead = { id: "lead-1", leadId: "BDFX-test", name: "Fixture", phone: "+12025550101", status: "new", source: "COMEXFOREX" };

test("agent work queue offers email editing and explicit outcomes before advancing", () => {
  const view = props => renderToStaticMarkup(React.createElement(LeadDetails, {
    lead, owner: false, mode: "unconfigured", onClose() {}, onChange() {}, onSaved() {}, ...props,
  }));
  assert.match(view({ allowNext: true }), /Add email/);
  assert.match(view({ allowNext: true }), /disabled=""[^>]*>Save &amp; open next lead/);
  assert.match(view({ lead: { ...lead, email: "contact@example.test" } }), /Edit email/);
  assert.doesNotMatch(view({ readOnly: true }), /Add email|Edit email|Save outcome/);
});

test("lead CSV accepts the Email ID heading", async () => {
  const { readCrmFile } = load("../lib/crmImport.ts", {});
  const data = await readCrmFile({ name: "contacts.csv", text: async () => "Phone,Email ID\n+12025550101,contact@example.test" });
  assert.equal(data.leads[0].email, "contact@example.test");
});

test("a selected lead list stays selected when Data bank is opened again", async () => {
  let cursor;
  let effects;
  const state = [];
  const requests = [];
  const hooks = {
    useState(initial) {
      const key = cursor++;
      if (!(key in state)) state[key] = typeof initial === "function" ? initial() : initial;
      return [state[key], value => { state[key] = typeof value === "function" ? value(state[key]) : value; }];
    },
    useEffect(effect) { effects.push(effect); },
    useRef() { return { current: null }; },
  };
  const pageApi = { async get(url, { params }) {
    if (url.endsWith("/overview")) return { data: { agents: [], dialerMode: "live" } };
    requests.push([params.view, params.page]);
    return { data: { rows: [lead], page: params.page, limit: 50, total: 301 } };
  } };
  const Page = load("../src/app/(admin)/crm/page.tsx", {
    react: hooks,
    "../../../../lib/apiClient": pageApi,
    "../../../../lib/adminSession": { useAdminSession: () => ({ role: "owner" }) },
    "../../../../lib/crm": crm,
    "../../../../lib/crmImport": {},
    "../../../../components/crm/LeadDetails": LeadDetails,
    "../../../../components/crm/IbReferrals": () => null,
    "../../../../components/crm/LeadBoard": () => null,
    "../../../../components/crm/CallPay": () => null,
    "../../../../components/crm/LeadDistribution": () => null,
    "../../../../components/crm/DialPad": () => null,
    "../../../../components/crm/CallAssistant": () => null,
    "../../../../components/crm/OwnerChannels": () => null,
    "../../../../components/crm/WorkConnections": () => null,
  }).default;
  function render() { cursor = 0; effects = []; return Page(); }
  async function loadRows() { effects[1](); await new Promise(setImmediate); }
  const select = tree => find(tree, node => node.type === "label" && node.props.children[0] === "Lead list").props.children[1];
  const click = (tree, label) => find(tree, node => node.type === "button" && node.props.children === label).props.onClick();

  select(render()).props.onChange({ target: { value: "follow_ups" } });
  let tree = render();
  assert.equal(select(tree).props.value, "follow_ups");
  await loadRows();
  click(render(), "Next");
  render();
  await loadRows();
  click(render(), "Next");
  render();
  await loadRows();
  click(render(), "Work queue");
  click(render(), "Data bank");
  tree = render();
  assert.equal(select(tree).props.value, "follow_ups");
  await loadRows();
  select(render()).props.onChange({ target: { value: "all" } });
  render();
  await loadRows();
  assert.deepEqual(requests, [["follow_ups", 1], ["follow_ups", 2], ["follow_ups", 3], ["follow_ups", 1], ["leads", 1]]);
});

test("the caller sees the dial action for an open lead before the dialer overview is loaded", () => {
  const view = (record, owner = false) => renderToStaticMarkup(React.createElement(LeadDetails, {
    lead: record, owner, mode: "unconfigured", onClose() {}, onChange() {},
  }));
  assert.match(view(lead), /Call via Hashmi/);
  assert.doesNotMatch(view(lead, true), /Call via Hashmi/);
  assert.doesNotMatch(view({ ...lead, status: "closed" }), /Call via Hashmi/);
});

test("eligible callers can open both apps from a no-answer lead using its international number", () => {
  const view = (record, permissions = {}) => renderToStaticMarkup(React.createElement(LeadDetails, {
    lead: record, owner: false, mode: "unconfigured", onClose() {}, onChange() {}, ...permissions,
  }));
  const followUp = { ...lead, phone: "001 (202) 555-0101", status: "follow_up", outcome: "no_answer" };
  const markup = view(followUp);
  assert.match(markup, /href="https:\/\/t\.me\/\+12025550101" target="_blank" rel="noopener noreferrer"/);
  assert.match(markup, /href="https:\/\/wa\.me\/12025550101" target="_blank" rel="noopener noreferrer"/);
  for (const blocked of [
    view(followUp, { readOnly: true }),
    view(followUp, { owner: true }),
    view({ ...followUp, status: "closed" }),
    view({ ...followUp, outcome: "do_not_call" }),
    view({ ...followUp, outcome: "number_not_in_use" }),
    view({ ...followUp, phone: "2025550101" }),
    view({ ...followUp, phone: "+12025550101?text=unexpected" }),
  ]) {
    assert.doesNotMatch(blocked, /href="https:\/\/(?:t\.me|wa\.me)\//);
  }
});

test("9ance agents see their dialer on an assigned lead and cannot call an opted-out lead", () => {
  const view = record => renderToStaticMarkup(React.createElement(LeadDetails, {
    lead: record, owner: false, dialer: "9ance", mode: "live", onClose() {}, onChange() {},
  }));
  assert.match(view(lead), /Call via 9ance/);
  assert.doesNotMatch(view(lead), /Call via Hashmi/);
  assert.doesNotMatch(view({ ...lead, outcome: "do_not_call" }), /Call via 9ance/);
  assert.match(crm.dialMessage({ provider: "9ance", state: "unconfirmed", mode: "live" }), /not been confirmed/);
});

test("agents have the requested call outcomes, in-CRM Telegram and standalone reminders on an open lead", () => {
  const view = props => renderToStaticMarkup(React.createElement(LeadDetails, { lead, owner: false, mode: "live", ...props }));
  const markup = view({});
  for (const label of ["Ringing but no response", "Switched off", "Not reachable", "Call back", "Follow up", "Number forwarded to voicemail"]) {
    assert.match(markup, new RegExp(">" + label + "</option>"));
  }
  assert.match(markup, /Telegram inbox/);
  assert.match(markup, /Chat on WhatsApp/);
  assert.match(markup, /Set reminder/);
  assert.match(markup, /Feedback and call history/);
  assert.doesNotMatch(markup, /Transfer lead/);
  assert.match(view({ owner: true }), /Transfer lead/);
  assert.doesNotMatch(view({ lead: { ...lead, outcome: "do_not_call" } }), /Telegram inbox|Set reminder|Chat on WhatsApp/);
});

test("a stage preview opens a record or its full scoped list", () => {
  const Board = load("../components/crm/LeadBoard.tsx", { "../../lib/crm": crm }).default;
  let selected, stage;
  const tree = Board({ lanes: [{ stage: "worked", total: 52, rows: [{ ...lead, outcome: "switched_off", note: "Test note" }] }],
    onOpen(value) { selected = value; }, onStage(value) { stage = value; } });
  const html = renderToStaticMarkup(tree);
  assert.match(html, /In progress/);
  assert.match(html, /Switched off/);
  assert.match(html, /Test note/);
  find(tree, n => n.type === "button" && n.props.className.includes("text-left")).props.onClick();
  find(tree, n => n.type === "button" && n.props.className.includes("underline")).props.onClick();
  assert.equal(selected.id, lead.id);
  assert.equal(stage, "worked");
});
