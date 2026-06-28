'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationBell } from '@/components/notification-bell';
import { useLogout } from '@/hooks/use-auth';
import { useMe } from '@/hooks/use-profile';

export function Topbar() {
  const logout = useLogout();
  const router = useRouter();
  const { data: me } = useMe();
  const [q, setQ] = useState('');

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <form
        className="relative hidden max-w-md flex-1 sm:block"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search colleges, communities, opportunities…"
          className="pl-9"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </form>
      <div className="ml-auto flex items-center gap-1">
        <NotificationBell />
        <ThemeToggle />
        <div className="ml-2 flex items-center gap-2">
          <Avatar src={me?.profile?.avatarUrl} name={me?.profile?.fullName} />
          <div className="hidden text-sm leading-tight lg:block">
            <p className="font-medium">{me?.profile?.fullName ?? 'Student'}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" aria-label="Logout" onClick={logout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
