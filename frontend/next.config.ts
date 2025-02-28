import type { NextConfig } from "next";

const nextConfig: NextConfig = {  
  reactStrictMode: false,

  images: {
    unoptimized: false,
  },

  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;