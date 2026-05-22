import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@marcapagina/shared', '@marcapagina/data'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'books.google.com',
      },
    ],
  },
};

export default nextConfig;
