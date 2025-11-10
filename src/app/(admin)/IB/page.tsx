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

interface ClientConnection {
  name: string;
  email: string;
  accounts: string[];
  totalDeposit: number;
  totalWithdrawal: number;
  totalLots: number;
  totalCommission: number;
  symbolLots: Record<string, number>;
}

interface User {
  fullName: string;
  email: string;
  referralCode?: string;
  accounts?: Account[];
}

interface Account {
  accountNo: string;
  balance?: number;
}

interface Deposit {
  status: string;
  amount: number;
}

interface Withdrawal {
  status: string;
  amount: number;
}

interface Deal {
  Symbol: string;
  Qty: number;
  Commission: number;
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

  const [clientConnections, setClientConnections] = useState<
    ClientConnection[]
  >([]);
  const [loadingClients, setLoadingClients] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // number of records per page

  const filteredRequests = requests.filter((ib) =>
    ib.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentTotal = filteredRequests.length;
  const totalPages = Math.ceil(currentTotal / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = filteredRequests.slice(startIndex, endIndex);

  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleFirst = () => setCurrentPage(1);
  const handleLast = () => setCurrentPage(totalPages);
  const jumpTo = (page: number) => setCurrentPage(page);

  // Dynamic pagination buttons like: 1 ... 4 5 6 ... 10
  const pageButtons = (() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage > 3) pages.push(1, "...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...", totalPages);
    }
    return pages;
  })();

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

  // // 🔹 Filter requests by search term
  // const filteredRequests = requests.filter((ib) =>
  //   ib.email.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const fetchClientsByReferral = async (referralCode: string) => {
    try {
      setLoadingClients(true);
      setClientConnections([]);

      const usersRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/users`
      );

      const users: User[] = await usersRes.json();

      const referredUsers = users.filter(
        (u: User) => u.referralCode === referralCode
      );

      const INR_TO_USD = 1 / 88.76; // ≈ 0.01126 USD per INR

      const enriched = await Promise.all(
        referredUsers.map(async (u: User) => {
          let totalDeposit = 0;
          let totalWithdrawal = 0;
          let totalLots = 0;
          let totalCommission = 0;
          const symbolLots: { [key: string]: number } = {};

          try {
            const accRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/user/${u.email}`
            );
            const userData = await accRes.json();
            const accounts = userData?.accounts || [];

            for (const acc of accounts as Account[]) {
              // Deposits
              const depRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/api/payment/deposit/${acc.accountNo}`
              );
              const deposits = await depRes.json();
              totalDeposit +=
                deposits?.deposits
                  ?.filter((d: Deposit) => d.status === "SUCCESS")
                  ?.reduce(
                    (sum: number, d: Deposit) =>
                      sum + Number(d.amount || 0) * INR_TO_USD,
                    0
                  ) || 0;

              // Withdrawals
              const wdRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/api/payment/withdrawal/${acc.accountNo}`
              );
              const withdrawals = await wdRes.json();
              totalWithdrawal +=
                withdrawals?.withdrawals
                  ?.filter(
                    (w: Withdrawal) =>
                      w.status === "SUCCESS" || w.status === "Completed"
                  )
                  ?.reduce(
                    (sum: number, w: Withdrawal) =>
                      sum + Number(w.amount || 0) * INR_TO_USD,
                    0
                  ) || 0;

              // Deals / Lots / Commission
              const today = new Date();
              const startOfMonth = new Date(
                today.getFullYear(),
                today.getMonth(),
                1
              )
                .toISOString()
                .split("T")[0];
              const endDate = today.toISOString().split("T")[0];

              const dealsRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/api/moneyplant/getDeals`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    accountno: acc.accountNo,
                    sdate: startOfMonth,
                    edate: endDate,
                  }),
                }
              );
              const dealsData = await dealsRes.json();
              const deals = dealsData?.data || [];
              // console.log(deals);

              for (const deal of deals) {
                const symbol = deal.Symbol;
                const lots = Number(deal.Qty || 0);

                totalLots += lots;
                if (!symbolLots[symbol]) symbolLots[symbol] = 0;
                symbolLots[symbol] += lots;

                totalCommission += Number(deal.Commission || 0);
              }
            }

            return {
              name: u.fullName || "—",
              email: u.email,
              accounts: (accounts as Account[]).map((a) => a.accountNo),
              totalDeposit,
              totalWithdrawal,
              totalLots,
              totalCommission,
              symbolLots,
            };
          } catch (err) {
            console.error(`Error for ${u.email}:`, err);
            return {
              name: u.fullName,
              email: u.email,
              accounts: [],
              totalDeposit: 0,
              totalWithdrawal: 0,
              totalLots: 0,
              totalCommission: 0,
              symbolLots: {},
            };
          }
        })
      );

      setClientConnections(enriched);
    } catch (err) {
      console.error("Error fetching client connections:", err);
    } finally {
      setLoadingClients(false);
    }
  };

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
      ) : currentData.length === 0 ? (
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
              {currentData.map((ib) => (
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
                      onClick={async () => {
                        setSelectedRequest(ib);
                        if (ib.referralCode) {
                          await fetchClientsByReferral(ib.referralCode);
                        } else {
                          setClientConnections([]);
                        }
                      }}
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
                <div className="mt-5">
                  <Button
                    onClick={async () => {
                      setSelectedRequest(ib);
                      if (ib.referralCode) {
                        await fetchClientsByReferral(ib.referralCode);
                      } else {
                        setClientConnections([]);
                      }
                    }}
                    text="View"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination Section */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-gray-400">
            {currentTotal > 0 ? (
              <>
                Showing{" "}
                <span className="text-white">
                  {startIndex + 1}-{Math.min(endIndex, currentTotal)}
                </span>{" "}
                of <span className="text-white">{currentTotal}</span>
              </>
            ) : (
              "No records"
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFirst}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
            >
              « First
            </button>
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
            >
              ‹ Prev
            </button>

            {pageButtons.map((btn, i) =>
              typeof btn === "number" ? (
                <button
                  key={i}
                  onClick={() => jumpTo(btn)}
                  className={`px-3 py-1 rounded ${
                    btn === currentPage
                      ? "bg-[var(--primary)] text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {btn}
                </button>
              ) : (
                <span key={i} className="px-2 select-none text-gray-400">
                  {btn}
                </span>
              )
            )}

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
            >
              Next ›
            </button>
            <button
              onClick={handleLast}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
            >
              Last »
            </button>
          </div>
        </div>
      )}

      {/* ✅ Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#1f2937] rounded-lg p-6 w-11/12 md:w-3/4 max-h-[90vh] overflow-y-auto space-y-3 relative">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4">{selectedRequest.email}</h2>

            <p>
              <b>Referral Code:</b> {selectedRequest.referralCode || "—"}
            </p>
            <p>
              <b>Commission:</b> {selectedRequest.commission?.toFixed(2) || "—"}
            </p>

            <hr className="my-6 border-gray-700" />
            <h3 className="text-xl font-semibold text-[var(--primary)] mb-4">
              Clients & Trading Stats
            </h3>

            {loadingClients ? (
              <p className="text-gray-400">Loading client data...</p>
            ) : clientConnections.length === 0 ? (
              <p className="text-gray-400">No clients connected to this IB.</p>
            ) : (
              <>
                {/* ✅ Total Clients Count */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-gray-300 text-sm">
                    Total Clients:{" "}
                    <span className="font-semibold text-white">
                      {clientConnections.length}
                    </span>
                  </h3>
                </div>

                {/* ✅ Mobile View (Cards) */}
                <div className="space-y-4 block md:hidden">
                  {clientConnections.map((c, i) => (
                    <div
                      key={i}
                      className="bg-[#111827] border border-gray-700 rounded-lg p-4 space-y-2 hover:bg-[#0d1117] transition"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold text-white">
                          {c.name}
                        </h4>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </div>

                      <div className="text-sm text-gray-300 space-y-1 mt-2">
                        <p>
                          <span className="text-gray-400">Accounts:</span>{" "}
                          {c.accounts.join(", ") || "—"}
                        </p>
                        <p>
                          <span className="text-gray-400">Deposit:</span> $
                          {c.totalDeposit.toFixed(2)}
                        </p>
                        <p>
                          <span className="text-gray-400">Withdrawal:</span> $
                          {c.totalWithdrawal.toFixed(2)}
                        </p>
                        <p>
                          <span className="text-gray-400">Symbols Traded:</span>{" "}
                          {c.symbolLots
                            ? Object.entries(c.symbolLots)
                                .filter(([_, lots]) => Number(lots) > 0)
                                .map(([sym]) => sym)
                                .join(", ")
                            : "—"}
                        </p>
                        <p>
                          <span className="text-gray-400">Lots:</span>{" "}
                          {c.totalLots.toFixed(2)}
                        </p>
                        {/* <p>
                          <span className="text-gray-400">Commission:</span> $
                          {c.totalCommission.toFixed(2)}
                        </p> */}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ✅ Desktop View (Table) */}
                <div className="overflow-x-auto hidden md:block">
                  <table className="w-full text-sm text-left border border-gray-700 rounded-lg">
                    <thead className="bg-[#111827] text-gray-300 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3">Client Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Accounts</th>
                        <th className="px-4 py-3">Deposit ($)</th>
                        <th className="px-4 py-3">Withdrawal ($)</th>
                        <th className="px-4 py-3">Symbols Traded</th>
                        <th className="px-4 py-3">Lots</th>
                        {/* <th className="px-4 py-3">Commission ($)</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {clientConnections.map((c, i) => (
                        <tr
                          key={i}
                          className="border-b border-gray-700 hover:bg-[#0d1117]"
                        >
                          <td className="px-4 py-2">{c.name}</td>
                          <td className="px-4 py-2">{c.email}</td>
                          <td className="px-4 py-2">
                            {c.accounts.join(", ") || "—"}
                          </td>
                          <td className="px-4 py-2">
                            ${c.totalDeposit.toFixed(2)}
                          </td>
                          <td className="px-4 py-2">
                            ${c.totalWithdrawal.toFixed(2)}
                          </td>
                          <td className="px-4 py-2">
                            {c.symbolLots
                              ? Object.entries(c.symbolLots)
                                  .filter(([_, lots]) => Number(lots) > 0)
                                  .map(([sym]) => sym)
                                  .join(", ")
                              : "—"}
                          </td>
                          <td className="px-4 py-2">
                            {c.totalLots.toFixed(2)}
                          </td>
                          {/* <td className="px-4 py-2">
                            ${c.totalCommission.toFixed(2)}
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

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
