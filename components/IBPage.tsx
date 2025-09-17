"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

interface User {
  email: string;
  fullName?: string;
  referralCode?: string;
  isApprovedIB?: boolean;
}

interface IBPageProps {
  user: User;
}

function IBPage({ user }: IBPageProps) {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [connections, setConnections] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferralAndConnections = async () => {
      try {
        // 1. Fetch IB referral code
        const ibRes = await axios.get<{ referralCode: string }>(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/ib/${user.email}`
        );
        const code = ibRes.data.referralCode;
        setReferralCode(code);

        // 2. Fetch all users
        const usersRes = await axios.get<User[]>(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/users`
        );
        const allUsers = usersRes.data;

        // 3. Filter connections by referral code
        const matchedUsers = allUsers.filter((u) => u.referralCode === code);
        setConnections(matchedUsers);
      } catch (err: unknown) {
        const axiosErr = err as AxiosError;
        console.error(
          "❌ Error fetching IB data:",
          axiosErr.response?.data || axiosErr.message
        );
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) fetchReferralAndConnections();
  }, [user?.email]);

  const copyToClipboard = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen  bg-gradient-to-br from-[#0a0f1d] to-[#0f172a] px-6 md:px-12 py-10 text-white">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-8 text-center">
        Welcome, IB Partner 🎉
      </h1>

      {/* Referral Code Panel */}
      <div className="w-full max-w-xl mx-auto bg-[#111a2e] p-6 rounded-2xl shadow-lg mb-10 flex flex-col items-center">
        <p className="text-gray-400 mb-2">Your Referral Code</p>
        <div className="flex items-center gap-3">
          <span className="text-yellow-400 font-mono font-semibold text-lg bg-[#1b2744] px-5 py-2 rounded-lg">
            {`https://www.billiondollarfx.com/register?ref=${referralCode}`}
          </span>
          <button
            onClick={copyToClipboard}
            className="bg-[#1b2744] px-3 py-2 rounded-lg hover:bg-[#2a3a5f] transition"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Connections Panel */}
      <div className="w-full max-w-4xl mx-auto bg-[#111a2e] rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">👥 My Connections</h2>
          <span className="text-gray-400">
            {connections.length} connections
          </span>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-10">
            Loading connections...
          </p>
        ) : connections.length === 0 ? (
          <p className="text-gray-400 text-center py-10">
            No connections found yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4 text-gray-400 font-medium">#</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">Name</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">Email</th>
                </tr>
              </thead>
              <tbody>
                {connections.map((c, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-[#1b2744] transition rounded-lg"
                  >
                    <td className="py-3 px-4">{idx + 1}</td>
                    <td className="py-3 px-4">
                      {c.fullName || "Unnamed User"}
                    </td>
                    <td className="py-3 px-4">{c.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default IBPage;
