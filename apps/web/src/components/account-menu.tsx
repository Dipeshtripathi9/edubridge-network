'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  ChevronDown,
  CircleUserRound,
  GraduationCap,
  Inbox,
  LogOut,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { VerifiedBadge } from '@/components/verified-badge';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/hooks/use-auth';
import { useMe } from '@/hooks/use-profile';
import { useUnreadCount } from '@/hooks/use-notifications';

function firstNameOf(full?: string | null) {
  return (full ?? 'Student').trim().split(/\s+/)[0];
}

export function AccountMenu() {
  const logout = useLogout();
  const router = useRouter();
  const pathname = usePathname();
  const { data: me } = useMe();
  const { data: unread } = useUnreadCount();
  const loggedIn = useAuthStore((s) => !!s.accessToken);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const verified = me?.profile?.collegeVerification === 'VERIFIED';
  const count = loggedIn ? unread?.count ?? 0 : 0;
  const firstName = firstNameOf(me?.profile?.fullName);

  useEffect(() => setMounted(true), []);
  // Close the drawer on route change.
  useEffect(() => setOpen(false), [pathname]);
  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const items = [
    { label: 'Inbox', href: '/messages', icon: Inbox, show: true },
    { label: 'Notifications', href: '/notifications', icon: Bell, show: true, badge: count },
    { label: 'Find colleges', href: '/colleges', icon: Search, show: true },
    { label: 'Get verified', href: '/verify', icon: ShieldCheck, show: !verified, accent: true },
  ].filter((i) => i.show);

  const drawer = (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <aside className="animate-slide-in-right absolute right-0 top-0 flex h-full w-80 max-w-[86%] flex-col border-l border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          {loggedIn ? (
            <div className="flex min-w-0 items-center gap-3">
              <Avatar src={me?.profile?.avatarUrl} name={me?.profile?.fullName} className="h-10 w-10 text-sm" />
              <div className="min-w-0">
                <p className="flex items-center gap-1 truncate font-bold leading-tight">
                  {me?.profile?.fullName ?? 'Student'}
                  {verified && <VerifiedBadge size="xs" />}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {verified && me?.profile?.college?.name ? me.profile.college.name : 'EduBridge Network'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="font-display font-bold tracking-tight">EduBridge Network</span>
            </div>
          )}
          <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {loggedIn ? (
          <>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {items.map((it) => {
                const Icon = it.icon;
                return (
                  <button
                    key={it.label}
                    onClick={() => go(it.href)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold transition-colors',
                      it.accent
                        ? 'bg-accent text-primary hover:bg-primary hover:text-primary-foreground'
                        : 'text-foreground hover:bg-accent',
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] flex-none" />
                    <span className="flex-1 text-left">{it.label}</span>
                    {'badge' in it && (it.badge ?? 0) > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1.5 text-[11px] font-bold text-destructive-foreground">
                        {it.badge! > 9 ? '9+' : it.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-border p-3">
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <LogOut className="h-[18px] w-[18px] flex-none" /> Log out
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col gap-4 p-5">
            <p className="text-[15px] text-muted-foreground">
              Sign in to save colleges, get verified and message mentors.
            </p>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild className="flex-1" onClick={() => setOpen(false)}>
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Account menu"
        className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-1 text-foreground transition-colors hover:bg-accent sm:pr-2.5"
      >
        <span className="relative grid place-items-center">
          <CircleUserRound className="h-8 w-8" strokeWidth={1.7} />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-background bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </span>
        {loggedIn && (
          <>
            <span className="hidden max-w-[110px] truncate text-[15px] font-bold sm:block">{firstName}</span>
            <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" strokeWidth={2.4} />
          </>
        )}
      </button>
      {open && mounted && createPortal(drawer, document.body)}
    </>
  );
}
