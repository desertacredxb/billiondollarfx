"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Withdrawal } from "./page";

interface AccountSummary {
    balance: string;
    Credit: string;
    Floating: string;
    Margin: string;
    MarginFree: string;
    Equity: string;
    DWBalance: string;
    group?: string;
    rights?: string;
    registration?: string;
}

interface ModalProps {
    selectedWithdrawal: Withdrawal;
    onClose: () => void;
    onSuccess: () => void;
    onReject: () => void;
}

export default function WithdrawalApprovalModal({
    selectedWithdrawal,
    onClose,
    onSuccess,
    onReject,
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
    const [summary, setSummary] = useState<AccountSummary | null>(null);

    useEffect(() => {
        if (selectedWithdrawal.accountNo) {
            fetchBalance(selectedWithdrawal.accountNo);
        }
    }, [selectedWithdrawal]);

    const fetchBalance = async (accountNo: string) => {
        try {
            setLoadingBalance(true);
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE}/api/mt5/user`,
                {
                    params: {
                        login: accountNo.toString(),
                    },
                }
            );

            if (res.data?.success && res.data?.data) {
                const data = res.data.data;

                setSummary({
                    balance: data.Balance ?? data.balance ?? "0",
                    Credit: data.Credit ?? "0",
                    Floating: data.Floating ?? "0",
                    Margin: data.Margin ?? "0",
                    MarginFree: data.MarginFree ?? "0",
                    Equity: data.Equity ?? "0",
                    DWBalance: data.DWBalance ?? "0",
                    group: data.Group || "",
                    rights: data.Rights || "",
                    registration: data.Registration || "",
                });
            } else {
                setSummary(null);
            }
        } catch (err: any) {
            console.error("Failed to fetch MT5 balance:", err);
            toast.error("Failed to fetch MT5 balance");
        } finally {
            setLoadingBalance(false);
        }
    };

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
                                : selectedWithdrawal.status === "Failed"
                                ? "bg-red-600/20 text-red-400 border border-red-500"
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
                            <span>Equity: ${summary.Equity}</span>
                            <span>Free Margin: ${summary.MarginFree}</span>
                        </div>
                    ) : (
                        <p className="text-gray-500">Unavailable</p>
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
                    <button
                        onClick={onReject}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-xs font-semibold text-white"
                    >
                        Reject Request
                    </button>

                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded text-xs">
                            Cancel
                        </button>
                        {canProcess && (
                            <button
                                onClick={handleApprove}
                                disabled={loading}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-xs font-semibold text-white disabled:opacity-50"
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