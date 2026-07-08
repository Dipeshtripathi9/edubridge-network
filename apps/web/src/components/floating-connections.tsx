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
    // One bottom row so the bar and pill each keep their own space and never
    // overlap: the bar auto-centres in the space left of the pill; the pill stays
    // flush to the right edge. Container ignores pointer events so the empty
    // middle never blocks the page underneath.
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex items-center gap-2 pl-3">
      {/* Connection 1 — auto-centred bar */}
      <nav
        aria-label="Quick links"
        className={cn(
          'pointer-events-auto mx-auto flex items-center gap-0.5 rounded-full border border-border bg-card p-1.5 shadow-xl shadow-black/10 transition-transform duration-300 ease-out motion-reduce:transition-none',
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
                'flex flex-col items-center gap-1 rounded-full px-3.5 py-2 transition-colors',
                active ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
              )}
            >
              <Icon className={cn('h-[18px] w-[18px]', active && 'text-primary')} />
              <span className="hidden text-[11px] font-bold leading-none tracking-tight sm:block">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Connection 2 — flush right on the same line; collapses to its icon nub */}
      <Link
        href="/startups/ez-rentbuddy"
        aria-label="EZ RentBuddy — Student Housing"
        className="pointer-events-auto flex flex-none items-center rounded-l-2xl bg-[#16A34A] text-white shadow-xl shadow-[#16A34A]/30 transition-colors hover:bg-[#15803D]"
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
  );
}
