"use client";

import axios from "../../lib/apiClient";
import { Landmark, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../Button";
import { useUserProfile } from "../../lib/userStore";

interface FloxyQuote {
  success: boolean;
  vndPerUsd: number;
  minVnd: number;
  minUsd: number;
}

interface FloxyDeposit {
  success: boolean;
  message?: string;
  url: string;
}

const API = `${process.env.NEXT_PUBLIC_API_BASE}/api/payment/floxy`;
const vnd = (value: number) => `VND ${value.toLocaleString("en-US")}`;

export default function Floxy() {
  const { accounts } = useUserProfile();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<FloxyQuote | null>(null);
  const [form, setForm] = useState({ accountNo: "", amount: "" });

  const enteredAmount = Number(form.amount) || 0;
  const estimatedUsd = quote && enteredAmount > 0 ? enteredAmount / quote.vndPerUsd : 0;
  // Defaults to the first account once accounts load from the store.
  const accountNo = form.accountNo || accounts[0]?.accountNo.toString() || "";

  // Fresh rate and minimum each time the dialog opens; the backend locks the
  // rate again when it creates the payment link.
  const open = () => {
    setShowModal(true);
    setQuote(null);
    axios
      .get<FloxyQuote>(`${API}/quote`)
      .then((response) => setQuote(response.data))
      .catch((error) => {
        toast.error(
          (axios.isAxiosError(error) && error.response?.data?.message) ||
            "VND deposits are unavailable right now."
        );
      });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(form.amount);

    if (!quote) {
      toast.error("Waiting for the exchange rate. Please try again.");
      return;
    }
    if (!Number.isSafeInteger(amount) || amount < quote.minVnd) {
      toast.error(`The minimum deposit is ${vnd(quote.minVnd)}.`);
      return;
    }
    if (!accountNo) {
      toast.error("Please select an account.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post<FloxyDeposit>(`${API}/deposit`, {
        accountNo,
        amount,
      });
      if (!response.data.success || !response.data.url) {
        toast.error(response.data.message || "Floxy did not return a payment link.");
        return;
      }
      setShowModal(false);
      window.location.assign(response.data.url);
    } catch (error) {
      console.error("Floxy deposit failed:", error);
      toast.error(
        (axios.isAxiosError(error) && error.response?.data?.message) ||
          "Deposit failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-md border border-gray-700 bg-[#111827] rounded-2xl shadow-lg p-6 flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <Landmark size={40} className="text-[var(--primary-color)]" />
          <h2 className="text-xl font-semibold">Vietnam Bank QR (VND)</h2>
        </div>

        <p className="text-gray-300 text-sm">
          Pay in Vietnamese dong by scanning a bank QR code. Credited to your account in USD.
        </p>

        <Button text="Deposit" onClick={open} className="w-fit" />
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 px-4">
          <div className="bg-[#1f2937] p-6 rounded-xl w-full max-w-md relative">
            <button
              type="button"
              aria-label="Close deposit dialog"
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4">Deposit with Vietnam Bank QR</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="floxy-account" className="block text-sm text-gray-300 mb-1">
                  Select Account
                </label>
                <select
                  id="floxy-account"
                  value={accountNo}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, accountNo: event.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                >
                  {accounts.length ? (
                    accounts.map((account) => (
                      <option key={account._id} value={account.accountNo}>
                        {account.accountNo} ({account.currency})
                      </option>
                    ))
                  ) : (
                    <option value="">No accounts available</option>
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="floxy-amount" className="block text-sm text-gray-300 mb-1">
                  Amount (VND)
                </label>
                <input
                  id="floxy-amount"
                  type="number"
                  inputMode="numeric"
                  value={form.amount}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, amount: event.target.value }))
                  }
                  required
                  min={quote?.minVnd}
                  step="1"
                  placeholder={quote ? String(quote.minVnd) : "Loading…"}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
                {quote && (
                  <p className="text-xs text-gray-400 mt-1">
                    Minimum {vnd(quote.minVnd)} (${quote.minUsd}).
                    {estimatedUsd > 0 && (
                      <>
                        {" "}About <span className="text-gray-200">${estimatedUsd.toFixed(2)}</span> will be credited.
                      </>
                    )}
                  </p>
                )}
              </div>

              <Button
                text={loading ? "Redirecting to payment…" : "Confirm Deposit"}
                className="w-fit disabled:opacity-50"
                disabled={loading || !quote || !accountNo || !form.amount}
              />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
