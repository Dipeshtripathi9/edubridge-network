const isDev = process.env.NODE_ENV !== 'production';

// Allow-list the API origin (and its WebSocket scheme, for Socket.IO) so the CSP
// doesn't block the app's own data/realtime calls.
let apiOrigin = '';
let apiWsOrigin = '';
try {
  const u = new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1');
  apiOrigin = u.origin;
  apiWsOrigin = u.origin.replace(/^http/, 'ws');
} catch {
  /* leave empty */
}

// Content-Security-Policy — strict, with exactly the sources the app needs:
// - Next.js injects inline bootstrap <script>/<style>, so 'unsafe-inline' is required
//   (nonce-based CSP conflicts with static generation). External scripts are still
//   locked to self + Google, which is the meaningful XSS win.
// - Google OAuth (@react-oauth/google) loads/iframes/connects to accounts.google.com.
// - Dev needs 'unsafe-eval' (React Refresh / HMR); prod does not.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ''} https://accounts.google.com https://apis.google.com`,
  "style-src 'self' 'unsafe-inline' https://accounts.google.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://accounts.google.com ${apiOrigin} ${apiWsOrigin}`.trim(),
  "frame-src 'self' https://accounts.google.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  // Only force-upgrade http→https when the API is actually https (real hosting).
  // Skipping it locally keeps the http://localhost API reachable under a prod build.
  ...(apiOrigin.startsWith('https://') ? ['upgrade-insecure-requests'] : []),
]
  .filter(Boolean)
  .join('; ')
  .replace(/\s+/g, ' ')
  .trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // gzip responses when self-hosting (default true) — smaller transfers on slow links.
  compress: true,
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
  // Baseline security headers on every response, including an allow-listed CSP.
  async headers() {
    const securityHeaders = [
      { key: 'Content-Security-Policy', value: csp },
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
