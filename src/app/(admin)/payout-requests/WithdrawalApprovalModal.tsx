"use client";

import { useEffect, useState } from "react";
import axios from "../../../../lib/apiClient";
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
    const isVnd = selectedWithdrawal.currency === "VND";
    const canProcess = selectedWithdrawal.status === "Pending" || selectedWithdrawal.status === "Failed";
    const floxy = selectedWithdrawal.floxy;

    // Initial state selection logic
    const [processType, setProcessType] = useState<"rameepay" | "cregis" | "manual" | "floxy">(
        selectedWithdrawal.isManual ? "manual" : isCrypto ? "cregis" : isVnd ? "floxy" : "rameepay"
    );
    // Floxy VND balance figures (VND withdrawals only).
    const [floxyBalance, setFloxyBalance] = useState<
        { state: "loading" } | { state: "error" } | { state: "ready"; fields: Record<string, number>; payoutAvailable: number | null; payoutField: string | null }
    >({ state: "loading" });
    const [refreshingFloxy, setRefreshingFloxy] = useState(false);

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

    useEffect(() => {
        if (!isVnd) return;
        let cancelled = false;
        axios
            .get(`${process.env.NEXT_PUBLIC_API_BASE}/api/payment/floxy/payout-balance`)
            .then((res) => {
                if (!cancelled) {
                    setFloxyBalance({
                        state: "ready",
                        fields: res.data.fields || {},
                        payoutAvailable: res.data.payoutAvailable ?? null,
                        payoutField: res.data.payoutField ?? null,
                    });
                }
            })
            .catch(() => {
                if (!cancelled) setFloxyBalance({ state: "error" });
            });
        return () => {
            cancelled = true;
        };
    }, [isVnd]);

    const handleRefreshFloxy = async () => {
        setRefreshingFloxy(true);
        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE}/api/payment/floxy/payouts/${selectedWithdrawal._id}/refresh`
            );
            toast.success(res.data?.message || "Status refreshed");
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(
                (axios.isAxiosError(err) && err.response?.data?.message) || "Couldn't reach Floxy right now."
            );
        } finally {
            setRefreshingFloxy(false);
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
                                    {isVnd
                                        ? `VND ${Number(selectedWithdrawal.amount).toLocaleString("en-US")}`
                                        : `${selectedWithdrawal.amount} ${isCrypto ? selectedWithdrawal.cryptoSymbol || "USDT" : selectedWithdrawal.currency}`}
                                </span>
                            </div>
                            {isVnd && (
                                <>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Debited from MT5</span>
                                        <span className="font-semibold">${selectedWithdrawal.amountUSD}</span>
                                    </div>
                                    {floxy?.vndPerUsd && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Rate (locked)</span>
                                            <span className="font-semibold text-xs">
                                                1 USD = VND {Math.round(floxy.vndPerUsd).toLocaleString("en-US")}
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}
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
                                    {isVnd && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Bank Code</span>
                                            <span className="font-semibold text-xs">{floxy?.routingCode || "N/A"}</span>
                                        </div>
                                    )}
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
                                {/* RameePay option (cannot pay Vietnamese bank accounts) */}
                                {!isVnd && (
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
                                )}

                                {/* Floxy option (VND only) */}
                                {isVnd && (
                                    <button
                                        type="button"
                                        className={`p-3 rounded-lg text-sm font-semibold border text-center transition-all ${
                                            processType === "floxy"
                                                ? "bg-rose-600 border-rose-500 text-white shadow-lg"
                                                : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                                        }`}
                                        onClick={() => setProcessType("floxy")}
                                    >
                                        Floxy (VND)
                                    </button>
                                )}

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

                    {/* Floxy (VND) payout wallet + payout status */}
                    {isVnd && (
                        <div className="bg-[#111827] rounded-xl p-4 border border-gray-700 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Floxy</p>
                                {floxy?.payoutId && (
                                    <button
                                        type="button"
                                        onClick={handleRefreshFloxy}
                                        disabled={refreshingFloxy}
                                        className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 hover:text-white text-gray-300 disabled:opacity-50"
                                    >
                                        {refreshingFloxy ? "Checking..." : "Check status with Floxy"}
                                    </button>
                                )}
                            </div>

                            <div className="text-sm">
                                <p className="text-gray-400 mb-1">VND balance</p>
                                {floxyBalance.state === "loading" ? (
                                    <p className="text-gray-500 text-xs">Loading...</p>
                                ) : floxyBalance.state === "error" ? (
                                    <p className="text-gray-500 text-xs">Unavailable. Approving still checks the wallet.</p>
                                ) : Object.keys(floxyBalance.fields).length === 0 ? (
                                    <p className="text-gray-500 text-xs">No VND balance reported by Floxy.</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                                        {Object.entries(floxyBalance.fields).map(([field, value]) => (
                                            <div key={field} className="contents">
                                                <span className={field === floxyBalance.payoutField ? "text-white font-semibold" : "text-gray-400"}>
                                                    {field}
                                                </span>
                                                <span className="text-right font-mono">VND {value.toLocaleString("en-US")}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {floxyBalance.state === "ready" &&
                                    floxyBalance.payoutAvailable !== null &&
                                    canProcess &&
                                    floxyBalance.payoutAvailable < Number(selectedWithdrawal.amount) && (
                                        <p className="mt-2 text-xs text-amber-400">
                                            The payout wallet is short for this withdrawal. Move funds to the payout wallet in the
                                            Floxy panel before approving.
                                        </p>
                                    )}
                            </div>

                            {(floxy?.payoutId || floxy?.status || floxy?.lastMessage) && (
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs border-t border-gray-700 pt-3">
                                    {floxy?.payoutId && (
                                        <>
                                            <span className="text-gray-400">Payout ID</span>
                                            <span className="text-right font-mono break-all">{floxy.payoutId}</span>
                                        </>
                                    )}
                                    {floxy?.status && (
                                        <>
                                            <span className="text-gray-400">Floxy status</span>
                                            <span className="text-right font-semibold">
                                                {floxy.status}
                                                {floxy.needsReview ? " (under review)" : ""}
                                            </span>
                                        </>
                                    )}
                                    {floxy?.failureCode && (
                                        <>
                                            <span className="text-gray-400">Failure code</span>
                                            <span className="text-right font-mono">
                                                {floxy.failureCode}
                                                {floxy.networkDeclineCode ? ` / bank ${floxy.networkDeclineCode}` : ""}
                                            </span>
                                        </>
                                    )}
                                    {selectedWithdrawal.transactionReference && (
                                        <>
                                            <span className="text-gray-400">Bank reference</span>
                                            <span className="text-right font-mono break-all">{selectedWithdrawal.transactionReference}</span>
                                        </>
                                    )}
                                    {floxy?.lastMessage && (
                                        <p className="col-span-2 mt-1 text-amber-400">{floxy.lastMessage}</p>
                                    )}
                                </div>
                            )}
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
                            {isVnd
                                ? "Floxy has accepted this payout and the bank is confirming it. It moves to Completed or Failed automatically when Floxy reports the result. Do not send it again."
                                : "Cregis has accepted this payout and is confirming it on-chain. It will automatically move to Completed or Failed once Cregis sends the final confirmation - no action needed here yet."}
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
