'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Topbar } from '@/components/topbar';
import { VerifyBanner } from '@/components/verify-banner';
import { AdminCatalogPanel } from '@/components/admin/admin-catalog-panel';

// Code-split: pulls in socket.io-client, which most page views never need
// (only the notification bell does) — loading it off the main bundle keeps
// the shared chunk every authenticated page pays for smaller.
const NotificationStream = dynamic(
  () => import('@/components/notification-stream').then((m) => m.NotificationStream),
  { ssr: false },
);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hydrated = useAuthStore((s) => s.hydrated);

  // The app is browseable by guests — no login redirect here. Individual actions
  // (join, get expert guidance, save, apply…) prompt sign-in when needed.
  if (!hydrated) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <NotificationStream />
      <Topbar />
      <VerifyBanner />
      <main key={pathname} className="animate-page flex-1 p-4 md:p-6">
        {children}
      </main>
      <AdminCatalogPanel />
    </div>
  );
}
