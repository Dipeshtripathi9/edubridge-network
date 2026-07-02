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
  // Baseline security headers on every response. (No strict CSP — it would need
  // per-source allow-listing for Google OAuth; these cover the high-value hardening.)
  async headers() {
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ];
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
