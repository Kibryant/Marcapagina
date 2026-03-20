import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@marcapagina/shared'],
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
