'use client';

import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, timeAgo } from '@/lib/utils';
import { useMarkAllRead, useMarkRead, useNotifications } from '@/hooks/use-notifications';

export default function NotificationsPage() {
  const router = useRouter();
  const { data, isLoading } = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const items = data?.data ?? [];

  // Close the page: go back if there's history, otherwise fall back to Home.
  const close = () => {
    if (window.history.length > 1) router.back();
    else router.push('/home');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="flex min-w-0 items-center gap-1.5 text-xl font-bold sm:gap-2 sm:text-2xl">
          <button
            type="button"
            aria-label="Close notifications"
            onClick={close}
            className="grid h-8 w-8 flex-none place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:h-9 sm:w-9"
          >
            <X className="h-5 w-5" strokeWidth={2.4} />
          </button>
          <Bell className="h-5 w-5 flex-none text-primary sm:h-6 sm:w-6" />
          <span className="truncate">Notifications</span>
        </h1>
        <Button variant="outline" size="sm" className="flex-none" onClick={() => markAll.mutate()}>
          <CheckCheck className="h-4 w-4" /> <span className="hidden sm:inline">Mark all read</span>
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : items.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">You&apos;re all caught up 🎉</p>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Card key={n.id} className={cn(!n.isRead && 'border-primary/40 bg-primary/5')}>
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="break-words font-medium">{n.title}</p>
                  {n.body && <p className="break-words text-sm text-muted-foreground">{n.body}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.createdAt)} ago</p>
                </div>
                {!n.isRead && (
                  <Button variant="ghost" size="sm" className="flex-none" onClick={() => markRead.mutate(n.id)}>
                    Mark read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
