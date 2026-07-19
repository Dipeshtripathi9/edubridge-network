'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, timeAgo } from '@/lib/utils';
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useUnreadCount,
  type Notification,
} from '@/hooks/use-notifications';

function deeplink(n: Notification): string | null {
  if (n.data?.link) return n.data.link;
  if (n.data?.chatId) return '/messages';
  return null;
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: unread } = useUnreadCount();
  const { data, isLoading } = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const count = unread?.count ?? 0;
  const items = data?.data ?? [];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const onItem = (n: Notification) => {
    if (!n.isRead) markRead.mutate(n.id);
    const link = deeplink(n);
    setOpen(false);
    if (link) router.push(link);
  };

  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size="icon" aria-label="Notifications" onClick={() => setOpen((v) => !v)}>
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border p-3">
            <p className="font-semibold">Notifications</p>
            {count > 0 && (
              <button
                onClick={() => markAll.mutate()}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="p-6 text-center text-sm text-muted-foreground">Loading…</p>
            ) : items.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">You&apos;re all caught up 🎉</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => onItem(n)}
                  className={cn(
                    'flex w-full flex-col items-start gap-0.5 border-b border-border p-3 text-left transition-colors hover:bg-accent',
                    !n.isRead && 'bg-primary/5',
                  )}
                >
                  <span className="flex w-full items-center justify-between">
                    <span className="text-sm font-medium">{n.title}</span>
                    {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </span>
                  {n.body && <span className="line-clamp-2 text-xs text-muted-foreground">{n.body}</span>}
                  <span className="text-[10px] text-muted-foreground">{timeAgo(n.createdAt)} ago</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
