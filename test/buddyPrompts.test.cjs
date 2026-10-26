const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), ts = require("typescript"), previous = require.extensions[".ts"];
require.extensions[".ts"] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, file);
const { BuddyPromptBudget } = require("../lib/buddyPrompts.ts");
if (previous) require.extensions[".ts"] = previous; else delete require.extensions[".ts"];
const ready = { open: false, visible: true, editing: false, hasCue: false, mutedUntil: 0, now: 1000 };

test("Buddy can welcome a new page after exhausting help on the previous page", () => {
  const budget = new BuddyPromptBudget();
  assert.equal(budget.claim("/", ready), true);
  assert.equal(budget.claim("/", ready), true);
  assert.equal(budget.claim("/", ready), false);
  assert.equal(budget.claim("/platform", ready), true);
  budget.enter("/");
  assert.equal(budget.claim("/", ready), true);
});
test("an existing cue, chat, hidden tab, typing or dismissal does not use the prompt budget", () => {
  for (const blocked of [{ hasCue: true }, { open: true }, { visible: false }, { editing: true }, { mutedUntil: 2000 }]) {
    const budget = new BuddyPromptBudget();
    assert.equal(budget.claim("/register", { ...ready, ...blocked }), false);
    assert.equal(budget.count, 0);
    assert.equal(budget.claim("/register", ready), true);
  }
});
test("dismissal still applies across navigation and expires without a reload", () => {
  const budget = new BuddyPromptBudget();
  assert.equal(budget.claim("/", ready), true);
  assert.equal(budget.claim("/platform", { ...ready, mutedUntil: 91000 }), false);
  assert.equal(budget.claim("/platform", { ...ready, mutedUntil: 91000, now: 91000 }), true);
});
