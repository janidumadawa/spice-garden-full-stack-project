// frontend/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env:{
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  images: {
    domains: ["localhost", "backend-app.railway.app"], //  backend domain here
    qualities: [75, 90, 100],
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;