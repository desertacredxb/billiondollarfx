"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cregis from "../../../../components/deposits/Cregis";
import CryptoPay from "../../../../components/deposits/Crypto";
import Digipay from "../../../../components/deposits/Digipay";
import RameePay from "../../../../components/deposits/Rameepay";
import TruePay9 from "../../../../components/deposits/TruePay9";
import TrustPay24 from "../../../../components/deposits/TrustPay24";
import KycAlertModal from "../../../../components/KycAlertModal";
import Button from "../../../../components/Button";
import { useUserProfile } from "../../../../lib/userStore";

function Deposit() {
  const router = useRouter();
  const { profile, isKycVerified, hasSubmittedDocuments } = useUserProfile();
  const [showKycPopup, setShowKycPopup] = useState(false);

  // Pop the modal once as soon as we know the user isn't verified, without
  // re-popping every time the store re-renders this component.
  useEffect(() => {
    if (profile && !isKycVerified) setShowKycPopup(true);
  }, [profile, isKycVerified]);

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full rounded-md overflow-hidden shadow-md">
        <video
          src="/BILLION$ FX WEBSITE DEPOSITS.mp4"
          className="w-full object-cover rounded-md"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
      <div className=" bg-gradient-to-br from-[#0a0f1d] to-[#0f172a] px-6 md:px-12 py-10 text-white">
        <h1 className="text-2xl font-bold mb-8">Payment Methods</h1>

        {!profile ? null : !isKycVerified ? (
          <div className="text-center py-12">
            <p className="text-gray-300 mb-4">
              {hasSubmittedDocuments
                ? "Your KYC documents are under review. Deposits will unlock once your account is verified."
                : "Please complete your KYC verification before making a deposit."}
            </p>
            {!hasSubmittedDocuments && (
              <Button
                text="Go to Settings"
                onClick={() => router.push("/settings?tab=identity")}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-6">
            <RameePay />
            <TrustPay24 />
            <CryptoPay />

            <Cregis />
          </div>
        )}
      </div>

      <KycAlertModal
        isOpen={showKycPopup}
        onClose={() => setShowKycPopup(false)}
        hasSubmittedDocuments={hasSubmittedDocuments}
      />
    </div>
  );
}

export default Deposit;
