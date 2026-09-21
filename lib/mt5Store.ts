import axios from "axios";
import { useEffect } from "react";
import { create } from "zustand";

// Single source of truth for live account balance on the client. Previously
// dashboard/page.tsx read balance from the legacy MoneyPlantFX API
// (/api/moneyplant/checkBalance) while live-accounts/page.tsx,
// withdrawals/page.tsx, and the admin WithdrawalApprovalModal each read from
// live MT5 (/api/mt5/user) independently - same accountNo, different numbers
// depending which page you were on. This store is the one place that knows
// the MT5 response shape and normalizes it; every consumer reads from here.
export interface MT5AccountSummary {
  balance: string;
  credit: string;
  equity: string;
  margin: string;
  marginFree: string;
  group: string;
  rights: string;
  registration: string;
}

/**
 * One-shot fetch + normalization of the MT5 response shape. This is the one
 * place that knows the raw field names (Balance/Credit/... PascalCase from
 * the live MT5 API) - reused by both the client-side store below (which adds
 * caching/polling on top) and any caller that wants a plain, un-cached fetch
 * (e.g. the admin approval modal - see note on that hook further down).
 */
export async function fetchMT5AccountSummary(
  accountNo: string
): Promise<MT5AccountSummary | null> {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_API_BASE}/api/mt5/user`,
    { params: { login: accountNo } }
  );

  if (!res.data?.success || !res.data?.data) return null;

  const data = res.data.data;

  return {
    balance: String(data.Balance ?? data.balance ?? "0"),
    credit: String(data.Credit ?? data.credit ?? "0"),
    equity: String(data.Equity ?? data.equity ?? "0"),
    margin: String(data.Margin ?? data.margin ?? "0"),
    marginFree: String(data.MarginFree ?? data.marginFree ?? "0"),
    group: data.Group || "",
    rights: data.Rights || "",
    registration: data.Registration || "",
  };
}

interface MT5StoreState {
  summaries: Record<string, MT5AccountSummary | null>;
  fetchedAt: Record<string, number>;
  refreshSummary: (accountNo: string) => Promise<void>;
}

const useMT5Store = create<MT5StoreState>((set) => ({
  summaries: {},
  fetchedAt: {},
  refreshSummary: async (accountNo: string) => {
    try {
      const summary = await fetchMT5AccountSummary(accountNo);

      set((state) => ({
        summaries: { ...state.summaries, [accountNo]: summary },
        fetchedAt: { ...state.fetchedAt, [accountNo]: Date.now() },
      }));
    } catch (error) {
      // Leave the last-known cached value in place on failure rather than
      // clearing it - a transient MT5/network hiccup shouldn't blank out a
      // balance that was showing correctly a moment ago.
      console.error("Error fetching MT5 account summary:", error);
    }
  },
}));

const POLL_INTERVAL_MS = 20_000;

/**
 * Live-updating MT5 balance/summary for one accountNo. Fetches immediately on
 * mount (and whenever accountNo changes), then polls lightly while this hook
 * instance stays mounted - the interval is cleared on unmount, so an account
 * nobody currently has in view stops being polled.
 *
 * This is for client-facing pages where one logged-in user is looking at
 * their own account(s) (dashboard, live-accounts, withdrawals). Do NOT use
 * this in the admin panel: admin cycles through many different accounts on
 * demand while deciding whether to approve a withdrawal, and needs an
 * explicit, freshly-fetched number with its own loading state at that exact
 * moment - not a shared, polling, possibly-stale cross-account cache. Admin
 * should call `fetchMT5AccountSummary` directly instead (see
 * WithdrawalApprovalModal.tsx).
 */
export function useMT5AccountSummary(accountNo: string | number | undefined | null) {
  const key = accountNo !== undefined && accountNo !== null ? String(accountNo) : undefined;

  const summary = useMT5Store((s) => (key ? s.summaries[key] ?? null : null));
  const refreshSummary = useMT5Store((s) => s.refreshSummary);

  useEffect(() => {
    if (!key) return;

    refreshSummary(key);
    const interval = setInterval(() => refreshSummary(key), POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [key, refreshSummary]);

  return {
    summary,
    refresh: () => {
      if (key) refreshSummary(key);
    },
  };
}
