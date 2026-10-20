export const managerPermissions = {
  clients: "Clients and KYC",
  partners: "IB partners and commissions",
  finance: "Deposits, payouts and balances",
  support: "Support tickets",
  enquiries: "Contact enquiries",
  content: "Blog publishing",
  reports: "Business reports",
} as const;
export type AdminPermission = keyof typeof managerPermissions;
export interface AdminSession { email: string; fullName: string; role: "owner" | "manager"; permissions: AdminPermission[] }
const routes: Record<string, AdminPermission | "owner"> = {
  adminDashboard: "reports", "business-report": "reports", users: "clients", bankapproval: "finance", brokers: "partners", tickets: "support", IB: "partners", "payout-requests": "finance", "all-transactions": "finance", "blog-management": "content", enquiries: "enquiries", "staff-users": "owner", "activity-log": "owner",
};
export function canAccessAdminPath(session: AdminSession, path: string) {
  if (session.role === "owner") return true;
  const permission = routes[path.split("/")[1]];
  return !!permission && permission !== "owner" && session.permissions.includes(permission);
}
export function adminHome(session: AdminSession) {
  if (session.role === "owner") return "/adminDashboard";
  return Object.keys(routes).map(path => `/${path}`).find(path => canAccessAdminPath(session, path)) || "/admin-login";
}
