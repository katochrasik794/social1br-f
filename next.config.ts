import type { NextConfig } from "next";

const backendUrl = (
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5001"
).replace(/\/api\/?$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
      { source: "/uploads/:path*", destination: `${backendUrl}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
