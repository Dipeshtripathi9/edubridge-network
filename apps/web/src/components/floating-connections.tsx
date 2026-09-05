'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Bottom floating row (Zomato-style), mobile/tablet-portrait only — desktop
 * already has the sidebar nav via the hamburger menu, and the bar would
 * otherwise overlap page content at wider viewports. A stadium segmented
 * control (icon-over-label); the active segment gets a full-height inner
 * capsule end-cap and its icon/label emphasise. On scroll-down the bar
 * slides down; it returns on scroll-up.
 */
// grow weights (their original relative ratio) give Compare ~57% of the row
// and Home ~43%, rather than an even 50/50 split.
const PRIMARY = [
  { href: '/home', label: 'Home', Icon: Home, grow: 'grow-[16]' },
  { href: '/reviews', label: 'Compare', Icon: GraduationCap, grow: 'grow-[21]' },
];

export function FloatingConnections() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const lastY = useRef(0);

  useLayoutEffect(() => {
    // Very short viewports (e.g. in-app browser chrome eating vertical space)
    // can fit enough content above the fold to sit under the bar before the
    // user ever scrolls — start collapsed there so nothing is covered at load.
    if (window.innerHeight < 700) setCollapsed(true);
  }, []);

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
          if (delta > 0 && y > 24) setCollapsed(true);
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
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex items-stretch gap-2 px-2.5 md:hidden">
      <nav
        aria-label="Quick links"
        className={cn(
          'pointer-events-auto flex h-[60px] w-full items-stretch gap-1.5 rounded-full bg-card p-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.10)] transition-transform duration-[600ms] ease-out motion-reduce:transition-none',
          collapsed ? 'translate-y-[220%]' : 'translate-y-0',
        )}
      >
        {PRIMARY.map(({ href, label, Icon, grow }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              title={label}
              className={cn(
                'flex min-w-0 basis-0 flex-col items-center justify-center gap-1 rounded-full transition-colors',
                grow,
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
    </div>
  );
}
