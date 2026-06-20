"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Broker {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  marked?: boolean; // ✅ new field
}

export default function UsersPage() {
  const router = useRouter();
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    // 🔐 Redirect to login if no token
    if (!token || token !== "admin-token") {
      router.push("/login");
      return;
    }

    fetchBrokers();
  }, []);

  const fetchBrokers = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/brokers`
      );
      setBrokers(res.data);
    } catch (err) {
      console.error("Failed to fetch brokers:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Toggle marked status
  const handleToggleMarked = async (id: string) => {
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/brokers/${id}/mark`
      );

      setBrokers((prev) =>
        prev.map((broker) =>
          broker._id === id ? { ...broker, marked: res.data.marked } : broker
        )
      );
    } catch (err) {
      console.error("Failed to update broker:", err);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Broker Applications</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Below is the list of brokers who have applied to join us.
        </p>
        <hr className="mt-4 border-gray-700" />
      </div>

      {loading ? (
        <p className="text-gray-400">Loading broker applications...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#1f2937]">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1f2937] text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Marked</th>
              </tr>
            </thead>
            <tbody>
              {brokers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-400">
                    No broker applications found.
                  </td>
                </tr>
              ) : (
                brokers.map((broker) => (
                  <tr
                    key={broker._id}
                    className="border-b border-gray-700 hover:bg-[#111827]"
                  >
                    <td className="px-4 py-3">
                      {broker.firstName} {broker.lastName}
                    </td>
                    <td className="px-4 py-3">{broker.email}</td>
                    <td className="px-4 py-3">{broker.phone}</td>
                    <td className="px-4 py-3">{broker.message || "N/A"}</td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={broker.marked || false}
                        onChange={() => handleToggleMarked(broker._id)}
                        className="w-5 h-5 cursor-pointer accent-[var(--primary)]"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
