"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Withdrawal } from "./page";
import { fetchMT5AccountSummary, MT5AccountSummary } from "../../../../lib/mt5Store";

interface ModalProps {
    selectedWithdrawal: Withdrawal;
    onClose: () => void;
    onSuccess: () => void;
    onReject: () => void;
    rejecting: boolean;
}

export default function WithdrawalApprovalModal({
    selectedWithdrawal,
    onClose,
    onSuccess,
    onReject,
    rejecting,
}: ModalProps) {
    const isCrypto = selectedWithdrawal.currency === "CRYPTO";
    const canProcess = selectedWithdrawal.status === "Pending" || selectedWithdrawal.status === "Failed";

    // Initial state selection logic
    const [processType, setProcessType] = useState<"rameepay" | "cregis" | "manual">(
        selectedWithdrawal.isManual ? "manual" : isCrypto ? "cregis" : "rameepay"
    );

    const [txId, setTxId] = useState("");
    const [adminNote, setAdminNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingBalance, setLoadingBalance] = useState(false);
    const [summary, setSummary] = useState<MT5AccountSummary | null>(null);

    // Admin cycles through many different accounts on demand, so this is a
    // deliberate one-shot fetch (not the shared client-side polling store in
    // lib/mt5Store.ts - see the doc comment on useMT5AccountSummary for why
    // that store isn't right here). Reuses the same MT5 normalization logic
    // via fetchMT5AccountSummary so the two don't drift, without sharing any
    // cached/cross-account state. Also drops the bogus DWBalance field that
    // used to be shown here - it was never a real MT5 field, only ever
    // existed on the unrelated legacy MoneyPlantFX response shape.
    useEffect(() => {
        if (!selectedWithdrawal.accountNo) return;

        let cancelled = false;
        setLoadingBalance(true);

        fetchMT5AccountSummary(selectedWithdrawal.accountNo)
            .then((result) => {
                if (!cancelled) setSummary(result);
            })
            .catch((err) => {
                console.error("Failed to fetch MT5 balance:", err);
                if (!cancelled) {
                    setSummary(null);
                    toast.error("Failed to fetch MT5 balance");
                }
            })
            .finally(() => {
                if (!cancelled) setLoadingBalance(false);
            });

        return () => {
            cancelled = true;
        };
    }, [selectedWithdrawal.accountNo]);

    const handleApprove = async () => {
        if (processType === "manual" && !txId.trim()) {
            toast.error("Transaction ID / Ref Hash is required for manual processing.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                processType, // 'rameepay' | 'cregis' | 'manual'
                txId,
                adminNote,
            };

            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE}/api/payment/approve/${selectedWithdrawal._id}`,
                payload
            );

            if (res.data?.success) {
                toast.success(
                    selectedWithdrawal.status === "Failed"
                        ? "Payout retried successfully!"
                        : "Payout processed successfully!"
                );
                onSuccess();
                onClose();
            } else {
                toast.error(res.data?.message || "Approval failed.");
            }
        } catch (err: any) {
            // Detailed error logging to browser console
            console.error("Payout Processing Error details:", err.response?.data || err);

            const errorMessage =
                err.response?.data?.message ||
                err.response?.data?.error?.msg ||
                err.message ||
                "Approval execution error";

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1f2937] text-white p-6 rounded-lg w-full max-w-xl space-y-4 relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    ✕
                </button>

                <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                    <h3 className="text-xl font-bold">
                        Process Withdrawal #{selectedWithdrawal.orderid}
                    </h3>
                    <span
                        className={`text-xs px-2.5 py-1 rounded font-semibold ${
                            selectedWithdrawal.status === "Completed"
                                ? "bg-green-600/20 text-green-400 border border-green-500"
                                : selectedWithdrawal.status === "Failed" || selectedWithdrawal.status === "Rejected"
                                ? "bg-red-600/20 text-red-400 border border-red-500"
                                : selectedWithdrawal.status === "Processing"
                                ? "bg-blue-600/20 text-blue-400 border border-blue-500"
                                : "bg-amber-600/20 text-amber-400 border border-amber-500"
                        }`}
                    >
                        {selectedWithdrawal.status}
                    </span>
                </div>

                {/* Request Overview */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-[#111827] p-3 rounded border border-gray-700">
                    <div>
                        <p className="font-semibold text-gray-300">Method: {selectedWithdrawal.currency}</p>
                        <p>
                            Amount: {selectedWithdrawal.amount}{" "}
                            {isCrypto ? selectedWithdrawal.cryptoSymbol || "USDT" : selectedWithdrawal.currency}
                        </p>
                        <p>MT5 Account: {selectedWithdrawal.accountNo}</p>
                    </div>
                    <div>
                        {isCrypto ? (
                            <>
                                <p className="break-all">Address: {selectedWithdrawal.walletAddress}</p>
                                <p>Network: {selectedWithdrawal.network || "TRC20"}</p>
                            </>
                        ) : (
                            <>
                                <p>Account: {selectedWithdrawal.account || selectedWithdrawal.upiId}</p>
                                <p>IFSC / Bank: {selectedWithdrawal.ifsc || selectedWithdrawal.bankName || "N/A"}</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Live MT5 Balance Check */}
                <div className="text-xs">
                    <p className="font-semibold text-gray-300 mb-1">MT5 Live Balance Check:</p>
                    {loadingBalance ? (
                        <p className="text-gray-400">Loading balance...</p>
                    ) : summary ? (
                        <div className="flex justify-between bg-black/40 p-2 rounded">
                            <span>Balance: ${summary.balance}</span>
                            <span>Equity: ${summary.equity}</span>
                            <span>Free Margin: ${summary.marginFree}</span>
                        </div>
                    ) : (
                        <p className="text-gray-500">Unavailable</p>
                    )}
                    {canProcess && (
                        <p className="mt-2 text-cyan-300 bg-cyan-900/20 border border-cyan-700 rounded p-2">
                            The balance above already excludes{" "}
                            {selectedWithdrawal.amountUSD
                                ? `~$${selectedWithdrawal.amountUSD}`
                                : `${selectedWithdrawal.amount} ${selectedWithdrawal.currency}`}{" "}
                            for <strong>this</strong> withdrawal request - it was deducted/held from MT5 the moment
                            the request was submitted, before any admin review.
                        </p>
                    )}
                </div>

                {/* Gateway Options Selection (Visible for both Pending and Failed requests) */}
                {canProcess && (
                    <div>
                        <label className="block text-xs font-medium mb-1 text-gray-300">
                            Select Payout Gateway / Execution Mode:
                        </label>
                        <div className={`grid ${isCrypto ? "grid-cols-3" : "grid-cols-2"} gap-2`}>
                            {/* RameePay option */}
                            <button
                                type="button"
                                className={`p-2.5 rounded text-xs font-semibold border text-center transition-all ${
                                    processType === "rameepay"
                                        ? "bg-blue-600 border-blue-500 text-white shadow-lg"
                                        : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                                }`}
                                onClick={() => setProcessType("rameepay")}
                            >
                                RameePay ({isCrypto ? "Crypto" : "Fiat"})
                            </button>

                            {/* Cregis option (Crypto only) */}
                            {isCrypto && (
                                <button
                                    type="button"
                                    className={`p-2.5 rounded text-xs font-semibold border text-center transition-all ${
                                        processType === "cregis"
                                            ? "bg-purple-600 border-purple-500 text-white shadow-lg"
                                            : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                                    }`}
                                    onClick={() => setProcessType("cregis")}
                                >
                                    Cregis (Crypto)
                                </button>
                            )}

                            {/* Manual Transfer option */}
                            <button
                                type="button"
                                className={`p-2.5 rounded text-xs font-semibold border text-center transition-all ${
                                    processType === "manual"
                                        ? "bg-amber-600 border-amber-500 text-white shadow-lg"
                                        : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                                }`}
                                onClick={() => setProcessType("manual")}
                            >
                                Manual Transfer
                            </button>
                        </div>
                    </div>
                )}

                {/* Inputs for Manual Transfer Option */}
                {canProcess && processType === "manual" && (
                    <div className="space-y-3 bg-[#111827] p-3 rounded border border-gray-700">
                        <div>
                            <label className="block text-xs font-medium text-gray-300">
                                Transaction Ref / UTR / Hash <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter Tx Hash or Bank UTR number"
                                value={txId}
                                onChange={(e) => setTxId(e.target.value)}
                                className="w-full mt-1 p-2 bg-gray-800 border border-gray-600 rounded text-xs text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-300">Admin Remark:</label>
                            <input
                                type="text"
                                placeholder="e.g. Processed via local bank offline transfer"
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                className="w-full mt-1 p-2 bg-gray-800 border border-gray-600 rounded text-xs text-white"
                            />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t border-gray-700">
                    {canProcess ? (
                        <button
                            onClick={onReject}
                            disabled={rejecting || loading}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-xs font-semibold text-white disabled:opacity-50"
                        >
                            {rejecting
                                ? "Refunding..."
                                : selectedWithdrawal.status === "Failed"
                                ? "Reject & Refund to MT5"
                                : "Reject & Refund"}
                        </button>
                    ) : (
                        <span />
                    )}

                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded text-xs">
                            Cancel
                        </button>
                        {canProcess && (
                            <button
                                onClick={handleApprove}
                                disabled={loading || rejecting}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-xs font-semibold text-white disabled:opacity-50"
                            >
                                {loading
                                    ? "Processing..."
                                    : `${selectedWithdrawal.status === "Failed" ? "Retry" : "Approve"} (${processType.toUpperCase()})`}
                            </button>
                        )}
                    </div>
                </div>

                {selectedWithdrawal.status === "Failed" && (
                    <p className="text-xs text-amber-400 bg-amber-900/20 border border-amber-700 rounded p-2">
                        The last payout attempt failed and the request is still holding the customer&apos;s funds.
                        If the gateway keeps failing, either process it manually above, or use{" "}
                        <strong>Reject &amp; Refund</strong> to return the funds to their MT5 account.
                    </p>
                )}

                {selectedWithdrawal.status === "Processing" && (
                    <p className="text-xs text-blue-400 bg-blue-900/20 border border-blue-700 rounded p-2">
                        Cregis has accepted this payout and is confirming it on-chain. It will automatically move to
                        Completed or Failed once Cregis sends the final confirmation - no action needed here yet.
                    </p>
                )}
            </div>
        </div>
    );
}