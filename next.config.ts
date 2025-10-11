import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure the output directory is correct
  distDir: 'out',
  // Optimize for static hosting
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Handle external packages for static export
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        util: false,
        buffer: false,
        process: false,
      };
    }
    return config;
  },
  transpilePackages: [
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-wallets',
    '@cosmos-kit/react',
    '@cosmos-kit/keplr'
  ]
};

export default nextConfig;
