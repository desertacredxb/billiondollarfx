import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["winprofx.com", "www.svgrepo.com", "res.cloudinary.com"],
  },

  async redirects() {
    return [
      {
        source: "/mt5-download-secure",
        destination:
          "https://download.mql5.com/cdn/web/ascends.global.markets/mt5/ascendsglobalmarkets5setup.exe",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;