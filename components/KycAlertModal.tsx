"use client";

import React from "react";
import Button from "./Button"; // Adjust path if needed
import { useRouter } from "next/navigation";

interface KycAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KycAlertModal: React.FC<KycAlertModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#1f2937] rounded-xl p-6 w-11/12 md:w-96 text-center text-white shadow-lg">
        <h2 className="text-xl font-bold mb-4">KYC Verification Required</h2>
        <p className="mb-6 text-gray-300">
          Your account is not verified. Please complete KYC to access full
          features.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            text="Go to Settings"
            onClick={() => {
              router.push("/settings"); // Redirect to settings page
              onClose();
            }}
          />
          <Button text="Close" onClick={onClose} />
        </div>
      </div>
    </div>
  );
};

export default KycAlertModal;
