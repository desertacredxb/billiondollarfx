"use client";

import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  accountNo: number | string;
}

const UpdatePasswordModal = ({ isOpen, onClose, accountNo }: Props) => {
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  // MT5 Password rules: 8-16 chars, uppercase, lowercase, numbers/special characters
  const validatePassword = (pwd: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,16}$/;
    return regex.test(pwd);
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    setResponse(null);
    setShowPassword(false);
    onClose();
  };

  const handleSubmit = async () => {
    setResponse(null);
    setError("");

    if (!validatePassword(password)) {
      setError(
        "Password must be 8-16 characters long and contain uppercase, lowercase, and a special character."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/mt5/change_password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            login: accountNo.toString(),
            password: password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSuccess(true);
        setResponse(data.message || "Password updated successfully!");
        setPassword("");
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-[#121a2a] p-6 rounded-lg border border-gray-700 w-[90%] max-w-sm text-white">
        <h2 className="text-lg font-semibold mb-4">Update MT5 Password</h2>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter new master password"
            className={`w-full p-2 pr-10 rounded bg-[#0d1b2a] border ${
              error ? "border-red-500" : "border-gray-600"
            }`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError("");
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

        <button
          className="bg-blue-600 cursor-pointer w-full py-2 mt-4 rounded text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          onClick={handleSubmit}
          disabled={loading || !password}
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