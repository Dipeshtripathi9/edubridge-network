'use client';

import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { MobileNav } from '@/components/mobile-nav';
import { NotificationBell } from '@/components/notification-bell';
import { VerifiedBadge } from '@/components/verified-badge';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/hooks/use-auth';
import { useMe } from '@/hooks/use-profile';

export function Topbar() {
  const logout = useLogout();
  const { data: me } = useMe();
  const loggedIn = useAuthStore((s) => !!s.accessToken);
  const verified = me?.profile?.collegeVerification === 'VERIFIED';

  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/70 px-4 md:px-6">
      <MobileNav />
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        {loggedIn ? (
          <>
            <NotificationBell />
            <div className="ml-2 flex items-center gap-2">
              <Avatar src={me?.profile?.avatarUrl} name={me?.profile?.fullName} />
              <div className="hidden text-sm leading-tight lg:block">
                <p className="flex items-center gap-1 font-medium">
                  {me?.profile?.fullName ?? 'Student'}
                  {verified && <VerifiedBadge />}
                </p>
                {verified && me?.profile?.college?.name && (
                  <p className="text-xs text-muted-foreground">{me.profile.college.name}</p>
                )}
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
