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
          "https://www.metatrader5.com/en/download",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
