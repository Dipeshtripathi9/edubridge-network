'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Code2, GraduationCap, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Two scroll-aware floating panels, styled after the Zomato floating UI:
 *  - Connection 1: a white bottom-center pill bar (Home · 99x · Expert Guidance)
 *    with a soft-tinted highlight on the active tab; slides down on scroll-down.
 *  - Connection 2: a solid violet "EZ RentBuddy" pill flush to the right edge that
 *    collapses to just its icon nub on scroll-down and expands back on scroll-up.
 */
const PRIMARY = [
  { href: '/home', label: 'Home', Icon: Home },
  { href: '/startups/99x-developers', label: '99x Developers', Icon: Code2 },
  { href: '/home#get-expert-guidance', label: 'Expert Guidance', Icon: GraduationCap },
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
        // Ignore tiny jitters; collapse when scrolling down past a threshold,
        // reveal as soon as the user scrolls up.
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
    <>
      {/* Connection 1 — bottom center */}
      <div
        className={cn(
          'fixed bottom-4 left-1/2 z-30 -translate-x-1/2 transition-transform duration-300 ease-out motion-reduce:transition-none',
          collapsed ? 'translate-y-[180%]' : 'translate-y-0',
        )}
      >
        <nav
          aria-label="Quick links"
          className="flex items-center gap-0.5 rounded-full border border-border bg-card p-1.5 shadow-xl shadow-black/10"
        >
          {PRIMARY.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-full px-3.5 py-2 transition-colors',
                  active ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                )}
              >
                <Icon className={cn('h-[18px] w-[18px]', active && 'text-primary')} />
                <span className="text-[11px] font-bold leading-none tracking-tight">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Connection 2 — same bottom line as Connection 1, right edge; collapses to its icon nub */}
      <div className="fixed bottom-4 right-0 z-40">
        <Link
          href="/startups/ez-rentbuddy"
          aria-label="EZ RentBuddy — Student Housing"
          className="flex items-center rounded-l-2xl bg-[#16A34A] text-white shadow-xl shadow-[#16A34A]/30 transition-colors hover:bg-[#15803D]"
        >
          <span className="grid h-12 w-12 flex-none place-items-center">
            <Building2 className="h-5 w-5" />
          </span>
          <span
            className={cn(
              'overflow-hidden transition-[max-width,opacity] duration-300 ease-out motion-reduce:transition-none',
              collapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100',
            )}
          >
            <span className="flex flex-col whitespace-nowrap pr-4 leading-tight">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[1.4px] text-[#DCFCE7]">
                Student Housing
              </span>
              <span className="font-display text-sm font-bold tracking-tight">EZ RentBuddy</span>
            </span>
          </span>
        </Link>
      </div>
    </>
  );
}
