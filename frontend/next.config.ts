import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  images: {
    domains: [
      "localhost", 
      "backend-app.railway.app",
      "your-backend-app.railway.app"  // actual Railway URL
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;