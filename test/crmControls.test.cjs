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
const LeadDetails = load("../components/crm/LeadDetails.tsx", { "../../lib/crm": crm, "../../lib/apiClient": api }).default;
const lead = { id: "lead-1", leadId: "BDFX-test", name: "Fixture", phone: "+12025550101", status: "new", source: "COMEXFOREX" };

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
    "../../../../components/crm/DialPad": () => null,
    "../../../../components/crm/CallAssistant": () => null,
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
