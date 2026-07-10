'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CircleUserRound } from 'lucide-react';
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

  // Logged-in menu: Find colleges · Notifications · Get verified (only if not
  // yet verified) — Log out sits in its own footer group.
  const items = [
    { label: 'Find colleges', href: '/colleges', badge: 0, show: true, accent: false },
    { label: 'Notifications', href: '/notifications', badge: count, show: true, accent: false },
    { label: 'Get verified', href: '/verify', badge: 0, show: !verified, accent: true },
  ].filter((i) => i.show);

  const drawer = (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <aside className="animate-slide-in-right absolute right-0 top-0 flex h-full w-[192px] max-w-[62%] flex-col border-l border-border bg-card shadow-2xl">
        {/* Member identity header (registered users see their name + tick);
            no branding or close button for guests — tap outside to dismiss. */}
        {loggedIn && (
          <div className="flex items-center border-b border-border px-5 py-4">
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
          </div>
        )}

        {loggedIn ? (
          <>
            <nav className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
              {items.map((it) => (
                <button
                  key={it.label}
                  onClick={() => go(it.href)}
                  className={cn(
                    'flex items-center justify-end gap-2.5 rounded-lg px-3 py-3.5 text-[17px] font-bold transition-colors',
                    it.accent ? 'text-primary hover:text-primary/80' : 'text-foreground hover:text-primary',
                  )}
                >
                  {it.badge > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1.5 text-[11px] font-bold text-destructive-foreground">
                      {it.badge > 9 ? '9+' : it.badge}
                    </span>
                  )}
                  {it.label}
                </button>
              ))}
            </nav>
            <div className="border-t border-border px-5 py-4">
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="flex w-full items-center justify-end rounded-lg px-3 py-3.5 text-[17px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                Log out
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col px-5 py-4">
            <button
              onClick={() => go('/colleges')}
              className="flex items-center justify-end rounded-lg px-3 py-3.5 text-[17px] font-bold text-foreground transition-colors hover:text-primary"
            >
              Find my college
            </button>
            <div className="my-3 border-t border-border" />
            <div className="flex flex-col gap-3 px-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-full bg-accent px-5 py-3 text-center text-[15px] font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="rounded-full bg-accent px-5 py-3 text-center text-[15px] font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Sign up
              </Link>
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
          <span className="hidden max-w-[110px] truncate text-[15px] font-bold sm:block">{firstName}</span>
        )}
      </button>
      {open && mounted && createPortal(drawer, document.body)}
    </>
  );
}
