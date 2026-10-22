const test = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const { readFileSync } = require("node:fs");
const Module = require("node:module");
const compiled = new Module("tradingMathTest");
compiled._compile(ts.transpileModule(readFileSync(require.resolve("../lib/tradingMath.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, "tradingMathTest.js");
const { forexEstimate } = compiled.exports;
const example = { lots: 0.1, contractSize: 100000, entry: 1.1, exit: 1.11, pipSize: 0.0001, leverage: 100, marginRate: 1, marginToAccount: 1.1, profitToAccount: 1, side: "buy" };
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);

test("Forex-mode estimates correctly convert margin and profit currencies without treating pip size as a price digit", () => {
  const result = forexEstimate(example);
  close(result.units, 10000); close(result.margin, 110); close(result.pipValue, 1); close(result.profit, 100); close(result.pips, 100);
  const short = forexEstimate({ ...example, side: "sell", profitToAccount: 2, marginToAccount: 3, marginRate: 1.15 });
  close(short.profit, -200); close(short.pipValue, 2); close(short.margin, 345);
});

test("JPY-style quotes and invalid inputs do not produce misleading results", () => {
  const yen = forexEstimate({ ...example, entry: 150, exit: 151, pipSize: 0.01, marginToAccount: 1, profitToAccount: 1 / 150 });
  close(yen.pips, 100); close(yen.margin, 100); close(yen.profit, 10000 / 150);
  for (const patch of [{ lots: NaN }, { contractSize: -1 }, { leverage: 0 }, { leverage: 501 }, { pipSize: Infinity }, { side: "anything" }]) assert.equal(forexEstimate({ ...example, ...patch }), null);
});
