import { authenticatedFetch } from "./apiClient";

export interface IBApplication {
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
  statusReason?: string;
  approvalProvider?: "manual" | "veriff";
}

export async function loadIBRequests(fetcher = authenticatedFetch): Promise<IBApplication[]> {
  const res = await fetcher(`${process.env.NEXT_PUBLIC_API_BASE}/api/ib`);
  if (!res.ok) throw new Error(res.status === 401 ? "Your administrator session has expired. Sign in again." : "Unable to load IB requests. Please retry.");
  const data: unknown = await res.json();
  if (!Array.isArray(data) || !data.every(row => row && typeof row === "object" && typeof row.email === "string" && typeof row._id === "string" && ["pending", "approved", "rejected"].includes(row.status))) {
    throw new Error("Unable to read the IB application list. Please retry.");
  }
  return data.map(row => ({ ...row, commission: row.commission != null && row.commission !== "" && Number.isFinite(Number(row.commission)) ? Number(row.commission) : undefined }));
}
