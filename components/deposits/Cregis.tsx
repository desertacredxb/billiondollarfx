"use client";

import axios from "axios";
import { CreditCard, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "../Button";
import { MIN_DEPOSIT_USD } from "../../constants/deposit";

interface Account {
  _id: string;
  accountNo: number;
  currency: string;
}

interface User {
  isKycVerified: boolean;
  accounts: Account[];
}

interface CregisDepositResponse {
  success: boolean;
  message?: string;
  order_id?: string;
  cregis_id?: string;
  checkout_url?: string;
  requested_amount?: number;
  payment_charge_amount?: number;
  order_amount?: string;
  order_currency?: string;
}

// Mirrors CREGIS_PAYMENT_CHARGE_ENABLED / CREGIS_PAYMENT_CHARGE_RATE in
// Billion_Doller_Backend/.env - only used here to preview the total before
// submitting; the backend computes and charges the authoritative amount.
const CREGIS_PAYMENT_CHARGE_ENABLED =
  process.env.NEXT_PUBLIC_CREGIS_PAYMENT_CHARGE_ENABLED === "true";
const CREGIS_PAYMENT_CHARGE_RATE = CREGIS_PAYMENT_CHARGE_ENABLED
  ? Number(process.env.NEXT_PUBLIC_CREGIS_PAYMENT_CHARGE_RATE) || 0.005
  : 0;

export default function Cregis() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [userData, setUserData] = useState<User | null>(null);

  const [form, setForm] = useState({
    accountNo: "",
    amount: "",
  });

  const enteredAmount = Number(form.amount) || 0;
  const estimatedChargeAmount =
    enteredAmount > 0 ? Number((enteredAmount * CREGIS_PAYMENT_CHARGE_RATE).toFixed(2)) : 0;
  const estimatedTotal =
    enteredAmount > 0 ? Number((enteredAmount + estimatedChargeAmount).toFixed(2)) : 0;

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) return;

        const { email } = JSON.parse(storedUser) as { email: string };

        const response = await axios.get<User>(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/user/${email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUserData(response.data);
        setAccounts(response.data.accounts ?? []);

        if (response.data.accounts?.length) {
          setForm((current) => ({
            ...current,
            accountNo: response.data.accounts[0].accountNo.toString(),
          }));
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
        toast.error("Unable to load your trading accounts.");
      }
    };

    void fetchAccounts();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const amount = Number(form.amount);

    // Minimum deposit check
    if (!Number.isFinite(amount) || amount < MIN_DEPOSIT_USD) {
      toast.error(`The minimum deposit amount is $${MIN_DEPOSIT_USD} USD.`);
      return;
    }

    if (!form.accountNo) {
      toast.error("Please select an account.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post<CregisDepositResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/payment/cregis/deposit`,
        {
          accountNo: form.accountNo,
          amount,
          currency: "USD", // Sending USD directly
        }
      );

      const data = response.data;

      if (!data.success || !data.checkout_url) {
        toast.error(data.message || "Cregis did not return a checkout URL.");
        return;
      }

      setShowModal(false);
      window.location.assign(data.checkout_url);
    } catch (error) {
      console.error("Cregis deposit failed:", error);
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Deposit failed. Please try again."
        );
      } else {
        toast.error("Deposit failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-md border border-gray-700 bg-[#111827] rounded-2xl shadow-lg p-6 flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <CreditCard size={40} className="text-[var(--primary-color)]" />
          <h2 className="text-xl font-semibold">Crypto Gateway (option 2)</h2>
        </div>

        <p className="text-gray-300 text-sm">
          Secure and fast deposit for Crypto. Click below to proceed.
        </p>

        <Button
          text="Deposit"
          onClick={() => setShowModal(true)}
          className="w-fit"
        />
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

            <h2 className="text-xl font-bold mb-4">Deposit with Cregis</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Selection */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Select Account
                </label>
                <select
                  name="accountNo"
                  value={form.accountNo}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      accountNo: event.target.value,
                    }))
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

              {/* Amount Input */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                    required
                    min={MIN_DEPOSIT_USD}
                    step="0.01"
                    placeholder="100"
                    className="w-full pl-7 pr-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Minimum deposit amount is ${MIN_DEPOSIT_USD} USD.
                </p>
                {CREGIS_PAYMENT_CHARGE_ENABLED && enteredAmount > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    A {(CREGIS_PAYMENT_CHARGE_RATE * 100).toFixed(2)}% payment processing charge applies: $
                    {estimatedChargeAmount.toFixed(2)}. You&apos;ll be asked to
                    pay <span className="text-gray-200">${estimatedTotal.toFixed(2)}</span> in
                    total.
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                text={loading ? "Processing..." : "Confirm Deposit"}
                className="w-fit disabled:opacity-50"
                disabled={loading || !form.accountNo || !form.amount}
              />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}