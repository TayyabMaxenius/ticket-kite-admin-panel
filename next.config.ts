import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ticketkite.com",
      },
      {
        protocol: "https",
        hostname: "www.ticketkite.com",
      },
      {
        protocol: "https",
        // Allow Supabase storage bucket host (any project)
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
