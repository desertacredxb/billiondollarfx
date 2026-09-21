"use client";

import React from "react";
import Button from "./Button"; // Adjust path if needed
import { useRouter } from "next/navigation";

interface KycAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasSubmittedDocuments?: boolean;
}

const KycAlertModal: React.FC<KycAlertModalProps> = ({
  isOpen,
  onClose,
  hasSubmittedDocuments = false,
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#1f2937] rounded-xl p-6 w-11/12 md:w-96 text-center text-white shadow-lg">
        <h2 className="text-xl font-bold mb-4">
          {hasSubmittedDocuments
            ? "KYC Under Review"
            : "KYC Verification Required"}
        </h2>
        <p className="mb-6 text-gray-300">
          {hasSubmittedDocuments
            ? "Your KYC documents have been submitted and are pending review. This feature will unlock once your account is verified."
            : "Your account is not verified. Please complete KYC to access full features."}
        </p>
        <div className="flex justify-center gap-4">
          {!hasSubmittedDocuments && (
            <Button
              text="Go to Settings"
              onClick={() => {
                router.push("/settings?tab=identity"); // Open Identity-Verification tab
                onClose();
              }}
            />
          )}
          <Button text="Close" onClick={onClose} />
        </div>
      </div>
    </div>
  );
};

export default KycAlertModal;
