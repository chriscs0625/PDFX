import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configured correctly 
  serverExternalPackages: ["@react-pdf/renderer"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
