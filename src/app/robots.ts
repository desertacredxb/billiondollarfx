import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/lib/blogPublishing";

// Login-only areas (admin panel + client dashboard) and API routes
const PRIVATE_PATHS = [
  "/api/",
  "/login",
  "/register",
  "/admin",
  "/admin-login",
  "/enquiries",
  "/activity-log",
  "/staff-users",
  "/business-report",
  "/verify-identity",
  "/introducing-broker",
  "/support",
  "/Ourplatform",
  "/forex-glossary",
  "/technical-analysis",
  "/indicators",
  "/live-markets-rates",
  "/top-news",
  "/trade-to-win",
  // admin
  "/adminDashboard",
  "/users",
  "/brokers",
  "/tickets",
  "/IB",
  "/all-transactions",
  "/bankapproval",
  "/payout-requests",
  "/blog-management",
  // client dashboard
  "/dashboard",
  "/deposits",
  "/withdrawals",
  "/settings",
  "/live-accounts",
  "/demo-accounts",
  "/transactions",
  "/web-trader",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE_PATHS }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
