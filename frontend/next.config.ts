import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ... other configurations
  async rewrites() {
    return [
      // {
      //   source: '/api/backpack/ticker',
      //   destination: 'https://api.backpack.exchange/api/v1/ticker',
      // },
      // {
      //   source: '/api/backpack/ticker/:path*', // Match /api/backpack/ticker followed by anything
      //   destination: 'https://api.backpack.exchange/api/v1/ticker/:path*',
      // },
      {
        source: '/api/backpack/:path*',
        destination: 'https://api.backpack.exchange/api/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;