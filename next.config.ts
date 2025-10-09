import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Ensure the output directory is correct
  distDir: 'out',
  // Optimize for static hosting
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : ''
};

export default nextConfig;
