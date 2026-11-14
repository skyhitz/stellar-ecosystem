import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  typedRoutes: true,
  poweredByHeader: false,
  async redirects() {
    return [
      // /tenant has no screen of its own; it opens on web analytics.
      { source: "/tenant", destination: "/tenant/web", permanent: false },
    ];
  },
};

export default nextConfig;
