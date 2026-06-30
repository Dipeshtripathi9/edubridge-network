'use client';

import Link from 'next/link';
import { GraduationCap, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { MobileNav } from '@/components/mobile-nav';
import { NotificationBell } from '@/components/notification-bell';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/hooks/use-auth';
import { useMe } from '@/hooks/use-profile';

export function Topbar() {
  const logout = useLogout();
  const { data: me } = useMe();
  const loggedIn = useAuthStore((s) => !!s.accessToken);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <MobileNav />
      {/* Brand — shown on mobile, where the sidebar (with the logo) is hidden. */}
      <Link href="/home" className="flex min-w-0 items-center gap-2 md:hidden">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="h-4 w-4" />
        </span>
        <span className="truncate text-base font-bold tracking-tight">EduBridge Network</span>
      </Link>
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        {loggedIn ? (
          <>
            <NotificationBell />
            <div className="ml-2 flex items-center gap-2">
              <Avatar src={me?.profile?.avatarUrl} name={me?.profile?.fullName} />
              <div className="hidden text-sm leading-tight lg:block">
                <p className="font-medium">{me?.profile?.fullName ?? 'Student'}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" aria-label="Logout" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <div className="ml-2 flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
