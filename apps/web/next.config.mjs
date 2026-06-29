/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['@edubridge/shared'],
  // Hide the dev-only "Static route / Dynamic route" indicator badge.
  devIndicators: {
    appIsrStatus: false,
  },
  // Smaller JS bundles on slow connections: tree-shake the icon barrel.
  // (framer-motion is intentionally excluded — its internals break the optimizer.)
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    // Serve modern, smaller formats and cache aggressively.
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
  },
  // The dashboard is the front page — redirect at the framework level so the root
  // route never renders a component (avoids the NEXT_REDIRECT dev-overlay noise).
  async redirects() {
    return [{ source: '/', destination: '/home', permanent: false }];
  },
};

export default nextConfig;
