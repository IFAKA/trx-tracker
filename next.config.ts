import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@traindaily/core', '@traindaily/ui'],
};

export default nextConfig;
