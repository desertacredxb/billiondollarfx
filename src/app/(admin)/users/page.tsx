"use client";

import Fuse from "fuse.js";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useRouter } from "next/navigation";
import Button from "../../../../components/Button";

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
  identityFront?: string;
  identityBack?: string;
  addressProof?: string;
  selfieProof?: string;
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
                        ? `${user.referredByName}${
                            user.referralCode ? ` (${user.referralCode})` : ""
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#1f2937] rounded-lg p-6 w-11/12 md:w-2/3 max-h-[90vh] overflow-y-auto no-scrollbar relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-3 right-5 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              {selectedUser.profileImage && (
                <img
                  src={selectedUser.profileImage}
                  alt={selectedUser.fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              {selectedUser.fullName}
            </h2>

            {/* Two-column layout: user + bank info */}
            <div className="flex justify-between gap-10 mb-10">
              {/* Left: User Info */}
              <div className="space-y-2 text-sm text-gray-300 w-1/2">
                <p>
                  <b>Email:</b> {selectedUser.email}
                </p>
                <p>
                  <b>Phone:</b> {selectedUser.phone}
                </p>
                <p>
                  <b>Gender:</b> {selectedUser.gender}
                </p>
                <p>
                  <b>Nationality:</b> {selectedUser.nationality}
                </p>
                <p>
                  <b>State:</b> {selectedUser.state}
                </p>
                <p>
                  <b>City:</b> {selectedUser.city}
                </p>
                <p>
                  <b>Address:</b> {selectedUser.address}
                </p>
                <p>
                  <b>Account Type:</b> {selectedUser.accountType}
                </p>
              </div>

              {/* Right: Bank Info */}
              <div className="space-y-2 text-sm text-gray-300 w-1/2">
                <p>
                  <b>Account Holder:</b> {selectedUser.accountHolderName}
                </p>
                <p>
                  <b>Account Number:</b> {selectedUser.accountNumber}
                </p>
                {selectedUser.ifscCode && (
                  <p>
                    <b>IFSC:</b> {selectedUser.ifscCode}
                  </p>
                )}
                {selectedUser.iban && (
                  <p>
                    <b>IBAN:</b> {selectedUser.iban}
                  </p>
                )}
                <p>
                  <b>Bank Name:</b> {selectedUser.bankName}
                </p>
                <p>
                  <b>Bank Address:</b> {selectedUser.bankAddress}
                </p>
              </div>
            </div>

            <p>
              <b>KYC Status:</b>{" "}
              {selectedUser.isKycVerified ? (
                <span className="text-green-400">Verified</span>
              ) : (
                <span className="text-yellow-400">Pending</span>
              )}
            </p>

            {/* Documents */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Documents</h3>
              <div className="grid grid-cols-2 gap-4">
                {selectedUser.identityFront && (
                  <div>
                    <p className="mb-1 text-sm">ID Card (Front)</p>
                    <Zoom>
                      <img
                        src={selectedUser.identityFront}
                        alt="Identity Front"
                        className="rounded border border-gray-600 cursor-pointer hover:scale-105 transition"
                      />
                    </Zoom>
                  </div>
                )}
                {selectedUser.identityBack && (
                  <div>
                    <p className="mb-1 text-sm">ID Card (Back)</p>
                    <Zoom>
                      <img
                        src={selectedUser.identityBack}
                        alt="Identity Back"
                        className="rounded border border-gray-600 cursor-pointer hover:scale-105 transition"
                      />
                    </Zoom>
                  </div>
                )}
                {selectedUser.addressProof && (
                  <div>
                    <p className="mb-1 text-sm">Address Proof</p>
                    <Zoom>
                      <img
                        src={selectedUser.addressProof}
                        alt="Address Proof"
                        className="rounded border border-gray-600 cursor-pointer hover:scale-105 transition"
                      />
                    </Zoom>
                  </div>
                )}
                {selectedUser.selfieProof && (
                  <div>
                    <p className="mb-1 text-sm">Selfie Proof</p>
                    <Zoom>
                      <img
                        src={selectedUser.selfieProof}
                        alt="Selfie Proof"
                        className="rounded border border-gray-600 cursor-pointer hover:scale-105 transition"
                      />
                    </Zoom>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              {!selectedUser.isKycVerified && (
                <Button
                  onClick={() => handleVerifyKyc(selectedUser.email)}
                  disabled={verifying}
                  className="bg-[var(--primary)] hover:bg-[#f3d089] text-black"
                  text={verifying ? "Verifying..." : "Verify KYC"}
                />
              )}

              <Button
                onClick={() => handleRejectKyc(selectedUser.email)}
                text="Reject KYC"
              />
              <Button
                onClick={() => handleDeleteUser(selectedUser.email)}
                text="Delete User"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
