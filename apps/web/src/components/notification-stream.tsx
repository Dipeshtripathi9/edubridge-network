'use client';

import { useNotificationStream } from '@/hooks/use-notifications';

// Split into its own component (loaded via next/dynamic in the app layout)
// so socket.io-client doesn't ship in the shared bundle every authenticated
// page pays for — most page views never touch a notification.
export function NotificationStream() {
  useNotificationStream();
  return null;
}
