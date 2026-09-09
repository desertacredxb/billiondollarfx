"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import Button from "../../../../components/Button";
import WithdrawalApprovalModal from "./WithdrawalApprovalModal";

export interface Withdrawal {
  _id: string;
  orderid: string;
  accountNo: string;
  currency: "INR" | "USD" | "CRYPTO";
  amount: number;
  amountUSD?: string;
  status: "Pending" | "Completed" | "Rejected" | "Failed";
  createdAt: string;
  note?: string;
  // INR Fields
  account?: string;
  ifsc?: string;
  upiId?: string;
  name?: string;
  mobile?: string;
  // USD Fields
  bankName?: string;
  swiftCode?: string;
  // Crypto Fields
  cryptoSymbol?: string;
  walletAddress?: string;
  network?: string;
  memo?: string;
  isManual?: boolean;
}

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/payment/withdrawals`
      );
      setWithdrawals(res.data.data);
    } catch {
      toast.error("Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  };

  console.log("fetchWithdrawals", withdrawals);

  const handleReject = async (id: string) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/payment/reject/${id}`
      );

      if (res.data?.success) {
        toast.success(res.data.message || "Withdrawal rejected & refunded");
        setSelectedWithdrawal(null);
        fetchWithdrawals();
      } else {
        toast.error(res.data?.message || "Rejection failed");
      }
    } catch (err: unknown) {
      let errorMsg = "Rejection failed";
      if (err instanceof AxiosError) {
        errorMsg = err.response?.data?.message || err.message || errorMsg;
      }
      toast.error(errorMsg);
    }
  };

  const formatAmount = (w: Withdrawal) => {
    if (w.currency === "CRYPTO") return `${w.amount} ${w.cryptoSymbol || "USDT"}`;
    if (w.currency === "INR") return `₹${w.amount}`;
    return `$${w.amount}`;
  };

  if (loading) return <p className="text-gray-400 p-6">Loading...</p>;

  return (
    <div className="min-h-screen text-white p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Withdrawal Requests</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Manage and review user withdrawal requests across INR, USD, and Crypto methods.
        </p>
        <hr className="mt-4 border-gray-700" />
      </div>

      {withdrawals.length === 0 ? (
        <p className="text-gray-400 text-center py-10">No withdrawal requests found.</p>
      ) : (
        <div className="rounded-lg border border-[#1f2937] overflow-hidden">
          <table className="hidden md:table w-full text-sm text-left">
            <thead className="bg-[#1f2937] text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">MT5 Account</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Payout Destination</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w._id} className="border-b border-gray-700 hover:bg-[#111827]">
                  <td className="px-4 py-3 font-mono">{w.orderid}</td>
                  <td className="px-4 py-3 font-mono max-w-[150px]">{w.name}</td>
                  <td className="px-4 py-3">{w.accountNo}</td>
                  <td className="px-4 py-3 font-semibold">
                    <span
                      className={`px-2 py-1 rounded text-xs ${w.currency === "CRYPTO"
                          ? "bg-purple-900 text-purple-300"
                          : w.currency === "INR"
                            ? "bg-blue-900 text-blue-300"
                            : "bg-green-900 text-green-300"
                        }`}
                    >
                      {w.currency || "INR"}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">
                    {w.currency === "CRYPTO" ? w.walletAddress : w.upiId || w.account || "N/A"}
                  </td>
                  <td className="px-4 py-3 font-medium">{formatAmount(w)}</td>
                  <td
                    className={`px-4 py-3 font-semibold ${w.status === "Completed"
                        ? "text-green-400"
                        : w.status === "Rejected"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                  >
                    {w.status}
                  </td>
                  <td className="px-4 py-3">
                    <Button onClick={() => setSelectedWithdrawal(w)} text="View & Process" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedWithdrawal && (
        <WithdrawalApprovalModal
          selectedWithdrawal={selectedWithdrawal}
          onClose={() => setSelectedWithdrawal(null)}
          onSuccess={fetchWithdrawals}
          onReject={() => handleReject(selectedWithdrawal._id)}
        />
      )}
    </div>
  );
}