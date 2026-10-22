"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Button from "./Button";
import { Plus } from "lucide-react";

// v3 companion to IBPage.tsx (left untouched). Same design/layout - the
// difference is entirely in the data layer:
//  - Commission (both the header total and every per-client row) comes
//    from a single POST /api/ib/update-commission-v3 call instead of being
//    recomputed here from a local, incomplete COMMISSION_RATES copy.
//  - Deal history for the "Total Lots"/"Symbols Traded" columns comes from
//    /api/mt5/deals (MT5-backed) instead of /api/moneyplant/getDeals.
//  - Start/End date filters now actually drive the commission query range,
//    not just the client-side registration-date filter.
//  - Withdrawal posts to the v2 (MT5-based) endpoint instead of v1.

interface User {
  totalCommission: number;
  symbolLots: { [key: string]: number };
  totalLots: number;
  totalDeposit: number;
  totalWithdrawal: number;
  totalAccounts: number;
  accounts?: { accountNo: string | number }[];
  createdAt: string;
  email: string;
  fullName?: string;
  referralCode?: string;
  isApprovedIB?: boolean;
}

interface IBPageProps {
  user: {
    email: string;
    isApprovedIB?: boolean;
  };
}

interface Deposit {
  amount: string | number;
  status: "SUCCESS" | "FAILED" | "PENDING" | string;
}

interface Withdrawal {
  amount: string | number;
  status: "SUCCESS" | "FAILED" | "PENDING" | string;
}

interface MT5Deal {
  Symbol: string;
  Volume: string | number;
}

interface CommissionBreakdownRow {
  clientEmail: string;
  accountNo: string | number;
  commission: number;
}

interface Account {
  accountNo: string | number;
}

function IBPageV3({ user }: IBPageProps) {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [connections, setConnections] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // 🔹 Filters
  const [searchName, setSearchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [ibCommission, setIbCommission] = useState(0); // IB's own total commission (from v3, not the stale DB field)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [message, setMessage] = useState("");
  const handleOpenWithdraw = () => setShowWithdrawModal(true);

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const userString = localStorage.getItem("user");

      if (!token || !userString) return;

      const user = JSON.parse(userString);
      const email = user.email;

      // v2: MT5-based withdrawal (atomic reservation + rollback on failure),
      // instead of v1's MoneyPlant call.
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/ib/withdrawalIBamountV2`,
        {
          email,
          accountno: selectedAccount,
          amount: Number(withdrawAmount),
        }
      );

      if (res.data.success) {
        setMessage(
          `✅ Withdrawal successful${
            res.data.mt5Ticket ? ` (MT5 ticket: ${res.data.mt5Ticket})` : ""
          }. New Balance: $${res.data.newCommission}`
        );
        setIbCommission(res.data.newCommission); // update balance instantly
        setShowWithdrawModal(false);
      } else {
        setMessage(`❌ ${res.data.message}`);
      }
    } catch (err) {
      console.error("Withdraw error:", err);
      setMessage("⚠️ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch deposits/withdrawals + raw deal history (for Total Lots /
  // Symbols Traded display only - commission itself comes from v3, not
  // recomputed here).
  const fetchUserStats = async (
    email: string,
    createdAt: string,
    sdate: string,
    edate: string
  ) => {
    try {
      const userRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/user/${email}`
      );
      const accounts = userRes.data?.accounts || [];
      let totalDeposit = 0;
      let totalWithdrawal = 0;
      let totalLots = 0;

      const symbolLots: { [key: string]: number } = {};

      for (const acc of accounts) {
        try {
          const depRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE}/api/payment/deposit/${acc.accountNo}`
          );
          const INR_TO_USD = 1 / 88.76; // ≈ 0.01126

          const deposits: Deposit[] = depRes.data?.deposits || [];
          totalDeposit += deposits
            .filter((d) => d.status === "SUCCESS")
            .reduce((sum, d) => sum + Number(d.amount) * INR_TO_USD, 0);

          const wdRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE}/api/payment/withdrawal/${acc.accountNo}`
          );

          const withdrawals: Withdrawal[] = wdRes.data?.withdrawals || [];
          totalWithdrawal += withdrawals
            .filter((w) => w.status === "SUCCESS" || w.status === "Completed")
            .reduce((sum, w) => sum + Number(w.amount) * INR_TO_USD, 0);

          // Raw deal history from MT5 (display-only: lots/symbols traded).
          // The actual commission $ amount is never derived from this -
          // that comes solely from the v3 breakdown below.
          const dealsRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE}/api/mt5/deals`,
            { params: { login: acc.accountNo, from: sdate, to: edate, total: 5000 } }
          );
          const dealsData: MT5Deal[] = dealsRes.data?.data?.answer || [];
          for (const deal of dealsData) {
            const symbol = deal.Symbol;
            if (!symbol) continue; // skip non-trade deals (balance/credit/etc)
            const lots = Number(deal.Volume || 0) / 10000;

            totalLots += lots;

            if (!symbolLots[symbol]) symbolLots[symbol] = 0;
            symbolLots[symbol] += lots;
          }
        } catch (err) {
          console.error(
            `Error fetching data for account ${acc.accountNo}:`,
            err
          );
        }
      }

      return {
        totalDeposit,
        totalWithdrawal,
        totalLots,
        symbolLots,
      };
    } catch (err) {
      console.error(`Error fetching user stats for ${email}:`, err);
      return {
        totalDeposit: 0,
        totalWithdrawal: 0,
        totalLots: 0,
        symbolLots: {},
      };
    }
  };

  useEffect(() => {
    const fetchReferralAndConnections = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1. Fetch IB referral code
        const ibRes = await axios.get<{ referralCode: string }>(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/ib/${user.email}`
        );
        const code = ibRes.data.referralCode;
        setReferralCode(code);

        // 2. Fetch all users, filter connections by referral code (same
        // client-side matching as v1 - not the scope of this change).
        const usersRes = await axios.get<User[]>(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/users`
        );
        const allUsers = usersRes.data;
        const matchedUsers = allUsers.filter((u) => u.referralCode === code);

        // 3. One v3 call gets commission for every referred client at once
        // (header total + per-client breakdown) instead of recomputing it
        // per client from raw deal history.
        const userRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/user/${user.email}`
        );
        const lastWithdrawalDate = userRes.data?.lastWithdrawalDate;
        const createdAt = userRes.data?.createdAt;

        const sdate =
          startDate ||
          (lastWithdrawalDate
            ? new Date(lastWithdrawalDate).toISOString().split("T")[0]
            : new Date(createdAt).toISOString().split("T")[0]);
        const edate = endDate || new Date().toISOString().split("T")[0];

        let breakdown: CommissionBreakdownRow[] = [];
        let totalCommission = 0;
        try {
          const commissionRes = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE}/api/ib/update-commission-v3`,
            { email: user.email, sdate, edate },
            token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
          );
          breakdown = commissionRes.data?.breakdown || [];
          totalCommission = commissionRes.data?.totalCommission || 0;
        } catch (err) {
          console.error("Error fetching v3 commission:", err);
        }
        setIbCommission(totalCommission);

        // 4. Fetch remaining display stats per connection, and pull that
        // client's commission out of the v3 breakdown (summed across all
        // of their accounts) instead of recomputing it.
        const enrichedUsers = await Promise.all(
          matchedUsers.map(async (u) => {
            const { totalDeposit, totalWithdrawal, totalLots, symbolLots } =
              await fetchUserStats(u.email, u.createdAt, sdate, edate);

            const userDetailRes = await axios.get(
              `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/user/${u.email}`
            );
            const accounts = userDetailRes.data?.accounts || [];

            const totalCommission = breakdown
              .filter((row) => row.clientEmail === u.email)
              .reduce((sum, row) => sum + row.commission, 0);

            return {
              ...u,
              totalDeposit,
              totalWithdrawal,
              totalLots,
              totalCommission,
              symbolLots,
              accounts,
            };
          })
        );

        setConnections(enrichedUsers);
      } catch (err) {
        console.error("Error fetching IB data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) fetchReferralAndConnections();
    // Re-run whenever the date filters change, since they now drive the
    // actual commission query range, not just client-side filtering.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, startDate, endDate]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = localStorage.getItem("token");
        const userString = localStorage.getItem("user");

        if (!token || !userString) return;

        const user = JSON.parse(userString);
        const email = user.email;

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/user/${email}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAccounts(res.data.accounts || []);
        if (res.data.accounts.length > 0) {
          setSelectedAccount(res.data.accounts[0].accountNo.toString());
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, []);

  const copyToClipboard = () => {
    if (referralCode) {
      navigator.clipboard.writeText(
        `https://www.billiondollarfx.com/register?ref=${referralCode}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 🔹 Apply name filter (date range is now handled server-side via the
  // v3 query above, not filtered client-side).
  const filteredConnections = connections.filter((c) => {
    const nameMatch = c.fullName
      ?.toLowerCase()
      .includes(searchName.toLowerCase());
    return nameMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1d] to-[#0f172a] px-6 md:px-12 py-10 text-white">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-8 text-center">
        Welcome, IB Partner 🎉
      </h1>

      {/* Referral Code Panel */}
      <div className="w-full max-w-2xl mx-auto bg-[#111a2e] p-6 rounded-2xl shadow-lg mb-10 flex flex-col items-center">
        <p className="text-gray-400 mb-2">Your Referral Code</p>
        <div className="flex items-center gap-3">
          <span className="text-yellow-400 font-mono font-semibold text-sm bg-[#1b2744] px-5 py-2 rounded-lg break-all">
            {`https://www.billiondollarfx.com/register?ref=${referralCode}`}
          </span>
          <button
            onClick={copyToClipboard}
            className="bg-[#1b2744] px-3 py-2 rounded-lg hover:bg-[#2a3a5f] transition"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Connections Panel */}
      <div className="w-full max-w-6xl mx-auto bg-[#111a2e] rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold">
            My Connections
          </h2>

          <div className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-3 shadow-md">
            <span className="text-lg font-semibold">
              Total Commission: ${ibCommission.toFixed(2)}
            </span>
            <button
              onClick={handleOpenWithdraw}
              className="bg-yellow-400 text-black px-3 py-1 rounded-md font-medium hover:bg-yellow-300 transition"
            >
              <Plus />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6">
          <input
            type="text"
            placeholder="Search Client Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="px-3 sm:px-4 py-2 rounded-lg bg-[#1b2744] text-white w-full sm:w-64 outline-none"
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 sm:px-4 py-2 rounded-lg bg-[#1b2744] text-white outline-none w-full sm:w-auto"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 sm:px-4 py-2 rounded-lg bg-[#1b2744] text-white outline-none w-full sm:w-auto"
          />
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full text-left border-collapse text-sm md:text-base">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4 text-gray-400 font-medium">Client</th>
                <th className="py-3 px-4 text-gray-400 font-medium">
                  Total Withdrawal
                </th>
                <th className="py-3 px-4 text-gray-400 font-medium">
                  Total Deposit
                </th>
                <th className="py-3 px-4 text-gray-400 font-medium">
                  Total Lots
                </th>
                <th className="py-3 px-4 text-gray-400 font-medium">
                  Commission (USD)
                </th>
                <th className="py-3 px-4 text-gray-400 font-medium">
                  Symbols Traded
                </th>
                <th className="py-3 px-4 text-gray-400 font-medium">
                  Account Number
                </th>
                <th className="py-3 px-4 text-gray-400 font-medium">
                  Registered Date
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">
                    Loading connections...
                  </td>
                </tr>
              ) : filteredConnections.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">
                    No Data found
                  </td>
                </tr>
              ) : (
                filteredConnections.map((c, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-[#1b2744] transition rounded-lg"
                  >
                    <td className="py-3 px-4">
                      {c.fullName || "Unnamed User"}
                    </td>
                    <td className="py-3 px-4">
                      ${c.totalWithdrawal?.toFixed(2) ?? "0.00"}
                    </td>
                    <td className="py-3 px-4">
                      ${c.totalDeposit?.toFixed(2) ?? "0.00"}
                    </td>
                    <td className="py-3 px-4">{c.totalLots.toFixed(2) ?? 0}</td>
                    <td className="py-3 px-4">
                      ${c.totalCommission?.toFixed(2) ?? "0.00"}
                    </td>
                    <td className="py-3 px-4">
                      {c.symbolLots
                        ? Object.entries(c.symbolLots)
                            .filter(([_, lots]) => lots > 0)
                            .map(([sym]) => sym)
                            .join(", ")
                        : "—"}
                    </td>
                    <td className="py-3 px-4">
                      {c.accounts?.map((acc) => acc.accountNo).join(", ") ||
                        "—"}
                    </td>
                    <td className="py-3 px-4">
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString("en-CA")
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-4">
          {loading ? (
            <p className="text-center text-gray-400 py-6">
              Loading connections...
            </p>
          ) : filteredConnections.length === 0 ? (
            <p className="text-center text-gray-400 py-6">No Data found</p>
          ) : (
            filteredConnections.map((c, idx) => (
              <div
                key={idx}
                className="bg-[#1b2744] rounded-lg p-4 shadow-md space-y-2"
              >
                <p>
                  <span className="text-gray-400">Client:</span>{" "}
                  {c.fullName || "Unnamed User"}
                </p>
                <p>
                  <span className="text-gray-400">Total Withdrawal:</span> $
                  {c.totalWithdrawal?.toFixed(2) ?? "0.00"}
                </p>
                <p>
                  <span className="text-gray-400">Total Deposit:</span> $
                  {c.totalDeposit?.toFixed(2) ?? "0.00"}
                </p>
                <p>
                  <span className="text-gray-400">Total Lots:</span>
                  {c.totalLots.toFixed(2) ?? 0}
                </p>
                <p>
                  <span className="text-gray-400">Commission:</span> $
                  {c.totalCommission?.toFixed(2) ?? "0.00"}
                </p>
                <p>
                  <span className="text-gray-400">Account Number(s):</span>{" "}
                  {c.accounts?.map((acc) => acc.accountNo).join(", ") || "—"}
                </p>
                <p>
                  <span className="text-gray-400">Registered Date:</span>{" "}
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString("en-CA")
                    : "—"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#111a2e] p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Add To Your Account</h2>

            <p className="text-sm text-yellow-400 mb-4">
              ⚠️ Minimum withdrawal amount is $75
            </p>

            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full p-2 mb-4 rounded bg-[#1b2744] text-white"
            >
              <option value="">Select Account</option>
              {accounts.map((acc, i) => (
                <option key={i} value={acc.accountNo}>
                  {acc.accountNo}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Enter amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full p-2 mb-4 rounded bg-[#1b2744] text-white"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2 bg-gray-600 rounded-full"
              >
                Cancel
              </button>
              <Button
                onClick={handleWithdraw}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                text={loading ? "Adding..." : "Add"}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IBPageV3;
