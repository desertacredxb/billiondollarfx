"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Button from "./Button";
import { Plus } from "lucide-react";

interface User {
  totalCommission: number | null;
  symbolLots: { [key: string]: number } | null;
  totalLots: number | null;
  totalDeposit: number | null;
  totalWithdrawal: number | null;
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
  const [ibCommission, setIbCommission] = useState<number | null>(null); // IB's own total commission
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

      const res = await api.post(
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

  const formatStatistic = (value: number | null | undefined, currency = false) =>
    typeof value === "number" && Number.isFinite(value)
      ? `${currency ? "$" : ""}${value.toFixed(2)}`
      : "Unavailable";

  useEffect(() => {
    let active = true;
    const fetchReferralAndConnections = async () => {
      try {
        const [ibRes, clientsRes] = await Promise.all([
          api.get<{ referralCode: string }>(`/api/ib/${encodeURIComponent(user.email)}`),
          api.get<{ clients: User[] }>("/api/ib/clients"),
        ]);
        if (!active) return;
        if (!Array.isArray(clientsRes.data.clients)) throw new Error("Could not load your client list.");
        setReferralCode(ibRes.data.referralCode);
        setConnections(clientsRes.data.clients);
      } catch (error) {
        if (active) setMessage("Could not load your IB clients. Please refresh or sign in again.");
      } finally {
        if (active) setLoading(false);
      }
    };

    if (user?.email) fetchReferralAndConnections();
    return () => { active = false; };
  }, [user?.email]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const userString = localStorage.getItem("user");

        if (!token || !userString) return;

        const user = JSON.parse(userString);
        const email = user.email;

        // Read the stored commission; recalculation is an administrative operation.
        const res = await api.get(`/api/auth/user/${encodeURIComponent(email)}`);
        const ownAccounts: Account[] = Array.isArray(res.data.accounts) ? res.data.accounts : [];
        setAccounts(ownAccounts);
        setSelectedAccount(ownAccounts[0]?.accountNo?.toString() || "");
        setIbCommission(typeof res.data.commission === "number" && Number.isFinite(res.data.commission)
          ? res.data.commission : null);
      } catch (error) {
        setMessage("Could not load your commission balance. Please refresh or sign in again.");
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
      {message && <p role="status" className="mb-4 text-center text-gray-300">{message}</p>}

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
              Total Commission: {formatStatistic(ibCommission, true)}
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
                      {formatStatistic(c.totalWithdrawal, true)}
                    </td>
                    <td className="py-3 px-4">
                      {formatStatistic(c.totalDeposit, true)}
                    </td>
                    <td className="py-3 px-4">{formatStatistic(c.totalLots)}</td>
                    <td className="py-3 px-4">
                      {formatStatistic(c.totalCommission, true)}
                    </td>
                    <td className="py-3 px-4">
                      {c.symbolLots
                        ? Object.entries(c.symbolLots)
                            .filter(([_, lots]) => lots > 0)
                            .map(([sym]) => sym)
                            .join(", ") || "—"
                        : "Unavailable"}
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
                  <span className="text-gray-400">Total Withdrawal:</span>{" "}
                  {formatStatistic(c.totalWithdrawal, true)}
                </p>
                <p>
                  <span className="text-gray-400">Total Deposit:</span>{" "}
                  {formatStatistic(c.totalDeposit, true)}
                </p>
                <p>
                  <span className="text-gray-400">Total Lots:</span>
                  {formatStatistic(c.totalLots)}
                </p>
                <p>
                  <span className="text-gray-400">Commission:</span>{" "}
                  {formatStatistic(c.totalCommission, true)}
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
