"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "../../../../components/Button";

interface IBRequest {
  _id: string;
  email: string;
  existingClientBase: string;
  offerEducation: string;
  expectedClientsNext3Months: string;
  expectedCommissionDirect: string;
  expectedCommissionSubIB: string;
  yourShare: number;
  clientShare: number;
  status: "pending" | "approved" | "rejected";
  referralCode?: string;
  commission?: number;
}

export default function IBRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<IBRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [isApprove, setIsApprove] = useState(false);
  const [isReject, setIsReject] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<IBRequest | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState(""); // 🔹 new state

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/ib`);
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("Error fetching IB requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token || token !== "admin-token") {
      router.push("/login");
      return;
    }
    fetchRequests();
  }, []);

  const approve = async (email: string) => {
    setIsApprove(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/ib/${email}/approve`,
        { method: "PUT" }
      );
      const data = await res.json();
      alert(data.message);
      fetchRequests();
    } catch (err) {
      console.error("Approve error:", err);
    } finally {
      setIsApprove(false);
    }
  };

  const reject = async (email: string) => {
    setIsReject(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/ib/${email}/reject`,
        { method: "PUT" }
      );
      const data = await res.json();
      alert(data.message);
      fetchRequests();
    } catch (err) {
      console.error("Reject error:", err);
    } finally {
      setIsReject(false);
    }
  };

  // 🔹 Filter requests by search term
  const filteredRequests = requests.filter((ib) =>
    ib.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen text-white p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">IB Requests</h1>
        <p className="text-gray-400 mt-1 text-sm">
          List of Introducing Broker requests
        </p>
        <hr className="mt-4 border-gray-700" />
      </div>

      {/* 🔹 Search bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 rounded-lg bg-[#111827] border border-gray-600 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {loading ? (
        <p className="text-gray-400">Loading requests...</p>
      ) : filteredRequests.length === 0 ? (
        <p className="text-gray-400 text-center py-10">No IB requests found.</p>
      ) : (
        <div className="rounded-lg border border-[#1f2937] overflow-hidden">
          {/* Desktop Table */}
          <table className="hidden md:table w-full text-sm text-left">
            <thead className="bg-[#1f2937] text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3">Existing Clients</th>
                <th className="px-4 py-3">Offer Education</th>
                <th className="px-4 py-3">Expected Clients</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Referral Code</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((ib) => (
                <tr
                  key={ib._id}
                  className="border-b border-gray-700 hover:bg-[#111827]"
                >
                  <td className="px-4 py-3">{ib.email}</td>
                  <td className="px-4 py-3">
                    {ib.commission?.toFixed(2) ?? "—"}
                  </td>
                  <td className="px-4 py-3">{ib.existingClientBase}</td>
                  <td className="px-4 py-3">{ib.offerEducation}</td>
                  <td className="px-4 py-3">{ib.expectedClientsNext3Months}</td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      ib.status === "approved"
                        ? "text-green-400"
                        : ib.status === "rejected"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {ib.status}
                  </td>
                  <td className="px-4 py-3">{ib.referralCode || "—"}</td>
                  <td className="px-4 py-3">
                    <Button
                      onClick={() => setSelectedRequest(ib)}
                      text="View"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile List */}
          <div className="md:hidden space-y-4">
            {filteredRequests.map((ib) => (
              <div
                key={ib._id}
                className="p-4 border border-gray-700 rounded-lg bg-[#111827]"
              >
                <p className="text-sm">
                  <b>Email:</b> {ib.email}
                </p>
                <p className="text-sm">
                  <b>Commission:</b> {ib.commission?.toFixed(2) ?? "—"}
                </p>
                <p className="text-sm">
                  <b>Status:</b>{" "}
                  <span
                    className={`font-semibold ${
                      ib.status === "approved"
                        ? "text-green-400"
                        : ib.status === "rejected"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {ib.status}
                  </span>
                </p>
                <button
                  onClick={() => setSelectedRequest(ib)}
                  className="mt-3 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#1f2937] rounded-lg p-6 w-11/12 md:w-2/3 max-h-[90vh] overflow-y-auto space-y-3 relative">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4">{selectedRequest.email}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
              <div className="space-y-6">
                <p>
                  <b>Existing Clients:</b> {selectedRequest.existingClientBase}
                </p>
                <p>
                  <b>Offer Education:</b> {selectedRequest.offerEducation}
                </p>
                <p>
                  <b>Expected Clients (3 Months):</b>{" "}
                  {selectedRequest.expectedClientsNext3Months}
                </p>
                <p>
                  <b>Status:</b>{" "}
                  <span
                    className={`font-semibold ${
                      selectedRequest.status === "approved"
                        ? "text-green-400"
                        : selectedRequest.status === "rejected"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {selectedRequest.status}
                  </span>
                </p>
                <p>
                  <b>User Commission:</b>{" "}
                  {selectedRequest.commission?.toFixed(2) ?? "—"}%
                </p>
              </div>
              <div className="space-y-5">
                <p>
                  <b>Direct Commission:</b>{" "}
                  {selectedRequest.expectedCommissionDirect}
                </p>
                <p>
                  <b>Sub IB Commission:</b>{" "}
                  {selectedRequest.expectedCommissionSubIB}
                </p>
                <p>
                  <b>Your Share:</b> {selectedRequest.yourShare}%
                </p>
                <p>
                  <b>Client Share:</b> {selectedRequest.clientShare}%
                </p>
                <p>
                  <b>Referral Code:</b> {selectedRequest.referralCode || "—"}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              {selectedRequest.status !== "approved" && (
                <Button
                  onClick={async () => {
                    await approve(selectedRequest.email);
                    setSelectedRequest(null);
                  }}
                  text={isApprove ? "Approving..." : "Approve"}
                />
              )}
              {selectedRequest.status !== "rejected" && (
                <Button
                  onClick={async () => {
                    await reject(selectedRequest.email);
                    setSelectedRequest(null);
                  }}
                  text={isReject ? "Rejecting..." : "Reject"}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
