"use client";

import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  accountNo: number | string;
}

type TargetType = "both" | "main" | "investor";

const UpdatePasswordModal = ({ isOpen, onClose, accountNo }: Props) => {
  const [targetType, setTargetType] = useState<TargetType>("both");
  const [mainPassword, setMainPassword] = useState("");
  const [investorPassword, setInvestorPassword] = useState("");
  
  const [response, setResponse] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  
  const [showMainPassword, setShowMainPassword] = useState(false);
  const [showInvestorPassword, setShowInvestorPassword] = useState(false);
  
  const [error, setError] = useState("");

  if (!isOpen) return null;

  // MT5 password validation: 8-16 chars, uppercase, lowercase, special character
  const validatePassword = (pwd: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,16}$/;
    return regex.test(pwd);
  };

  const handleClose = () => {
    setMainPassword("");
    setInvestorPassword("");
    setError("");
    setResponse(null);
    setShowMainPassword(false);
    setShowInvestorPassword(false);
    setTargetType("both");
    onClose();
  };

  const handleSubmit = async () => {
    setResponse(null);
    setError("");

    // Validate based on selection target
    if (targetType === "both" || targetType === "main") {
      if (!validatePassword(mainPassword)) {
        setError(
          "Master password must be 8-16 characters long and contain uppercase, lowercase, and a special character."
        );
        return;
      }
    }

    if (targetType === "both" || targetType === "investor") {
      if (!validatePassword(investorPassword)) {
        setError(
          "Investor password must be 8-16 characters long and contain uppercase, lowercase, and a special character."
        );
        return;
      }
    }

    setLoading(true);

    try {
      const payload: Record<string, any> = {
        login: accountNo.toString(),
        type: targetType,
      };

      if (targetType === "both") {
        payload.mainPassword = mainPassword;
        payload.investorPassword = investorPassword;
      } else if (targetType === "main") {
        payload.password = mainPassword;
      } else if (targetType === "investor") {
        payload.password = investorPassword;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/mt5/change_password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSuccess(true);
        setResponse(data.message || "Password updated successfully!");
        setMainPassword("");
        setInvestorPassword("");
      } else {
        setIsSuccess(false);
        setResponse(data.message || "Failed to update password.");
      }
    } catch (err: any) {
      setIsSuccess(false);
      setResponse("Network error: Unable to update password.");
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled =
    loading ||
    (targetType === "both" && (!mainPassword || !investorPassword)) ||
    (targetType === "main" && !mainPassword) ||
    (targetType === "investor" && !investorPassword);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-[#121a2a] p-6 rounded-lg border border-gray-700 w-[90%] max-w-sm text-white">
        <h2 className="text-lg font-semibold mb-3">Update MT5 Password</h2>

        {/* Target Selector Tabs */}
        <div className="flex bg-[#0d1b2a] p-1 rounded border border-gray-700 mb-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setTargetType("both");
              setError("");
            }}
            className={`flex-1 py-1.5 rounded transition-all cursor-pointer ${
              targetType === "both"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Both
          </button>
          <button
            type="button"
            onClick={() => {
              setTargetType("main");
              setError("");
            }}
            className={`flex-1 py-1.5 rounded transition-all cursor-pointer ${
              targetType === "main"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Master Only
          </button>
          <button
            type="button"
            onClick={() => {
              setTargetType("investor");
              setError("");
            }}
            className={`flex-1 py-1.5 rounded transition-all cursor-pointer ${
              targetType === "investor"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Investor Only
          </button>
        </div>

        {/* Input Fields */}
        <div className="space-y-3">
          {/* Master Password Input */}
          {(targetType === "both" || targetType === "main") && (
            <div className="relative">
              <input
                type={showMainPassword ? "text" : "password"}
                placeholder="Enter new master password"
                className={`w-full p-2 pr-10 rounded bg-[#0d1b2a] border ${
                  error ? "border-red-500" : "border-gray-600"
                }`}
                value={mainPassword}
                onChange={(e) => {
                  setMainPassword(e.target.value);
                  if (error) setError("");
                }}
              />
              <button
                type="button"
                onClick={() => setShowMainPassword((prev) => !prev)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                {showMainPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          )}

          {/* Investor Password Input */}
          {(targetType === "both" || targetType === "investor") && (
            <div className="relative">
              <input
                type={showInvestorPassword ? "text" : "password"}
                placeholder="Enter new investor password"
                className={`w-full p-2 pr-10 rounded bg-[#0d1b2a] border ${
                  error ? "border-red-500" : "border-gray-600"
                }`}
                value={investorPassword}
                onChange={(e) => {
                  setInvestorPassword(e.target.value);
                  if (error) setError("");
                }}
              />
              <button
                type="button"
                onClick={() => setShowInvestorPassword((prev) => !prev)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                {showInvestorPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

        {/* Submit Button */}
        <button
          className="bg-blue-600 cursor-pointer w-full py-2 mt-4 rounded text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          onClick={handleSubmit}
          disabled={isButtonDisabled}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        {response && (
          <p
            className={`text-sm mt-3 text-center ${
              isSuccess ? "text-green-400" : "text-red-400"
            }`}
          >
            {response}
          </p>
        )}

        <button
          className="text-sm cursor-pointer text-gray-400 hover:text-white underline mt-4 block mx-auto"
          onClick={handleClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default UpdatePasswordModal;