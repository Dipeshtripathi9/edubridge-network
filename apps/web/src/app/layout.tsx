import type { Metadata, Viewport } from 'next';
import { Hanken_Grotesk, Bricolage_Grotesque } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/providers/theme-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ServiceWorkerRegister } from '@/components/sw-register';
import { OfflineBanner } from '@/components/offline-banner';
import './globals.css';

const hanken = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

// Origin of the API, used to preconnect so the first data request on a slow /
// high-latency connection doesn't pay for DNS + TCP + TLS setup up front.
const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1').origin;
  } catch {
    return null;
  }
})();

export const metadata: Metadata = {
  title: 'EduBridge Network — Your Future, Our Network',
  description:
    'For students already in college: transfers, scholarships, internships, reviews, and more.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: { capable: true, title: 'EduBridge', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  themeColor: '#4f46e5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {apiOrigin && (
          <>
            <link rel="preconnect" href={apiOrigin} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={apiOrigin} />
          </>
        )}
      </head>
      <body className={`${hanken.variable} ${bricolage.variable} font-sans`}>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster richColors position="top-center" />
            <OfflineBanner />
          </QueryProvider>
        </ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
