/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Disable server-side features for static export
  experimental: {
    esmExternals: false
  },
  // Ensure all pages are statically generated
  generateStaticParams: true,
  // Disable server-side rendering
  ssr: false,
  // Optimize for static hosting
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Enable static optimization
  swcMinify: true,
  // Disable telemetry
  telemetry: false
};

module.exports = nextConfig;

