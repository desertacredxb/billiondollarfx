import axios from "axios";

export { AxiosError } from "axios";

const adminPaths = new Set(["adminDashboard", "users", "bankapproval", "brokers", "tickets", "IB", "payout-requests", "all-transactions", "blog-management", "enquiries", "staff-users", "activity-log", "business-report", "chat-reports", "email-marketing", "website-analytics"]);

function tokenFor(url: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const target = new URL(url, window.location.origin);
    const backend = process.env.NEXT_PUBLIC_API_BASE;
    const allowed = target.origin === window.location.origin || (backend && target.origin === new URL(backend).origin);
    if (!allowed || !target.pathname.startsWith("/api/")) return null;
    const admin = adminPaths.has(window.location.pathname.split("/")[1]);
    return localStorage.getItem(admin ? "adminToken" : "token");
  } catch { return null; }
}

const client = axios.create();
client.interceptors.request.use(config => {
  const token = tokenFor(config.url || "");
  if (token && !config.headers.has("Authorization")) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

export const api = Object.assign(client, { isAxiosError: axios.isAxiosError });
export default api;

export function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const headers = new Headers(input instanceof Request ? input.headers : undefined);
  new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  const token = tokenFor(url);
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
