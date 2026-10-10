import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /** One permanent canonical host: the apex redirects to www (the hosting platform's domain settings should do the same). */
  async redirects() {
    return [{ source: "/:path*", has: [{ type: "host", value: "kuspurban.com" }], destination: "https://www.kuspurban.com/:path*", permanent: true }];
  },
  turbopack: {
    // `three` is only loaded by the lazy 3D scene chunk; this keeps that chunk to the classes it uses.
    resolveAlias: { three: "./src/components/three/three-lite.ts" },
  },
};

export default nextConfig;
