'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { useNotificationStream } from '@/hooks/use-notifications';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hydrated = useAuthStore((s) => s.hydrated);

  useNotificationStream();

  // The app is browseable by guests — no login redirect here. Individual actions
  // (join, get expert guidance, save, apply…) prompt sign-in when needed.
  if (!hydrated) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main key={pathname} className="animate-page flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
