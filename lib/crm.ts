import api from "./apiClient";

export const crmApi = process.env.NEXT_PUBLIC_API_BASE + "/api/crm";
export const OUTCOME_LABELS = {
  no_answer: "No answer",
  busy: "Busy",
  wrong_number: "Wrong number",
  number_not_in_use: "Number not in use",
  connected: "Connected",
  not_interested: "Not interested",
  qualified: "Interested",
  do_not_call: "Do not call",
};
export const STATUS_LABELS: Record<string, string> = {
  new: "New",
  follow_up: "Callback",
  worked: "Attempted",
  qualified: "Interested",
  closed: "Closed",
};

export const LEAD_LISTS = {
  registrations: "Website registrations",
  follow_ups: "Follow-ups",
  interested: "Interested",
  account_opened: "Account opened",
  purchased: "Purchased data",
  number_not_in_use: "Number not in use",
} as const;
export const fieldClass = "w-full rounded-lg border border-slate-600 bg-[#0b1423] px-3 py-2 text-sm text-white";
export const buttonClass = "rounded-lg bg-[#d6b659] px-4 py-2 text-sm font-semibold text-black hover:bg-[#e8cc80] disabled:opacity-50";
export const secondaryClass = "rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-100 hover:border-[#d6b659] disabled:opacity-50";
export const cardClass = "rounded-xl border border-slate-700 bg-[#101827] p-4 sm:p-5";

export type Agent = {
  id: string;
  name: string;
  hashmiId: string;
  ready: number;
  logged: number;
  verified: number;
  connected: number;
  talkSeconds: number;
};

export type Overview = {
  day: string;
  target: number;
  owner: boolean;
  bank: number | null;
  pending: number | null;
  agents: Agent[];
  dialerMode: "unconfigured" | "developer" | "live";
  reportEnabled: boolean;
};

export type Lead = {
  id: string;
  leadId: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  assignedTo: string | null;
  assignmentPending: boolean;
  originalAgent: string;
  status: string;
  followUpAt: string | null;
  note: string;
  registeredAt?: string;
  accountOpened?: boolean;
  outcome?: keyof typeof OUTCOME_LABELS;
  client?: { id: string; name: string; registeredAt: string; kycApproved: boolean; firstDeposit: boolean };
};

export type LeadPage = { rows: Lead[]; total: number; page: number; limit: number };

export function crmError(error: unknown, fallback: string) {
  return api.isAxiosError(error) && typeof error.response?.data?.message === "string"
    ? error.response.data.message : error instanceof Error && !api.isAxiosError(error) ? error.message : fallback;
}

export function dubaiDate() {
  return new Date(Date.now() + 4 * 3_600_000).toISOString().slice(0, 10);
}

export function dubaiTime(time: string) {
  return new Date(time).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dubai" });
}
