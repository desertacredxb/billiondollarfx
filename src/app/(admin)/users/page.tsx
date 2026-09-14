"use client";

import Fuse from "fuse.js";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useRouter } from "next/navigation";
import { X, ShieldCheck, ShieldAlert } from "lucide-react";
import Button from "../../../../components/Button";

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm border-b border-gray-800 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200 text-right break-all">{value}</span>
    </div>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#161f2e] border border-gray-800 rounded-xl p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}

interface User {
  referredByName?: string;
  _id: string;
  fullName: string;
  gender: string;
  email: string;
  phone: string;
  nationality: string;
  state?: string;
  city?: string;
  address?: string;
  accountType?: string;
  isKycVerified?: boolean;
  profileImage?: string;
  referralCode?: string; // 🔥 added

  //Bank
  accountHolderName: string;
  accountNumber: string;
  ifscCode?: string;
  iban?: string;
  bankName: string;
  bankAddress: string;

  // Documents
  idProof1?: { docType?: string; docNumber?: string; image?: string };
  idProof2?: { docType?: string; docNumber?: string; image?: string };
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Add filter state
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);

  // ✅ For document preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fuse.js search
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token || token !== "admin-token") {
      router.push("/login");
      return;
    }

    const fetchUsersWithReferrers = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/users`
        );
        const usersData = res.data;
        // console.log(usersData);

        // 🔥 Fetch referred user names in parallel
        const usersWithRef = await Promise.all(
          usersData.map(async (user: User) => {
            if (!user.referralCode) return user;

            try {
              const refRes = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/userByRef/${user.referralCode}`
              );
              // console.log(refRes.data.user?.fullName);
              const referredBy = refRes.data.user?.fullName || "N/A";
              return { ...user, referredByName: referredBy };
            } catch (err) {
              console.error("Error fetching referredBy for", user.email);
              return { ...user, referredByName: "N/A" };
            }
          })
        );

        setUsers(usersWithRef);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersWithReferrers();
  }, []);

  // ✅ Apply filter on users
  const filteredUsers = users.filter((u) => {
    if (filter === "pending") return !u.isKycVerified;
    if (filter === "approved") return u.isKycVerified;
    return true;
  });

  // Fuse.js setup
  const fuse = useMemo(
    () =>
      new Fuse(filteredUsers, {
        keys: ["fullName", "email", "nationality"],
        threshold: 0.3, // sensitivity
      }),
    [filteredUsers]
  );

  const searchedUsers = searchQuery
    ? fuse.search(searchQuery).map((res) => res.item)
    : filteredUsers;

  const handleVerifyKyc = async (email: string) => {
    try {
      setVerifying(true);
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/${email}/verify-kyc`,
        { status: true }
      );

      setUsers((prev) =>
        prev.map((u) => (u.email === email ? { ...u, isKycVerified: true } : u))
      );

      alert("✅ User KYC Verified");
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to verify KYC:", err);
      alert("❌ Failed to verify KYC");
    } finally {
      setVerifying(false);
    }
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = searchedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(searchedUsers.length / usersPerPage);

  const handleDeleteUser = async (email: string) => {
    if (
      !confirm(
        "⚠️ Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/delete/${email}`
      );
      setUsers((prev) => prev.filter((u) => u.email !== email));
      alert("🗑️ User deleted successfully");
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("❌ Failed to delete user");
    }
  };

  const handleRejectKyc = async (email: string) => {
    if (
      !confirm(
        "⚠️ Are you sure you want to reject this user's KYC? The user will be notified via email."
      )
    ) {
      return;
    }

    try {
      // Call backend API to reject KYC
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/reject/${email}`
      );

      // Update user list locally (optional — set KYC to unverified)
      setUsers((prev) =>
        prev.map((u) =>
          u.email === email ? { ...u, isKycVerified: false } : u
        )
      );

      alert("🚫 User KYC rejected successfully");
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to reject user KYC:", err);
      alert("❌ Failed to reject user KYC");
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-400 mt-1 text-sm">List of registered users</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by name or email "
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#1f2937] text-white border border-gray-600 rounded px-3 py-1 w-64"
          />
          {/* ✅ Filter dropdown */}
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as "all" | "pending" | "approved");
              setCurrentPage(1); // reset to first page
            }}
            className="bg-[#1f2937] text-white border border-gray-600 rounded px-3 py-1"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>

          {/* ✅ Users per page dropdown */}
          <select
            value={usersPerPage}
            onChange={(e) => {
              setUsersPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-[#1f2937] text-white border border-gray-600 rounded px-3 py-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading users...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#1f2937]">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1f2937] text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                {/* <th className="px-4 py-3">Nationality</th> */}
                <th className="px-4 py-3">Referred By</th>
                <th className="px-4 py-3">KYC</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-700 hover:bg-[#111827]"
                  >
                    <td className="px-4 py-3">{user.fullName}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.phone}</td>
                    {/* <td className="px-4 py-3">{user.nationality || "N/A"}</td> */}
                    <td className="px-4 py-3">
                      {user.referredByName
                        ? `${user.referredByName}${user.referralCode ? ` (${user.referralCode})` : ""
                        }`
                        : "—"}
                    </td>

                    <td className="px-4 py-3">
                      {user.isKycVerified ? (
                        <span className="text-green-400 font-medium">
                          Verified
                        </span>
                      ) : (
                        <span className="text-yellow-400 font-medium">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        onClick={() => setSelectedUser(user)}
                        text="View"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* ✅ User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f2937] rounded-2xl w-full md:w-2/3 max-h-[90vh] overflow-y-auto no-scrollbar relative shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-[#1f2937] border-b border-gray-800 px-6 py-5 flex items-start justify-between gap-4 z-10">
              <div className="flex items-center gap-4 min-w-0">
                {selectedUser.profileImage ? (
                  <img
                    src={selectedUser.profileImage}
                    alt={selectedUser.fullName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-700 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#2c3e50] flex items-center justify-center text-lg font-bold border-2 border-gray-700 shrink-0">
                    {selectedUser.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="text-xl font-bold truncate">
                    {selectedUser.fullName}
                  </h2>
                  <p className="text-sm text-gray-400 truncate">
                    {selectedUser.email}
                  </p>
                  <span
                    className={`mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedUser.isKycVerified
                        ? "bg-green-600/20 text-green-400"
                        : "bg-yellow-600/20 text-yellow-400"
                      }`}
                  >
                    {selectedUser.isKycVerified ? (
                      <ShieldCheck size={12} />
                    ) : (
                      <ShieldAlert size={12} />
                    )}
                    {selectedUser.isKycVerified
                      ? "KYC Verified"
                      : "KYC Pending"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Info cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard title="Personal Info">
                  <InfoRow label="Phone" value={selectedUser.phone} />
                  <InfoRow label="Gender" value={selectedUser.gender} />
                  <InfoRow
                    label="Nationality"
                    value={selectedUser.nationality}
                  />
                  <InfoRow label="State" value={selectedUser.state} />
                  <InfoRow label="City" value={selectedUser.city} />
                  <InfoRow label="Address" value={selectedUser.address} />
                  <InfoRow
                    label="Account Type"
                    value={selectedUser.accountType}
                  />
                  <InfoRow
                    label="Referred By"
                    value={
                      selectedUser.referredByName
                        ? `${selectedUser.referredByName}${selectedUser.referralCode
                          ? ` (${selectedUser.referralCode})`
                          : ""
                        }`
                        : undefined
                    }
                  />
                </InfoCard>

                <InfoCard title="Bank Details">
                  <InfoRow
                    label="Account Holder"
                    value={selectedUser.accountHolderName}
                  />
                  <InfoRow
                    label="Account Number"
                    value={selectedUser.accountNumber}
                  />
                  <InfoRow label="IFSC" value={selectedUser.ifscCode} />
                  <InfoRow label="IBAN" value={selectedUser.iban} />
                  <InfoRow label="Bank Name" value={selectedUser.bankName} />
                  <InfoRow
                    label="Bank Address"
                    value={selectedUser.bankAddress}
                  />
                  {!selectedUser.accountHolderName &&
                    !selectedUser.accountNumber &&
                    !selectedUser.bankName && (
                      <p className="text-sm text-gray-500">
                        No bank details submitted yet.
                      </p>
                    )}
                </InfoCard>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                  Documents
                </h3>
                {!selectedUser.idProof1?.image &&
                  !selectedUser.idProof2?.image ? (
                  <p className="text-sm text-gray-500 bg-[#161f2e] border border-gray-800 rounded-xl p-4">
                    No documents submitted yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[selectedUser.idProof1, selectedUser.idProof2].map(
                      (doc, i) =>
                        doc?.image && (
                          <div
                            key={i}
                            className="bg-[#161f2e] border border-gray-800 rounded-xl overflow-hidden"
                          >
                            <Zoom>
                              <img
                                src={doc.image}
                                alt={`ID Proof ${i + 1}`}
                                className="w-full h-44 object-cover cursor-pointer hover:opacity-90 transition"
                              />
                            </Zoom>
                            <div className="flex items-center justify-between gap-3 p-3 bg-gray-900/40 rounded-lg border border-white/10">
                              {/* Document Type Field */}
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs font-medium text-gray-400 shrink-0">Doc Type:</span>
                                <span className="text-xs font-mono font-semibold capitalize tracking-wide text-gray-100 truncate">
                                  {doc.docType || `ID Proof ${i + 1}`}
                                </span>
                              </div>

                              {/* Document Number Field */}
                              <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                                <span className="text-xs font-medium text-gray-400 shrink-0">Doc No:</span>
                                <span className="text-xs font-mono font-semibold tracking-wide text-gray-100 truncate">
                                  {doc.docNumber || "—"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-[#1f2937] border-t border-gray-800 px-6 py-4 flex flex-wrap justify-end gap-3">
              {!selectedUser.isKycVerified && (
                <button
                  onClick={() => handleVerifyKyc(selectedUser.email)}
                  disabled={verifying}
                  className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {verifying ? "Verifying..." : "Verify KYC"}
                </button>
              )}

              <button
                onClick={() => handleRejectKyc(selectedUser.email)}
                className="px-4 py-2 rounded-full text-sm font-semibold text-yellow-400 border border-yellow-600/40 hover:bg-yellow-600/10 transition"
              >
                Reject KYC
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser.email)}
                className="px-4 py-2 rounded-full text-sm font-semibold text-red-400 border border-red-600/40 hover:bg-red-600/10 transition"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
