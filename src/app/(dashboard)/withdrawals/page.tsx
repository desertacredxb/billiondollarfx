"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "../../../../lib/apiClient";
import { Wallet, X } from "lucide-react";
import Button from "../../../../components/Button";
import RegisterModal from "../../../../components/CreateAccount";
import KycAlertModal from "../../../../components/KycAlertModal";
import emptyIcon from "../../../../assets/icons/empty_state.png";
import toast, { Toaster } from "react-hot-toast";
import { MIN_WITHDRAWAL_USD, MIN_WITHDRAWAL_INR, RAMEEPAY_MIN_INR, RAMEEPAY_MAX_INR } from "../../../../constants/withdrawal";
import { useMT5AccountSummary } from "../../../../lib/mt5Store";
import { useUserProfile } from "../../../../lib/userStore";

export default function Withdrawal() {
  const { profile, accounts, isKycVerified, hasSubmittedDocuments, refresh } =
    useUserProfile();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKycPopup, setShowKycPopup] = useState(false);
  // VND (Floxy) rate + minimum, fetched when the VND method is chosen.
  const [vndQuote, setVndQuote] = useState<{ vndPerUsd: number; minVnd: number } | null>(null);

  // 🔹 Form state with default values
  const [form, setForm] = useState({
    accountNo: "",
    currency: "CRYPTO" as "INR" | "USD" | "CRYPTO" | "VND",
    amount: "",
    note: "",
    // INR Details (Prefilled from User Object)
    account: "",
    ifsc: "",
    upiId: "",
    accountHolderName: "",
    mobile: "",
    // USD Details (Prefilled)
    bankName: "",
    swiftCode: "",
    // Crypto Details
    cryptoSymbol: "USDT",
    walletAddress: "",
    network: "TRC20",
    memo: "",
    // VND bank details (Floxy payout) - prefilled from the profile's bank details
    vndHolderName: "",
    vndAccountNumber: "",
    vndBankName: "",
    vndRoutingCode: "",
  });

  // Prefill the account selector and bank details from the shared profile
  // store once it loads (and again whenever it's refreshed).
  useEffect(() => {
    if (!profile) return;

    setForm((prev) => ({
      ...prev,
      accountNo: prev.accountNo || accounts[0]?.accountNo.toString() || "",
      // Bank Details matching the EXACT JSON payload keys /api/payment/request expects
      account: profile.accountNumber || "",
      ifsc: profile.ifscCode || "",
      accountHolderName: profile.accountHolderName || "",
      upiId: profile.upiId != null ? String(profile.upiId) : "",
      mobile:
        profile.mobile != null ? String(profile.mobile) : profile.phone || "",
      bankName: profile.bankName || "",
      swiftCode: profile.iban || "",
      // Same holder/account/bank fields serve a Vietnamese bank account.
      vndHolderName: prev.vndHolderName || profile.accountHolderName || "",
      vndAccountNumber: prev.vndAccountNumber || profile.accountNumber || "",
      vndBankName: prev.vndBankName || profile.bankName || "",
    }));
  }, [profile, accounts]);

  // Single source of truth for live balance - see lib/mt5Store.ts. Replaces
  // the local fetchAccountSummary()/balance state that hit /api/mt5/user
  // directly; same endpoint, now shared/cached/kept fresh across pages.
  const { summary, refresh: refreshBalance } = useMT5AccountSummary(form.accountNo || undefined);
  const balance = summary ? parseFloat(summary.balance) : 0;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "currency" && value === "VND") loadVndQuote();
  };

  // Rate + minimum for VND withdrawals; the backend locks the rate again on submit.
  const loadVndQuote = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/payment/floxy/quote`);
      const quote = { vndPerUsd: Number(res.data.vndPerUsd), minVnd: Number(res.data.minVnd) };
      setVndQuote(quote);
      return quote;
    } catch {
      toast.error("VND withdrawals are unavailable right now.");
      return null;
    }
  };

  const fetchRate = async () => {
    try {
      const res = await axios.get("https://api.frankfurter.app/latest?amount=1&from=INR&to=USD");
      const rate = Number(res.data.rates.USD);
      return rate;
    } catch (err) {
      console.error("Error fetching INR → USD rate:", err); // Fallback rate 
      return 0.01058;
    }
  }

  const handleAccountSelect = (accNo: string) => {
    setForm((prev) => ({ ...prev, accountNo: accNo }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const amountNum = Number(form.amount);

  if (isNaN(amountNum) || amountNum <= 0) {
    toast.error("Please enter a valid withdrawal amount.");
    return;
  }

  // 1. Calculate USD equivalent for balance check
  let amountInUSD = amountNum;
  if (form.currency === "INR") {
    const rate = await fetchRate(); // INR to USD rate
    amountInUSD = amountNum * rate;
  }
  if (form.currency === "VND") {
    const quote = vndQuote || (await loadVndQuote());
    if (!quote) return;
    if (!Number.isInteger(amountNum)) {
      toast.error("Enter a whole VND amount.");
      return;
    }
    if (amountNum < quote.minVnd) {
      toast.error(`Minimum withdrawal amount is VND ${quote.minVnd.toLocaleString("en-US")}.`);
      return;
    }
    if (!form.vndHolderName.trim() || !form.vndAccountNumber.trim() || !form.vndBankName.trim()) {
      toast.error("Account holder name, account number and bank name are required.");
      return;
    }
    amountInUSD = amountNum / quote.vndPerUsd;
  }

  // 2. Balance Check (MT5 balance is in USD)
  if (amountInUSD > balance) {
    toast.error("Withdrawal amount exceeds current account balance.");
    return;
  }

  // Dynamic Validations
  if (form.currency === "CRYPTO" && !form.walletAddress) {
    toast.error("Wallet Address is required for Crypto payout.");
    return;
  }
  if (form.currency === "INR" && !form.account && !form.upiId) {
    toast.error("Please provide Bank Account Number/IFSC or a UPI ID.");
    return;
  }
  if (form.currency === "INR" && form.mobile.replace(/\D/g, "").length !== 10) {
    toast.error("A valid 10-digit mobile number is required for INR withdrawals.");
    return;
  }
  if (form.currency === "USD" && (!form.account || !form.bankName)) {
    toast.error("Account Number and Bank Name are required for USD wire.");
    return;
  }

  // Minimum checks based on input currency
  if (form.currency === "USD" && amountNum < MIN_WITHDRAWAL_USD) {
    toast.error(`Minimum withdrawal amount is $${MIN_WITHDRAWAL_USD}.`);
    return;
  }
  if (form.currency === "INR" && amountNum < MIN_WITHDRAWAL_INR) {
    toast.error(`Minimum withdrawal amount is ₹${MIN_WITHDRAWAL_INR}.`);
    return;
  }
  if (form.currency === "INR" && (amountNum < RAMEEPAY_MIN_INR || amountNum > RAMEEPAY_MAX_INR)) {
    toast.error(`INR withdrawals must be between ₹${RAMEEPAY_MIN_INR} and ₹${RAMEEPAY_MAX_INR}.`);
    return;
  }

  try {
    setLoading(true);
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/payment/request`,
      form
    );

    if (res.data?.success) {
      toast.success(res.data.message || "Withdrawal request submitted!");
      setShowModal(false);
      refreshBalance();
    } else {
      toast.error(res.data?.message || "Withdrawal failed.");
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Submission error occurred.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gradient-to-br from-[#0a0f1d] to-[#0f172a] p-6 text-white rounded-xl min-h-[85vh]">
        <h1 className="text-2xl font-bold mb-4">Withdrawal Portal</h1>
        <p className="mb-6 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
          Bonus funds are non-withdrawable. You cannot withdraw your deposit bonus.
        </p>

        {/* Account Display Cards */}
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <Image
              src={emptyIcon}
              alt="No Live Accounts"
              width={120}
              height={120}
              className="mb-4 grayscale opacity-80"
            />
            <p className="text-gray-400 text-sm mb-2">
              You don&apos;t have a live trading account yet. Create one to
              request a withdrawal.
            </p>
            <Button
              text="+ Create Account"
              onClick={() => {
                if (!isKycVerified) {
                  setShowKycPopup(true);
                } else {
                  setShowCreateModal(true);
                }
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accounts.map((acc) => (
              <div
                key={acc._id}
                className="border border-gray-700 bg-[#111827] rounded-2xl p-6 flex flex-col space-y-4 shadow-lg"
              >
                <div className="flex justify-between items-center">
                  <Wallet size={30} className="text-cyan-400" />
                  <div>
                    <h2 className="text-xl font-bold">${balance}</h2>
                    <p className="text-sm text-gray-400">Acc No: {acc.accountNo}</p>
                  </div>
                </div>
                <Button
                  text="Request Withdrawal"
                  onClick={() => {
                    if (!isKycVerified) {
                      setShowKycPopup(true);
                      return;
                    }
                    handleAccountSelect(acc.accountNo.toString());
                    setShowModal(true);
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Withdrawal Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold mb-4">Request Withdrawal</h2>
              <p className="mb-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
                Bonus funds are non-withdrawable. You cannot withdraw your deposit bonus.
              </p>

              {/* 🔹 TRADER ACCOUNT SELECTOR INSIDE MODAL */}
              <div className="bg-[#121a2a] border border-gray-700 p-4 rounded-xl mb-6">
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  Select Source MT5 Account
                </label>
                <select
                  value={form.accountNo}
                  onChange={(e) => handleAccountSelect(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm font-semibold mb-2"
                >
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc.accountNo}>
                      MT5 Account: {acc.accountNo} ({acc.currency})
                    </option>
                  ))}
                </select>
                <div className="flex justify-between items-center text-xs text-gray-400 px-1">
                  <span>Available Balance:</span>
                  <span className="text-cyan-400 font-bold text-sm">${balance}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Currency Option Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                    Select Withdrawal Method
                  </label>
                  <select
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm"
                  >
                    <option value="CRYPTO">Crypto</option>
                    <option value="INR">INR (Bank Transfer / UPI)</option>
                    <option value="USD">USD (International Wire)</option>
                    <option value="VND">VND (Vietnam Bank Transfer)</option>
                  </select>
                </div>

                {/* 2A. CRYPTO FIELDS */}
                {form.currency === "CRYPTO" && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                          Asset
                        </label>
                        <select
                          name="cryptoSymbol"
                          value={form.cryptoSymbol}
                          onChange={handleChange}
                          className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm"
                        >
                          <option value="USDT">USDT</option>
                          <option value="BTC">BTC</option>
                          <option value="ETH">ETH</option>
                          <option value="SOL">SOL</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                          Network
                        </label>
                        <select
                          name="network"
                          value={form.network}
                          onChange={handleChange}
                          className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm"
                        >
                          <option value="TRC20">TRC20 (Tron)</option>
                          <option value="BEP20">BEP20 (BSC)</option>
                          <option value="ERC20">ERC20 (Ethereum)</option>
                          <option value="Polygon">Polygon</option>
                          <option value="Solana">Solana</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Destination Wallet Address</label>
                      <input
                        type="text"
                        name="walletAddress"
                        placeholder="Enter Wallet Address"
                        value={form.walletAddress}
                        onChange={handleChange}
                        className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm"
                      />
                    </div>
                    <input
                      type="text"
                      name="memo"
                      placeholder="Exchange Memo / Tag (Optional)"
                      value={form.memo}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm"
                    />
                  </>
                )}

                {/* 2B. INR FIELDS (Prefilled) */}
                {form.currency === "INR" && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        name="accountHolderName"
                        value={form.accountHolderName}
                        onChange={handleChange}
                        className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-gray-300 mb-3"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        name="mobile"
                        placeholder="10-digit mobile number"
                        value={form.mobile}
                        onChange={handleChange}
                        required
                        maxLength={10}
                        pattern="[0-9]{10}"
                        title="Enter a 10-digit mobile number"
                        className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-gray-300 mb-3"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Bank Account Number</label>
                        <input
                          type="text"
                          name="account"
                          placeholder="Bank Account Number"
                          value={form.account}
                          onChange={handleChange}
                          className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm mb-3"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">IFSC Code</label>
                        <input
                          type="text"
                          name="ifsc"
                          placeholder="IFSC Code"
                          value={form.ifsc}
                          onChange={handleChange}
                          className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm"
                        />
                      </div>
                    </div>
                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-gray-700"></div>
                      <span className="flex-shrink mx-2 text-xs text-gray-400">OR UPI ID</span>
                      <div className="flex-grow border-t border-gray-700"></div>
                    </div>
                    <input
                      type="text"
                      name="upiId"
                      placeholder="UPI ID (Optional, e.g. name@upi)"
                      value={form.upiId}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm"
                    />
                  </>
                )}

                {/* 2C. USD FIELDS (Prefilled) */}
                {form.currency === "USD" && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Bank Name</label>
                      <input
                        type="text"
                        name="bankName"
                        placeholder="Bank Name"
                        value={form.bankName}
                        onChange={handleChange}
                        className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm mb-3"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Account Number / IBAN</label>
                          <input
                            type="text"
                            name="account"
                            placeholder="Account Number / IBAN"
                            value={form.account}
                            onChange={handleChange}
                            className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm mb-3"
                          />

                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">SWIFT / BIC Code</label>
                          <input
                            type="text"
                            name="swiftCode"
                            placeholder="SWIFT / BIC Code"
                            value={form.swiftCode}
                            onChange={handleChange}
                            className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 2D. VND FIELDS (Floxy bank payout, prefilled from profile) */}
                {form.currency === "VND" && (
                  <>
                    <div>
                      <label htmlFor="vndHolderName" className="block text-xs text-gray-400 mb-1">Account Holder Name</label>
                      <input
                        id="vndHolderName"
                        type="text"
                        name="vndHolderName"
                        placeholder="Name exactly as on the bank account"
                        value={form.vndHolderName}
                        onChange={handleChange}
                        className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm mb-3"
                      />
                    </div>
                    <div>
                      <label htmlFor="vndAccountNumber" className="block text-xs text-gray-400 mb-1">Bank Account Number</label>
                      <input
                        id="vndAccountNumber"
                        type="text"
                        name="vndAccountNumber"
                        placeholder="Bank Account Number"
                        value={form.vndAccountNumber}
                        onChange={handleChange}
                        className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm mb-3"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="vndBankName" className="block text-xs text-gray-400 mb-1">Bank Name</label>
                        <input
                          id="vndBankName"
                          type="text"
                          name="vndBankName"
                          placeholder="e.g. Vietcombank"
                          value={form.vndBankName}
                          onChange={handleChange}
                          className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="vndRoutingCode" className="block text-xs text-gray-400 mb-1">Bank Code (Optional)</label>
                        <input
                          id="vndRoutingCode"
                          type="text"
                          name="vndRoutingCode"
                          placeholder="e.g. VCB"
                          value={form.vndRoutingCode}
                          onChange={handleChange}
                          className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Common Inputs */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
  Amount ({form.currency === "INR" ? "₹" : form.currency === "VND" ? "VND" : "$"})
</label>
                  <input
                    type="number"
                    name="amount"
                    placeholder="Enter Withdrawal Amount"
                    value={form.amount}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm"
                  />
                  {form.currency === "VND" && vndQuote && (
                    <p className="text-xs text-gray-400 mt-1">
                      Minimum VND {vndQuote.minVnd.toLocaleString("en-US")}.
                      {Number(form.amount) > 0 && (
                        <>
                          {" "}About{" "}
                          <span className="text-gray-200">
                            ${(Number(form.amount) / vndQuote.vndPerUsd).toFixed(2)}
                          </span>{" "}
                          will be deducted from your MT5 balance.
                        </>
                      )}
                    </p>
                  )}
                </div>
                <input
                  type="text"
                  name="note"
                  placeholder="Note / Instruction (Optional)"
                  value={form.note}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm"
                />

                <Button
                  text={loading ? "Submitting..." : "Submit Withdrawal"}
                  disabled={loading}
                />
              </form>
            </div>
          </div>
        )}
      </div>

      <RegisterModal
        isOpen={showCreateModal}
        profile={profile}
        onClose={() => {
          setShowCreateModal(false);
          refresh();
        }}
      />

      <KycAlertModal
        isOpen={showKycPopup}
        onClose={() => setShowKycPopup(false)}
        hasSubmittedDocuments={hasSubmittedDocuments}
      />

      <Toaster />
    </div>
  );
}
