import type { NextConfig } from "next";

const nextConfig: NextConfig = {  
  reactStrictMode: false,

  images: {
    unoptimized: true,
  },

  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;