"use client";

import axios from "axios";
import { CreditCard, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "../Button";
import KycAlertModal from "../KycAlertModal";

interface Account {
  _id: string;
  accountNo: number;
  currency: string;
}

interface User {
  isKycVerified: boolean;
  accounts: Account[];
}

interface TrustPay24DepositResponse {
  success: boolean;
  message?: string;
  order_id?: string;
  transaction_id?: number;
  transaction_ref?: string;
  merchant_order_id?: string;
  amount?: number;
  status?: string;
  checkout_url?: string;
  expires_at?: string;
  expires_in_seconds?: number;
}

export default function TrustPay24() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showKycPopup, setShowKycPopup] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  const [form, setForm] = useState({
    accountNo: "",
    amount: "",
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) return;

        const { email } = JSON.parse(storedUser) as {
          email: string;
        };

        const response = await axios.get<User>(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/user/${email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
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

    if (!Number.isFinite(amount) || amount < 1000) {
      toast.error("The minimum deposit amount is ₹1000.");
      return;
    }

    if (!form.accountNo) {
      toast.error("Please select an account.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post<TrustPay24DepositResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/payment/trustpay24/deposit`,
        {
          accountNo: form.accountNo,
          amount,
        },
      );

      const data = response.data;

      if (!data.success || !data.checkout_url) {
        toast.error(
          data.message || "The payment provider did not return a checkout URL.",
        );
        return;
      }

      // Close modal before redirecting
      setShowModal(false);

      // Redirect customer to TrustPay24 hosted checkout
      window.location.assign(data.checkout_url);
    } catch (error) {
      console.error("TrustPay24 deposit failed:", error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "Deposit failed. Please try again.",
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
          <CreditCard
            size={40}
            className="text-[var(--primary-color)]"
          />

          <h2 className="text-xl font-semibold">
            TrustPay24
          </h2>
        </div>

        <p className="text-gray-300 text-sm">
          Secure and fast deposit using TrustPay24. Click below to
          proceed.
        </p>

        <Button
          text="Deposit"
          onClick={() => {
            if (userData?.isKycVerified === false) {
              setShowKycPopup(true);
            } else {
              setShowModal(true);
            }
          }}
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

            <h2 className="text-xl font-bold mb-4">
              Deposit with TrustPay24
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
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
                      <option
                        key={account._id}
                        value={account.accountNo}
                      >
                        {account.accountNo} ({account.currency})
                      </option>
                    ))
                  ) : (
                    <option value="">
                      No accounts available
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Amount
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    ₹
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
                    min={1000}
                    step="0.01"
                    placeholder="1000"
                    className="w-full pl-7 pr-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  />
                </div>

                <p className="text-xs text-gray-400 mt-1">
                  Minimum deposit amount is ₹1000.
                </p>
              </div>

              <Button
                text={
                  loading
                    ? "Processing..."
                    : "Confirm Deposit"
                }
                className="w-fit disabled:opacity-50"
                disabled={
                  loading ||
                  !form.accountNo ||
                  !form.amount
                }
              />
            </form>
          </div>
        </div>
      )}

      <KycAlertModal
        isOpen={showKycPopup}
        onClose={() => setShowKycPopup(false)}
      />
    </div>
  );
}