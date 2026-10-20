export interface ForexInputs { lots: number; contractSize: number; entry: number; exit: number; pipSize: number; leverage: number; marginRate: number; marginToAccount: number; profitToAccount: number; side: "buy" | "sell" }
/** Single-position Forex mode; see MetaTrader 5 margin_forex and MQL5 SYMBOL_CALC_MODE_FOREX. */
export function forexEstimate(input: ForexInputs) {
  const { lots, contractSize, entry, exit, pipSize, leverage, marginRate, marginToAccount, profitToAccount, side } = input;
  if (Object.entries(input).some(([key, value]) => key !== "side" && (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || value > 1e12)) || leverage > 500 || !["buy", "sell"].includes(side)) return null;
  const units = lots * contractSize, move = (exit - entry) * (side === "buy" ? 1 : -1);
  const result = { units, margin: units / leverage * marginRate * marginToAccount, pipValue: units * pipSize * profitToAccount, profit: units * move * profitToAccount, pips: move / pipSize };
  return Object.values(result).every(Number.isFinite) ? result : null;
}
