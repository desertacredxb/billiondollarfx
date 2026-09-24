"use client";

import { api, clearUserSession } from "@/lib/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import emptyIcon from "../../../../assets/icons/empty_state.png"; // Update if needed
import Button from "../../../../components/Button";
import RegisterModal from "../../../../components/CreateAccount"; // adjust path as needed
import Link from "next/link";
import KycAlertModal from "../../../../components/KycAlertModal";
import { useMT5AccountSummary } from "../../../../lib/mt5Store";
import { useUserProfile } from "../../../../lib/userStore";

export default function DepositsPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showKycPopup, setShowKycPopup] = useState(false);
  const { profile, accounts, isKycVerified, hasSubmittedDocuments, refresh } =
    useUserProfile();

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        // 🔥 hit ANY protected API
        await api.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/user/${
            JSON.parse(localStorage.getItem("user") || "{}")?.email
          }`
        );

        // ✅ If success → user valid
        setIsLoggedIn(true);
      } catch (err) {
        // ❌ Token invalid / expired
        clearUserSession();
        router.replace("/login");
      }
    };

    verifySession();
  }, []);

  useEffect(() => {
    if (isLoggedIn && profile && !isKycVerified) {
      // show first popup after 5s
      const timeout = setTimeout(() => setShowKycPopup(true), 5000);

      // keep showing every 10s
      const interval = setInterval(() => {
        setShowKycPopup(true);
      }, 10000);

      return () => {
        clearTimeout(timeout);
        clearInterval(interval);
      };
    }
  }, [isLoggedIn, profile, isKycVerified]);

  // Single source of truth for live balance - see lib/mt5Store.ts. Replaces
  // the old fetchAccountSummary() that read from the legacy MoneyPlantFX API
  // (/api/moneyplant/checkBalance), which could disagree with the real MT5
  // balance shown on every other page for the same account.
  const { summary } = useMT5AccountSummary(accounts[0]?.accountNo);

  if (!isLoggedIn) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full rounded-md overflow-hidden shadow-md">
        <video
          src="/BILLION$ FX WEBSITE ANIMATION.mp4" // 👈 place your video in public/banner/
          className="w-full object-cover rounded-md"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
      {/* ✅ Top Ticker Bar */}
      <div className="w-full rounded-md overflow-hidden shadow-md">
        <iframe
          src="https://fxpricing.com/fx-widget/ticker-tape-widget.php?id=1,2,3,5,14,20&border=show&speed=50&click_target=blank&theme=dark&tm-cr=212529&hr-cr=FFFFFF13&by-cr=28A745&sl-cr=DC3545&flags=circle&d_mode=compact-name&column=ask,bid,spread&lang=en&font=Arial, sans-serif"
          width="100%"
          height="85"
          style={{ border: "unset" }}
        ></iframe>
      </div>
      <div className="h-screen md:h-[80vh] bg-gradient-to-br from-[#0a0f1d] to-[#0f172a] px-6 md:px-12 py-10 text-white flex flex-col lg:flex-row gap-10">
        {/* Left Section */}
        <div className="flex-1 bg-[#121a2a] border border-gray-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold tracking-wider text-[var(--primary)]">
              Live MT5 Accounts
            </h2>
            {accounts.length === 0 && (
              <Button
                text="+ Create Account"
                onClick={() => {
                  if (profile && !isKycVerified) {
                    setShowKycPopup(true);
                  } else {
                    setShowModal(true);
                  }
                }}
              />
            )}
          </div>

          {accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <Image
                src={emptyIcon}
                alt="No Live Accounts"
                width={140}
                height={140}
                className="mb-6 grayscale opacity-80"
              />
              <p className="text-gray-400 text-sm">
                You don’t have any live accounts yet.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Click &#34;Create Account&#34; to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {accounts.map((acc) => (
                <div
                  key={acc._id}
                  className="bg-[#0d1b2a] border border-gray-700 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-400">Account Number</p>
                      <p className="text-xl font-semibold text-white">
                        {acc.accountNo}
                      </p>
                    </div>
                    <div className="bg-[var(--primary)]/20 px-3 py-1 rounded-full text-[var(--primary)] text-sm font-medium">
                      {acc.currency}
                    </div>
                  </div>

                  {/* Optional details */}
                  {/* <p className="text-sm text-gray-400 mt-2">Leverage: 1:100</p>
          <p className="text-sm text-gray-400">Status: Active</p> */}
                </div>
              ))}
            </div>
          )}

          <div className="absolute bottom-6 right-8 text-xs text-gray-600">
            Secure MT5 Trading | Regulated
          </div>
        </div>

        {/* Right Section - Account Summary */}
        <div className="w-full lg:w-[360px] rounded-2xl p-6 bg-white/5 backdrop-blur border border-gray-700 shadow-xl space-y-6">
          <h2 className="text-lg font-semibold text-[var(--primary)] tracking-wide">
            Account Summary
          </h2>

          <div className="space-y-5">
            <div className="bg-[#0d1b2a] p-4 rounded-xl flex justify-between items-center">
              <div className="text-gray-400 text-sm">Total Deposited</div>
              <div className="text-white font-bold">${summary?.balance ?? "0.00"}</div>
            </div>
            <div className="flex justify-center">
              <Link href="/deposits">
                {" "}
                <Button text="Make a Deposit" />{" "}
              </Link>
            </div>

          </div>
        </div>
        <RegisterModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            refresh(); // ✅ Refresh account list after modal closes
          }}
        />

        <KycAlertModal
          isOpen={showKycPopup}
          onClose={() => setShowKycPopup(false)}
          hasSubmittedDocuments={hasSubmittedDocuments}
        />
      </div>
    </div>
  );
}
