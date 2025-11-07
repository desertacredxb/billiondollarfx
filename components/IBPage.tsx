"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import Button from "./Button";
import { Plus } from "lucide-react";

interface User {
  totalCommission: number;
  symbolLots: { [key: string]: number };
  totalLots: number;
  totalDeposit: number;
  totalWithdrawal: number;
  totalAccounts: number;
  accounts?: { accountNo: string | number }[]; // Add this
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

interface Deal {
  Symbol: string;
  Qty: string | number;
}
interface Account {
  accountNo: string | number;
}
function IBPage({ user }: IBPageProps) {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [connections, setConnections] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // 🔹 Filters
  const [searchName, setSearchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [ibCommission, setIbCommission] = useState(0); // IB's own total commission
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

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/ib/withdrawalIBamount`,
        {
          email,
          accountno: selectedAccount,
          amount: Number(withdrawAmount),
        }
      );

      if (res.data.success) {
        setMessage(
          `✅ Withdrawal successful (Order: ${res.data.orderid}). New Balance: $${res.data.newCommission}`
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

  const COMMISSION_RATES: { [key: string]: number } = {
    EURUSD: 4.5,
    GBPUSD: 4.5,
    USDJPY: 4.5,
    USDCHF: 4.5,
    AUDUSD: 4.5,
    USDCAD: 4.5,
    NZDUSD: 4.5,
    EURGBP: 4.5,
    EURJPY: 4.5,
    EURAUD: 4.5,
    EURCAD: 4.5,
    EURNZD: 4.5,
    GBPJPY: 4.5,
    GBPAUD: 4.5,
    GBPCAD: 4.5,
    GBPNZD: 4.5,
    AUDJPY: 4.5,
    AUDNZD: 4.5,
    AUDCAD: 4.5,
    AUDCHF: 4.5,
    CADJPY: 4.5,
    CADCHF: 4.5,
    NZDJPY: 4.5,
    NZDCAD: 4.5,
    NZDCHF: 4.5,
    CHFJPY: 4.5,
    XAUUSD: 6.075,
    XAGUSD: 45,
  };

  const IB_SHARE_PERCENTAGE = 0.33;

  // ✅ Fetch deposits for a user (all accounts)
  const fetchUserStats = async (email: string, createdAt: string) => {
    try {
      const userRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/user/${email}`
      );
      const accounts = userRes.data?.accounts || [];
      const lastWithdrawalDate = userRes.data?.lastWithdrawalDate;
      let totalDeposit = 0;
      let totalWithdrawal = 0;
      let totalLots = 0;
      let totalCommission = 0;

      const symbolLots: { [key: string]: number } = {}; // lots per symbol

      const sdate = lastWithdrawalDate
        ? new Date(lastWithdrawalDate).toISOString().split("T")[0]
        : new Date(createdAt).toISOString().split("T")[0];
      const edate = new Date().toISOString().split("T")[0];
      // console.log(edate);

      for (const acc of accounts) {
        try {
          // deposits
          const depRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE}/api/payment/deposit/${acc.accountNo}`
          );
          const INR_TO_USD = 1 / 88.76; // ≈ 0.01126

          const deposits: Deposit[] = depRes.data?.deposits || [];
          totalDeposit += deposits
            .filter((d) => d.status === "SUCCESS")
            .reduce((sum, d) => sum + Number(d.amount) * INR_TO_USD, 0);

          // withdrawals
          const wdRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE}/api/payment/withdrawal/${acc.accountNo}`
          );

          const withdrawals: Withdrawal[] = wdRes.data?.withdrawals || [];
          totalWithdrawal += withdrawals
            .filter((w) => w.status === "SUCCESS" || w.status === "Completed")
            .reduce((sum, w) => sum + Number(w.amount) * INR_TO_USD, 0);
          // console.log(totalWithdrawal);
          // deals
          const dealsRes = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE}/api/moneyplant/getDeals`,
            { accountno: acc.accountNo, sdate, edate }
          );
          const dealsData: Deal[] = dealsRes.data?.data || [];
          for (const deal of dealsData) {
            const symbol = deal.Symbol;
            const lots = Number(deal.Qty || 0);

            totalLots += lots;

            if (!symbolLots[symbol]) symbolLots[symbol] = 0;
            symbolLots[symbol] += lots;

            if (COMMISSION_RATES[symbol]) {
              totalCommission +=
                lots * COMMISSION_RATES[symbol] * IB_SHARE_PERCENTAGE;
            }
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
        totalCommission,
        symbolLots,
      };
    } catch (err) {
      console.error(`Error fetching user stats for ${email}:`, err);
      return {
        totalDeposit: 0,
        totalWithdrawal: 0,
        totalLots: 0,
        totalCommission: 0,
        symbolLots: {},
      };
    }
  };

  useEffect(() => {
    const fetchReferralAndConnections = async () => {
      try {
        // 1. Fetch IB referral code
        const ibRes = await axios.get<{ referralCode: string }>(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/ib/${user.email}`
        );
        const code = ibRes.data.referralCode;

        setReferralCode(code);

        // 2. Fetch all users
        const usersRes = await axios.get<User[]>(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/users`
        );
        const allUsers = usersRes.data;

        // 3. Filter connections by referral code
        const matchedUsers = allUsers.filter((u) => u.referralCode === code);

        // 4. Fetch stats for each connection
        const enrichedUsers = await Promise.all(
          matchedUsers.map(async (u) => {
            const {
              totalDeposit,
              totalWithdrawal,
              totalLots,
              totalCommission,
              symbolLots,
            } = await fetchUserStats(u.email, u.createdAt);

            // Fetch user's accounts
            const userRes = await axios.get(
              `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/user/${u.email}`
            );
            const accounts = userRes.data?.accounts || [];

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
  }, [user?.email]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const userString = localStorage.getItem("user");

        if (!token || !userString) return;

        const user = JSON.parse(userString);
        const email = user.email;

        // 2️⃣ Fetch user with updated commission
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/user/${email}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // console.log(res.data.accounts);
        setAccounts(res.data.accounts || []);
        // console.log(res.data.accounts);
        // ✅ set first account as default if exists
        if (res.data.accounts.length > 0) {
          setSelectedAccount(res.data.accounts[0].accountNo.toString());
        }

        const lastWithdrawalDate = res.data?.lastWithdrawalDate;
        const createdAt = res.data?.createdAt; // ✅ safely fetch createdAt from backend response

        // 1️⃣ Call update commission first
        const updateRes = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/ib/update-commission`,
          {
            email,
            sdate: lastWithdrawalDate
              ? new Date(lastWithdrawalDate).toISOString().split("T")[0]
              : new Date(createdAt).toISOString().split("T")[0], // ✅ fallback to createdAt
            edate: new Date().toISOString().split("T")[0], // today
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // console.log("Commission updated:", updateRes.data);

        setIbCommission(res.data.commission);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
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

  // 🔹 Apply filters
  const filteredConnections = connections.filter((c) => {
    const nameMatch = c.fullName
      ?.toLowerCase()
      .includes(searchName.toLowerCase());

    const date = new Date(c.createdAt);
    const afterStart = startDate ? date >= new Date(startDate) : true;
    const beforeEnd = endDate ? date <= new Date(endDate) : true;

    return nameMatch && afterStart && beforeEnd;
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
            👥 My Connections
          </h2>

          <div className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-3 shadow-md">
            <span className="text-lg font-semibold">
              💰 Total Commission: ${ibCommission.toFixed(2)}
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
                    {/* Desktop Table */}
                    <td className="py-3 px-4">
                      {c.accounts?.map((acc) => acc.accountNo).join(", ") ||
                        "—"}
                    </td>{" "}
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

            {/* ✅ Info message */}
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

export default IBPage;
// function fetchUserDeposits(
//   email: string
// ):
//   | { totalDeposit: any; totalAccounts: any }
//   | PromiseLike<{ totalDeposit: any; totalAccounts: any }> {
//   throw new Error("Function not implemented.");
// }
