"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { CreditCard, X } from "lucide-react";
import Button from "../../components/Button"; // ✅ import your Button
import KycAlertModal from "../../components/KycAlertModal";
import toast, { Toaster } from "react-hot-toast";

interface Account {
  _id: string;
  accountNo: number;
  currency: string;
}

interface User {
  email: string;
  isKycVerified: boolean;
  accounts: Account[];
}

function CryptoPay() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    accountNo: "",
    amount: "",
  });
  const [showKycPopup, setShowKycPopup] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [userData, setUserData] = useState<User | null>(null);

  // ✅ Fetch accounts from backend
  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem("token");
      const userString = localStorage.getItem("user");

      if (!token || !userString) return;

      const user = JSON.parse(userString);
      const email = user.email;

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/user/${email}`
      );
      if (res.data) setUserData(res.data);

      if (res.data?.accounts?.length > 0) {
        setAccounts(res.data.accounts);
        // Auto-select first account
        setForm((prev) => ({
          ...prev,
          accountNo: res.data.accounts[0].accountNo.toString(),
        }));
      }
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = Number(form.amount);

    // ✅ Validate minimum 880
    if (amount < 880) {
      alert("The minimum deposit amount should be ₹880.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/payment/crypto/deposit`,
        {
          accountNo: form.accountNo,
          amount,
        }
      );
      console.log(res.data);

      if (res.data?.decrypted?.url) {
        window.location.href = res.data.decrypted.url;
      } else {
        toast.error("Error getting Payout URL");
      }
    } catch (err) {
      console.error(err);
      toast.error("Deposit failed. Try again.");
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Crypto Box */}
      <div className="max-w-md border border-gray-700 bg-[#111827] rounded-2xl shadow-lg p-6 flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <CreditCard size={40} className="text-[var(--primary-color)]" />
          <h2 className="text-xl font-semibold">Crypto</h2>
        </div>
        <p className="text-gray-300 text-sm">
          Secure and fast deposit using Crypto. Click below to proceed.
        </p>

        {/* ✅ Use Button instead of <button> */}
        <Button
          text="Deposit"
          onClick={() => {
            if (userData?.isKycVerified === false) {
              setShowKycPopup(true); // show KYC popup
            } else {
              setShowModal(true); // open deposit modal
            }
          }}
          className="w-fit"
        />
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-[#1f2937] p-6 rounded-xl w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4">Deposit with Crypto</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dropdown for Accounts */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Select Account
                </label>
                <select
                  name="accountNo"
                  value={form.accountNo}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                >
                  {accounts.length > 0 ? (
                    accounts.map((acc) => (
                      <option key={acc._id} value={acc.accountNo}>
                        MT{acc.accountNo} ({acc.currency})
                      </option>
                    ))
                  ) : (
                    <option value="">No accounts available</option>
                  )}
                </select>
              </div>

              {/* Amount */}
              {/* Amount */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Amount
                </label>
                <div className="relative">
                  {/* ₹ Symbol */}
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    min={880} // ✅ minimum value enforced
                    placeholder="880"
                    className="w-full pl-7 pr-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  />
                </div>
                {/* Note under input */}
                <p className="text-xs text-gray-400 mt-1">
                  Minimum deposit amount is ₹880.
                </p>
              </div>

              {/* ✅ Use Button instead of <button> */}
              <Button
                text={loading ? "Processing..." : "Confirm Deposit"}
                className="w-fit disabled:opacity-50"
                disabled={loading}
              />
            </form>
          </div>
        </div>
      )}

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
      <KycAlertModal
        isOpen={showKycPopup}
        onClose={() => setShowKycPopup(false)}
      />
    </div>
  );
}

export default CryptoPay;
