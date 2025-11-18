import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [],
  },
  /* config options here */
  webpack(config) {
    config.externals = config.externals || [];
    config.externals.push("translation-widget"); // never SSR this package
    return config;
  }
};

export default nextConfig;
