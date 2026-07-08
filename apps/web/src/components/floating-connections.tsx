'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Code2, GraduationCap, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Two scroll-aware floating panels (Zomato / Google-Maps style):
 *  - Connection 1: a bottom-center pill bar (Home · 99x · Expert Guidance) that
 *    slides down out of view on scroll-down and back up on scroll-up.
 *  - Connection 2: a right-edge "EZ RentBuddy" tab that slides half off-screen on
 *    scroll-down (still tappable) and fully back in on scroll-up.
 */
const PRIMARY = [
  { href: '/home', label: 'Home', desc: 'Homepage', Icon: Home },
  { href: '/startups/99x-developers', label: '99x Developers', desc: 'Website Development', Icon: Code2 },
  { href: '/home#get-expert-guidance', label: 'Expert Guidance', desc: 'College Selection', Icon: GraduationCap },
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
          className="flex items-center gap-0.5 rounded-full border border-border bg-card/95 p-1.5 shadow-xl shadow-black/10 backdrop-blur"
        >
          {PRIMARY.map(({ href, label, desc, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                title={`${label} — ${desc}`}
                className={cn(
                  'group flex items-center gap-2.5 rounded-full px-3 py-2 transition-colors',
                  active ? 'bg-accent' : 'hover:bg-accent',
                )}
              >
                <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex flex-col text-left leading-tight">
                  <span className="text-[13px] font-bold tracking-tight">{label}</span>
                  <span className="hidden text-[10px] font-medium text-muted-foreground sm:block">{desc}</span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Connection 2 — right edge */}
      <div
        className={cn(
          'fixed right-0 top-1/2 z-30 -translate-y-1/2 transition-transform duration-300 ease-out motion-reduce:transition-none',
          collapsed ? 'translate-x-1/2' : 'translate-x-0',
        )}
      >
        <Link
          href="/startups/ez-rentbuddy"
          aria-label="EZ RentBuddy — Student Housing"
          className="flex items-center gap-2.5 rounded-l-2xl border border-r-0 border-border bg-card py-3 pl-3.5 pr-4 shadow-xl shadow-black/10 transition-shadow hover:shadow-2xl"
        >
          <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-marigold-soft text-amber-600">
            <Building2 className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-[1.4px] text-muted-foreground">
              Student Housing
            </span>
            <span className="font-display text-sm font-bold tracking-tight">EZ RentBuddy</span>
          </span>
        </Link>
      </div>
    </>
  );
}
