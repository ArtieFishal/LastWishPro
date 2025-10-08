/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Optimize for static hosting
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : ''
};

module.exports = nextConfig;
