import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["winprofx.com", "www.svgrepo.com", "res.cloudinary.com"],
  },

  async headers() {
    const privatePaths = ["api/:path*", "admin", "admin-login", "adminDashboard", "users", "brokers", "tickets", "IB", "all-transactions", "bankapproval", "payout-requests", "blog-management/:path*", "enquiries", "activity-log", "staff-users", "business-report", "login", "register", "verify-identity", "dashboard", "deposits", "withdrawals", "settings", "live-accounts", "demo-accounts", "transactions", "web-trader", "introducing-broker", "support", "Ourplatform", "forex-glossary", "technical-analysis", "indicators", "live-markets-rates", "top-news"];
    return privatePaths.map(path => ({ source: `/${path}`, headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }));
  },
  async redirects() {
    return [
      { source: "/blog", destination: "/blogs", permanent: true },
      { source: "/blog/:slug", destination: "/blogs/:slug", permanent: true },
      { source: "/admin", destination: "/admin-login", permanent: false },
      { source: "/admin/login", destination: "/admin-login", permanent: false },
      { source: "/admin/dashboard", destination: "/adminDashboard", permanent: false },
      { source: "/admin-dashboard", destination: "/adminDashboard", permanent: false },
      {
        source: "/mt5-download-secure",
        destination:
          "https://www.metatrader5.com/en/download",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
