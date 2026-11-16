import type { NextConfig } from "next";

// `STATIC_EXPORT=1 next build` writes a plain static site to `out/`, which is
// what gets deployed to Cloudflare (see wrangler.jsonc). Static export does not
// support partial prerendering or config redirects, so those are switched off
// for that build; the /tenant redirect is served from `public/_redirects`.
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  cacheComponents: !staticExport,
  partialPrefetching: !staticExport,
  typedRoutes: true,
  poweredByHeader: false,
  ...(staticExport
    ? { output: "export", trailingSlash: false }
    : {
        async redirects() {
          return [
            // /tenant has no screen of its own; it opens on web analytics.
            { source: "/tenant", destination: "/tenant/web", permanent: false },
          ];
        },
      }),
};

export default nextConfig;
