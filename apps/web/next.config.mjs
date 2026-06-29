/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['@edubridge/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // The dashboard is the front page — redirect at the framework level so the root
  // route never renders a component (avoids the NEXT_REDIRECT dev-overlay noise).
  async redirects() {
    return [{ source: '/', destination: '/home', permanent: false }];
  },
};

export default nextConfig;
