'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { MobileNav } from '@/components/mobile-nav';
import { NotificationBell } from '@/components/notification-bell';
import { useLogout } from '@/hooks/use-auth';
import { useMe } from '@/hooks/use-profile';

export function Topbar() {
  const logout = useLogout();
  const { data: me } = useMe();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <MobileNav />
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
