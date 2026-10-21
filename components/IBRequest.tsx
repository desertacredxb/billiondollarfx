"use client";
import { useEffect, useState } from "react";
import Button from "./Button";
import axios, { AxiosError } from "../lib/apiClient";
import { useRouter } from "next/navigation";

interface IBRequestProps {
  user: {
    email: string;
    ibRequestPending?: boolean;
  };
  refreshUser?: () => void;
  setUser?: (user: IBRequestProps["user"]) => void;
}

interface Application {
  status: "not_applied" | "pending" | "approved" | "rejected";
  statusReason?: string;
  canReapply?: boolean;
  verificationRequired?: boolean;
}

interface FormData {
  existingClientBase: string;
  offerEducation: string;
  expectedClientsNext3Months: string;
  expectedCommissionDirect: string;
  expectedCommissionSubIB: string;
  yourShare: string;
  clientShare: string;
}

function IBRequest({ user, refreshUser, setUser }: IBRequestProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    existingClientBase: "",
    offerEducation: "",
    expectedClientsNext3Months: "",
    expectedCommissionDirect: "",
    expectedCommissionSubIB: "0",
    yourShare: "0",
    clientShare: "0",
  });
  const [loading, setLoading] = useState(false);

  const [application, setApplication] = useState<Application | null>(null);
  const [statusError, setStatusError] = useState("");
  const [statusAttempt, setStatusAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatusError("");
    axios.get<Application>(`${process.env.NEXT_PUBLIC_API_BASE}/api/ib/${encodeURIComponent(user.email)}`, {
      signal: controller.signal, timeout: 15000,
      headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
    }).then(({ data }) => { if (!controller.signal.aborted) setApplication(data); })
      .catch(() => { if (!controller.signal.aborted) setStatusError("Unable to load your IB application. Please retry."); });
    return () => controller.abort();
  }, [user.email, statusAttempt]);

  // Update form values
  const handleChange = (field: keyof FormData, value: string) => {
    const updated: FormData = { ...formData, [field]: value };

    if (field === "expectedCommissionDirect") {
      const commissionValue = parseInt(value, 10) || 0;
      updated.yourShare = String(commissionValue / 2);
      updated.clientShare = String(commissionValue / 2);
    }

    setFormData(updated);
  };

  const handleSubmit = async (reapply = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/ib/register`, {
        ...formData,
        email: user.email,
        reapply,
      }, { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } });

      alert(response.data.message || "IB Request Submitted!");
      setShowForm(false);
      setApplication(response.data.newIB);

      // mark request as pending instantly
      setUser?.({ ...user, ibRequestPending: response.data.newIB?.status !== "approved" });

      // refresh user from backend
      refreshUser?.();
      if (response.data.verificationRequired) router.push("/verify-identity?returnTo=ib");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      if (
        axiosErr.response?.data?.message
      ) {
        alert(`⚠️ ${axiosErr.response.data.message}`);
      } else {
        alert("❌ Something went wrong while submitting IB request");
      }
      console.error("❌ Error submitting IB request:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-fit bg-gradient-to-br from-[#0a0f1d] to-[#0f172a] px-6 md:px-12 py-10 text-white">
      <div>
        <h1 className="text-lg md:text-xl border-b font-bold mb-4">
          Become an Introducing Broker With Billion Dollar FX
        </h1>
        <p className="text-gray-400 mb-6 leading-relaxed">
          Join our Introducing Broker (IB) program and unlock the potential to
          grow your business and increase your revenue. As a valued partner,
          you&#39;ll gain access to our world-class trading technology,
          dedicated support, and competitive compensation structures.
        </p>

        {/* Benefits */}
        <h2 className="text-xl text-gray-300 font-semibold mb-3">
          Benefits of Being an Introducing Broker:
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-400 mb-6">
          <li>
            <span className="font-medium text-white">Attractive Rebates:</span>{" "}
            Earn commissions on referred client activity.
          </li>
          <li>
            <span className="font-medium text-white">Marketing Support:</span>{" "}
            Access tools to grow your reach.
          </li>
          <li>
            <span className="font-medium text-white">Dedicated Manager:</span>{" "}
            Personalized support to help you scale.
          </li>
          <li>
            <span className="font-medium text-white">
              Transparent Reporting:
            </span>{" "}
            Track earnings and client activity easily.
          </li>
        </ul>

        {/* Steps */}
        <h2 className="text-xl text-gray-300 font-semibold mb-3">
          How to Become an IB?
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-400 mb-6">
          <li>Place a request</li>
          <li>Receive confirmation and your IB link</li>
          <li>Start promoting and earning!</li>
        </ol>

        {/* Status Button */}
        <div className="text-center">
          {statusError ? (
            <div role="alert"><p className="mb-3">{statusError}</p><Button text="Retry" onClick={() => setStatusAttempt(value => value + 1)} /></div>
          ) : !application ? (
            <p role="status">Checking your IB application...</p>
          ) : application.status === "not_applied" ? (
            <Button text="Enroll To Become IB" onClick={() => setShowForm(true)} />
          ) : (
            <div className="rounded-xl border border-gray-700 p-5 text-left" role="status">
              <h3 className="mb-2 font-semibold">{application.status === "rejected" ? "IB application unsuccessful" : application.status === "approved" ? "IB application approved" : "IB application pending"}</h3>
              <p className="mb-4 text-gray-300">{application.statusReason}</p>
              <div className="flex flex-wrap items-center gap-4">
                {application.canReapply && <Button text={loading ? "Checking..." : "Apply again"} disabled={loading} onClick={() => handleSubmit(true)} />}
                {application.verificationRequired && <Button text="Complete identity verification" onClick={() => router.push("/verify-identity?returnTo=ib")} />}
                {application.status !== "approved" && <a href="https://wa.me/447999283366" target="_blank" rel="noopener noreferrer" className="text-[#ffd700] underline">Contact WhatsApp support</a>}
              </div>
              {application.canReapply && <p className="mt-3 text-sm text-gray-400">After resolving the reason above, apply again. Eligible accounts with approved live KYC, including an approved support review, are automatically approved. Applications awaiting a manual decision go back to support.</p>}
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showForm && application?.status === "not_applied" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-[#111a2e] p-6 rounded-lg w-[90%] md:w-[500px]">
            <h2 className="text-xl font-semibold mb-4">
              IB Onboarding Questions
            </h2>

            {/* Q1 */}
            <label className="block mb-2">
              Do you have an existing client base?
            </label>
            <select
              value={formData.existingClientBase}
              onChange={(e) =>
                handleChange("existingClientBase", e.target.value)
              }
              className="w-full p-2 mb-4 bg-gray-800 rounded"
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>

            {/* Q2 */}
            <label className="block mb-2">
              Do you offer client education, mentorship, or training?
            </label>
            <select
              value={formData.offerEducation}
              onChange={(e) => handleChange("offerEducation", e.target.value)}
              className="w-full p-2 mb-4 bg-gray-800 rounded"
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>

            {/* Q3 */}
            <label className="block mb-2">
              How many clients do you expect to onboard in the next 3 months?
            </label>
            <select
              value={formData.expectedClientsNext3Months}
              onChange={(e) =>
                handleChange("expectedClientsNext3Months", e.target.value)
              }
              className="w-full p-2 mb-4 bg-gray-800 rounded"
            >
              <option value="">Select</option>
              <option value="0-10">0-10</option> {/* ✅ FIXED */}
              <option value="10-50">10-50</option>
              <option value="50-100">50-100</option>
              <option value="100+">100+</option>
            </select>

            {/* Q4 */}
            <label className="block mb-2">
              What commission per lot do you expect from your direct client?
            </label>
            <select
              value={formData.expectedCommissionDirect}
              onChange={(e) =>
                handleChange("expectedCommissionDirect", e.target.value)
              }
              className="w-full p-2 mb-4 bg-gray-800 rounded"
            >
              <option value="">Select</option>
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="6">6</option>
              <option value="8">8</option>
              <option value="10">10</option>
            </select>

            {/* Q5 & Q6 */}
            <div className="flex justify-between mb-6">
              <div>
                <label className="block mb-2">Your Share</label>
                <input
                  type="text"
                  value={formData.yourShare}
                  readOnly
                  className="w-full p-2 bg-gray-700 rounded text-center"
                />
              </div>
              <div>
                <label className="block mb-2">Client Share</label>
                <input
                  type="text"
                  value={formData.clientShare}
                  readOnly
                  className="w-full p-2 bg-gray-700 rounded text-center"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-600 rounded-full hover:bg-gray-700"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <Button
                onClick={() => handleSubmit()}
                disabled={loading}
                text={loading ? "Submitting..." : "Submit Request"}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IBRequest;
