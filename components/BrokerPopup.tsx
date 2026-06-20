"use client";
import { useState } from "react";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface BrokerPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BrokerPopup({ isOpen, onClose }: BrokerPopupProps) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
    otp: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSendOtp = async () => {
    try {
      setOtpLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/brokers/request-otp`,
        { email: form.email }
      );
      setOtpSent(true);
      setResponseMsg(res.data.message || "OTP sent");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setResponseMsg(err.response?.data?.message || "Failed to send OTP");
      } else {
        setResponseMsg("Failed to send OTP");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!agreed) return;

    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/brokers/verify`,
        form
      );
      setResponseMsg(res.data.message || "Broker verified successfully");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setResponseMsg(err.response?.data?.message || "Submission failed");
      } else {
        setResponseMsg("Submission failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
      <div className="bg-white text-black w-full max-w-lg rounded-2xl p-6 md:p-10 space-y-6 shadow-xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl text-gray-500 hover:text-red-500"
        >
          &times;
        </button>

        <div className="text-left">
          <h3 className="text-lg font-bold">Registration Form</h3>
          <p className="text-sm text-gray-500">
            Drop your details, we will get in touch with you soon.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <input
            name="firstName"
            type="text"
            placeholder="👤 First Name"
            value={form.firstName}
            onChange={handleChange}
            className="border rounded-md px-4 py-2 flex-1 bg-gray-50 text-sm"
          />
          <input
            name="lastName"
            type="text"
            placeholder="👤 Last Name"
            value={form.lastName}
            onChange={handleChange}
            className="border rounded-md px-4 py-2 flex-1 bg-gray-50 text-sm"
          />
        </div>

        <div className="flex gap-2">
          <input
            name="email"
            type="email"
            placeholder="✉️ Email"
            value={form.email}
            onChange={handleChange}
            className="border rounded-md px-4 py-2 flex-1 bg-gray-50 text-sm"
          />
          <button
            onClick={handleSendOtp}
            disabled={!form.email || otpLoading}
            className={`text-sm px-4 rounded-md flex items-center justify-center ${
              form.email && !otpLoading
                ? "bg-[var(--primary)] text-white"
                : "bg-gray-300 cursor-not-allowed text-gray-500"
            }`}
          >
            {otpLoading ? (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
            ) : otpSent ? (
              "Resend OTP"
            ) : (
              "Send OTP"
            )}
          </button>
        </div>

        {otpSent && (
          <input
            name="otp"
            type="text"
            placeholder="🔒 Enter OTP"
            value={form.otp}
            onChange={handleChange}
            className="border rounded-md px-4 py-2 w-full bg-gray-50 text-sm"
          />
        )}

        <PhoneInput
          country={"in"}
          value={form.phone}
          onChange={(phone) => setForm((prev) => ({ ...prev, phone }))}
          inputClass="!w-full !py-2 !pl-10 !text-sm !bg-gray-50 !border !rounded-md"
          containerClass="!w-full"
          inputProps={{
            required: true,
            name: "phone",
          }}
        />

        <textarea
          name="message"
          placeholder="💬 Message"
          value={form.message}
          onChange={handleChange}
          rows={3}
          className="w-full border rounded-md px-4 py-2 bg-gray-50 text-sm"
        ></textarea>

        <label className="flex items-start gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>
            By submitting this form, you agree to be contacted by our team.
          </span>
        </label>

        <button
          onClick={handleSubmit}
          disabled={!agreed || !form.otp}
          className={`w-full py-2 rounded-full font-semibold text-white ${
            agreed && form.otp
              ? "bg-[var(--primary)] hover:bg-[#FDE89B]"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>

        {responseMsg && (
          <p className="text-sm mt-2 text-gray-700 text-left">{responseMsg}</p>
        )}
      </div>
    </div>
  );
}
