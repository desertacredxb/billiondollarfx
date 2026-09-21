"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { X, Copy, Wallet, Landmark, Clock3 } from "lucide-react";
import { Withdrawal } from "./page";
import { fetchMT5AccountSummary, MT5AccountSummary } from "../../../../lib/mt5Store";

interface ModalProps {
    selectedWithdrawal: Withdrawal;
    onClose: () => void;
    onSuccess: () => void;
    onReject: () => void;
    rejecting: boolean;
}

const STATUS_STYLES: Record<string, string> = {
    Completed: "bg-green-600/20 text-green-400 border-green-500",
    Failed: "bg-red-600/20 text-red-400 border-red-500",
    Rejected: "bg-red-600/20 text-red-400 border-red-500",
    Processing: "bg-blue-600/20 text-blue-400 border-blue-500",
    Pending: "bg-amber-600/20 text-amber-400 border-amber-500",
};

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

    const copyToClipboard = (value: string | undefined, label: string) => {
        if (!value) return;
        navigator.clipboard
            .writeText(value)
            .then(() => toast.success(`${label} copied`))
            .catch(() => toast.error("Couldn't copy to clipboard"));
    };

    const bankDestination = selectedWithdrawal.account || selectedWithdrawal.upiId;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1f2937] text-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto relative shadow-2xl border border-gray-700">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-[#1f2937]/95 backdrop-blur border-b border-gray-700 px-6 sm:px-8 py-5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Process Withdrawal</p>
                        <h3 className="text-xl sm:text-2xl font-bold font-mono truncate">
                            #{selectedWithdrawal.orderid}
                        </h3>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                            className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${
                                STATUS_STYLES[selectedWithdrawal.status] || STATUS_STYLES.Pending
                            }`}
                        >
                            {selectedWithdrawal.status}
                        </span>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg p-1.5 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                    {/* Request Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-[#111827] rounded-xl p-4 border border-gray-700 space-y-2.5">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Request</p>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Method</span>
                                <span className="font-semibold">{selectedWithdrawal.currency}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Amount</span>
                                <span className="font-bold text-sm">
                                    {selectedWithdrawal.amount}{" "}
                                    {isCrypto ? selectedWithdrawal.cryptoSymbol || "USDT" : selectedWithdrawal.currency}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">MT5 Account</span>
                                <span className="font-mono font-semibold ">{selectedWithdrawal.accountNo}</span>
                            </div>
                        </div>

                        <div className="bg-[#111827] rounded-xl p-4 border border-gray-700 space-y-2.5">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold flex items-center gap-1.5">
                                {isCrypto ? <Wallet size={12} /> : <Landmark size={12} />}
                                Payout Destination
                            </p>
                            {isCrypto ? (
                                <>
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="font-mono text-xs break-all leading-relaxed">
                                            {selectedWithdrawal.walletAddress || "N/A"}
                                        </span>
                                        {selectedWithdrawal.walletAddress && (
                                            <button
                                                onClick={() => copyToClipboard(selectedWithdrawal.walletAddress, "Address")}
                                                className="text-gray-400 hover:text-white flex-shrink-0 mt-0.5"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Network</span>
                                        <span className="font-semibold text-xs">{selectedWithdrawal.network || "TRC20"}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Account Holder</span>
                                        <span className="font-semibold text-xs">{selectedWithdrawal.name || "N/A"}</span>
                                    </div>
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="font-mono text-sm break-all">{bankDestination || "N/A"}</span>
                                        {bankDestination && (
                                            <button
                                                onClick={() => copyToClipboard(bankDestination, "Account")}
                                                className="text-gray-400 hover:text-white flex-shrink-0 mt-0.5"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">IFSC / Bank</span>
                                        <span className="font-semibold text-xs">
                                            {selectedWithdrawal.ifsc || selectedWithdrawal.bankName || "N/A"}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Live MT5 Balance Check */}
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                            MT5 Live Balance Check
                        </p>
                        {loadingBalance ? (
                            <p className="text-sm text-gray-400 bg-black/30 rounded-xl p-4">Loading balance...</p>
                        ) : summary ? (
                            <div className="grid grid-cols-3 gap-3 bg-black/30 rounded-xl p-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Balance</p>
                                    <p className="text-lg font-bold">${summary.balance}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Equity</p>
                                    <p className="text-lg font-bold">${summary.equity}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Free Margin</p>
                                    <p className="text-lg font-bold">${summary.marginFree}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 bg-black/30 rounded-xl p-4">Unavailable</p>
                        )}
                        {canProcess && (
                            <p className="mt-3 text-xs text-cyan-300 bg-cyan-900/20 border border-cyan-700/50 rounded-xl p-3 flex gap-2">
                                <Clock3 size={14} className="flex-shrink-0 mt-0.5" />
                                <span>
                                    The balance above already excludes{" "}
                                    {selectedWithdrawal.amountUSD
                                        ? `~$${selectedWithdrawal.amountUSD}`
                                        : `${selectedWithdrawal.amount} ${selectedWithdrawal.currency}`}{" "}
                                    for <strong>this</strong> withdrawal request - it was deducted/held from MT5 the
                                    moment the request was submitted, before any admin review.
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Gateway Options Selection (Visible for both Pending and Failed requests) */}
                    {canProcess && (
                        <div>
                            <label className="block text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                                Select Payout Gateway / Execution Mode
                            </label>
                            <div className={`grid ${isCrypto ? "grid-cols-3" : "grid-cols-2"} gap-2`}>
                                {/* RameePay option */}
                                <button
                                    type="button"
                                    className={`p-3 rounded-lg text-sm font-semibold border text-center transition-all ${
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
                                        className={`p-3 rounded-lg text-sm font-semibold border text-center transition-all ${
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
                                    className={`p-3 rounded-lg text-sm font-semibold border text-center transition-all ${
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
                        <div className="space-y-3 bg-[#111827] p-4 rounded-xl border border-gray-700">
                            <div>
                                <label className="block text-xs font-medium text-gray-300">
                                    Transaction Ref / UTR / Hash <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter Tx Hash or Bank UTR number"
                                    value={txId}
                                    onChange={(e) => setTxId(e.target.value)}
                                    className="w-full mt-1 p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-300">Admin Remark:</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Processed via local bank offline transfer"
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    className="w-full mt-1 p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white"
                                />
                            </div>
                        </div>
                    )}

                    {selectedWithdrawal.status === "Failed" && (
                        <p className="text-xs text-amber-400 bg-amber-900/20 border border-amber-700 rounded-xl p-3">
                            The last payout attempt failed and the request is still holding the customer&apos;s funds.
                            If the gateway keeps failing, either process it manually above, or use{" "}
                            <strong>Reject &amp; Refund</strong> to return the funds to their MT5 account.
                        </p>
                    )}

                    {selectedWithdrawal.status === "Processing" && (
                        <p className="text-xs text-blue-400 bg-blue-900/20 border border-blue-700 rounded-xl p-3">
                            Cregis has accepted this payout and is confirming it on-chain. It will automatically move
                            to Completed or Failed once Cregis sends the final confirmation - no action needed here
                            yet.
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="sticky bottom-0 bg-[#1f2937]/95 backdrop-blur border-t border-gray-700 px-6 sm:px-8 py-4 flex justify-between items-center gap-3">
                    {canProcess ? (
                        <button
                            onClick={onReject}
                            disabled={rejecting || loading}
                            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
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
                        <button
                            onClick={onClose}
                            className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold"
                        >
                            Cancel
                        </button>
                        {canProcess && (
                            <button
                                onClick={handleApprove}
                                disabled={loading || rejecting}
                                className="px-4 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                            >
                                {loading
                                    ? "Processing..."
                                    : `${selectedWithdrawal.status === "Failed" ? "Retry" : "Approve"} (${processType.toUpperCase()})`}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
