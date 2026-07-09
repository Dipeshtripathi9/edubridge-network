'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, GraduationCap, Home, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Bottom floating row (Zomato-style), split ~66% / ~34% on one line:
 *  - Connection 1: a stadium segmented control (icon-over-label). The active
 *    segment gets a full-height inner capsule end-cap; its icon/label emphasise.
 *  - Connection 2: a standalone emerald "EZ RentBuddy ↗" launcher capsule of the
 *    same height/radius that bleeds off the right edge (a deliberate peek).
 * On scroll-down the bar slides down and the launcher slides right at the same
 * speed; both return on scroll-up.
 */
const PRIMARY = [
  { href: '/home', label: 'Home', Icon: Home },
  { href: '/communities', label: 'Communities', Icon: Users },
  { href: '/reviews', label: 'Compare', Icon: GraduationCap },
];

export function FloatingConnections() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;
        if (Math.abs(delta) > 6) {
          if (delta > 0 && y > 80) setCollapsed(true);
          else if (delta < 0) setCollapsed(false);
          lastY.current = y;
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Keep chat surfaces (DMs and pool group chats) clear of floating overlays.
  if (pathname.startsWith('/messages') || pathname.startsWith('/pools')) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex items-stretch gap-2 overflow-x-clip pl-2.5">
      {/* Connection 1 — segmented control (takes the remaining width) */}
      <nav
        aria-label="Quick links"
        className={cn(
          'pointer-events-auto flex h-[60px] min-w-0 basis-0 grow-[72] items-stretch gap-1.5 rounded-full bg-card p-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.10)] transition-transform duration-500 ease-out motion-reduce:transition-none',
          collapsed ? 'translate-y-[220%]' : 'translate-y-0',
        )}
      >
        {PRIMARY.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              title={label}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 rounded-full transition-colors',
                active ? 'bg-accent text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.6 : 2} fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.14 : 0} />
              <span className={cn('max-w-full truncate whitespace-nowrap px-1 text-[11px] leading-none tracking-tight', active ? 'font-bold' : 'font-medium')}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Connection 2 — standalone launcher, full wordmark always visible */}
      <Link
        href="/startups/ez-rentbuddy"
        aria-label="EZ RentBuddy"
        style={{
          backgroundColor: '#CF55A3',
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.16), rgba(0,0,0,0.05))',
        }}
        className={cn(
          'pointer-events-auto flex h-[46px] min-w-0 basis-0 grow-[28] items-center justify-center gap-1 self-center overflow-hidden rounded-l-full px-2 text-white shadow-[0_6px_18px_rgba(207,85,163,0.42)] transition-transform duration-300 ease-out motion-reduce:transition-none hover:brightness-95',
          collapsed ? 'translate-x-[130%]' : 'translate-x-0',
        )}
      >
        <span className="whitespace-nowrap font-display text-[9.5px] font-extrabold tracking-tight">EZ RentBuddy</span>
        <ArrowUpRight className="h-3 w-3 flex-none" strokeWidth={2.6} />
      </Link>
    </div>
  );
}
