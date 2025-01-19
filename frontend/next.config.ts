import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Change from 'standalone' to static export
  output: "export",

  // React strict mode for development
  reactStrictMode: true,

  // Disable image optimization since we're exporting static files
  images: {
    unoptimized: true,
  },

  // Basic TypeScript checking
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
