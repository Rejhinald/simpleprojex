import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'simpleprojexbucket.s3.amazonaws.com'
      },
      {
        protocol: 'https',
        hostname: 'placehold.co'
      },
    ],
  },
};

export default nextConfig;
