'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

// Low-internet UX: when the device goes offline the app keeps working from the
// persisted React Query cache (localStorage). This banner just tells the user
// what's happening so stale/cached content doesn't feel like a bug.
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (!offline) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-amber-950"
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      You&apos;re offline — showing saved content. Changes will sync when you&apos;re back online.
    </div>
  );
}
