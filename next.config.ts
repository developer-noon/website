import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  serverExternalPackages: ['@react-pdf/renderer'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;