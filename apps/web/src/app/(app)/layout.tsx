'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Topbar } from '@/components/topbar';
import { VerifyBanner } from '@/components/verify-banner';
import { FloatingConnections } from '@/components/floating-connections';
import { useNotificationStream } from '@/hooks/use-notifications';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hydrated = useAuthStore((s) => s.hydrated);

  useNotificationStream();

  // The app is browseable by guests — no login redirect here. Individual actions
  // (join, get expert guidance, save, apply…) prompt sign-in when needed.
  if (!hydrated) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar />
      <VerifyBanner />
      <main key={pathname} className="animate-page flex-1 p-4 md:p-6">
        {children}
      </main>
      <FloatingConnections />
    </div>
  );
}
