"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../../../../components/Button";
import WithdrawalApprovalModal from "./WithdrawalApprovalModal";

const PAGE_SIZE = 15;

export interface Withdrawal {
  _id: string;
  orderid: string;
  accountNo: string;
  currency: "INR" | "USD" | "CRYPTO";
  amount: number;
  amountUSD?: string;
  status: "Pending" | "Processing" | "Completed" | "Rejected" | "Failed";
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
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Server-side pagination: only the current page's rows are ever fetched
  // (GET /api/payment/withdrawals?page=&limit=), not the whole collection.
  const fetchWithdrawals = async (targetPage = page, isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/payment/withdrawals`,
        { params: { page: targetPage, limit: PAGE_SIZE } }
      );
      console.log(res.data.data)
      setWithdrawals(res.data.data);
      setTotal(res.data.total ?? res.data.data.length);
      if (isManualRefresh) toast.success("Withdrawals refreshed");
    } catch {
      toast.error("Failed to load withdrawals");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and whenever the page changes
  useEffect(() => {
    fetchWithdrawals(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // If the collection shrinks (or on refresh at the old page number returns
  // fewer pages than before), keep the current page in range instead of
  // showing a blank page past the end.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const formatAmount = (w: Withdrawal) => {
    if (w.currency === "CRYPTO") return `${w.amount} ${w.cryptoSymbol || "USDT"}`;
    if (w.currency === "INR") return `₹${w.amount}`;
    return `$${w.amount}`;
  };

  const handleReject = async (w: Withdrawal) => {
    const confirmMessage =
      w.status === "Failed"
        ? `The ${w.currency} payout gateway failed for this request. Reject it to refund ${formatAmount(
            w
          )} back to MT5 account ${w.accountNo} instead of retrying or transferring manually. This cannot be undone. Continue?`
        : `This will refund ${formatAmount(w)} back to MT5 account ${
            w.accountNo
          } and mark the withdrawal as Rejected. This cannot be undone. Continue?`;

    if (!confirm(confirmMessage)) return;

    setRejectingId(w._id);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/payment/reject/${w._id}`
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
    } finally {
      setRejectingId(null);
    }
  };

  if (loading) return <p className="text-gray-400 p-6">Loading...</p>;

  const statusTextColor = (status: Withdrawal["status"]) =>
    status === "Completed"
      ? "text-green-400"
      : status === "Rejected" || status === "Failed"
      ? "text-red-400"
      : status === "Processing"
      ? "text-blue-400"
      : "text-yellow-400";

  const currencyBadgeColor = (currency: Withdrawal["currency"]) =>
    currency === "CRYPTO"
      ? "bg-purple-900 text-purple-300"
      : currency === "INR"
      ? "bg-blue-900 text-blue-300"
      : "bg-green-900 text-green-300";

  return (
    <div className="min-h-screen text-white p-4 sm:p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Withdrawal Requests</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Manage and review user withdrawal requests across INR, USD, and Crypto methods.
          </p>
        </div>
        <button
          onClick={() => fetchWithdrawals(page, true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-[#1f2937] hover:bg-gray-700 border border-gray-700 rounded-lg text-sm font-semibold disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      <hr className="mb-6 border-gray-700" />

      {withdrawals.length === 0 ? (
        <p className="text-gray-400 text-center py-10">No withdrawal requests found.</p>
      ) : (
        <>
          {/* Desktop / tablet table */}
          <div className="hidden md:block rounded-lg border border-[#1f2937] overflow-x-auto">
            <table className="w-full text-sm text-left">
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
                    <td className="px-4 py-3 font-mono max-w-[150px] truncate">{w.name}</td>
                    <td className="px-4 py-3">{w.accountNo}</td>
                    <td className="px-4 py-3 font-semibold">
                      <span className={`px-2 py-1 rounded text-xs ${currencyBadgeColor(w.currency)}`}>
                        {w.currency || "INR"}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate">
                      {w.currency === "CRYPTO" ? w.walletAddress : w.upiId || w.account || "N/A"}
                    </td>
                    <td className="px-4 py-3 font-medium">{formatAmount(w)}</td>
                    <td className={`px-4 py-3 font-semibold ${statusTextColor(w.status)}`}>{w.status}</td>
                    <td className="px-4 py-3">
                      <Button onClick={() => setSelectedWithdrawal(w)} text="View & Process" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list - the table above is hidden below md, this is its replacement */}
          <div className="md:hidden space-y-3">
            {withdrawals.map((w) => (
              <div key={w._id} className="rounded-lg border border-[#1f2937] bg-[#111827] p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-sm break-all">{w.orderid}</span>
                  <span className={`px-2 py-1 rounded text-xs flex-shrink-0 ${currencyBadgeColor(w.currency)}`}>
                    {w.currency || "INR"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-400">
                  <span>Name</span>
                  <span className="text-white text-right truncate">{w.name || "N/A"}</span>
                  <span>MT5 Account</span>
                  <span className="text-white text-right">{w.accountNo}</span>
                  <span>Destination</span>
                  <span className="text-white text-right truncate">
                    {w.currency === "CRYPTO" ? w.walletAddress : w.upiId || w.account || "N/A"}
                  </span>
                  <span>Amount</span>
                  <span className="text-white text-right font-medium">{formatAmount(w)}</span>
                  <span>Status</span>
                  <span className={`text-right font-semibold ${statusTextColor(w.status)}`}>{w.status}</span>
                </div>
                <Button
                  onClick={() => setSelectedWithdrawal(w)}
                  text="View & Process"
                  className="w-full mt-1"
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
              <span>
                Page {page} of {totalPages} ({total} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#1f2937] hover:bg-gray-700 border border-gray-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={15} /> Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#1f2937] hover:bg-gray-700 border border-gray-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedWithdrawal && (
        <WithdrawalApprovalModal
          selectedWithdrawal={selectedWithdrawal}
          onClose={() => setSelectedWithdrawal(null)}
          onSuccess={() => fetchWithdrawals()}
          onReject={() => handleReject(selectedWithdrawal)}
          rejecting={rejectingId === selectedWithdrawal._id}
        />
      )}
    </div>
  );
}