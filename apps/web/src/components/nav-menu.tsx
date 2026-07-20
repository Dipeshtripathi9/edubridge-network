'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Menu, X } from 'lucide-react';
import { BrandLockup } from '@/components/brand-lockup';
import { AccountMenu } from '@/components/account-menu';
import { useAuthStore } from '@/stores/auth.store';
import { ADMIN_NAV } from '@/components/sidebar';

// Primary navigation. Opened from the ☰ in the header, on every screen size.
const MENU = [
  { href: '/home', label: 'Home' },
  { href: '/reviews', label: 'Compare Colleges' },
  { href: '/home#direct-admission', label: 'Direct Admission Desk' },
  { href: '/startups/ez-rentbuddy', label: 'Places to Live' },
];

export function NavMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const items = [...MENU, ...(isAdmin ? ADMIN_NAV.map((a) => ({ href: a.href, label: a.label })) : [])];

  useEffect(() => setMounted(true), []);
  // Close on route change (covers logo + link taps).
  useEffect(() => setOpen(false), [pathname]);
  // Lock scroll + close on Esc while open.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const overlay = (
    <div className="animate-page fixed inset-0 z-[90] overflow-y-auto bg-background">
      {/* Top bar: X · lockup · account */}
      <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-border/70 px-4 md:px-6">
        <button
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="grid h-10 w-10 place-items-center justify-self-start rounded-full text-foreground transition-colors hover:bg-accent"
        >
          <X className="h-6 w-6" strokeWidth={2.4} />
        </button>
        <BrandLockup className="justify-self-center" onClick={() => setOpen(false)} />
        <div className="justify-self-end">
          <AccountMenu />
        </div>
      </div>

      {/* Nav items */}
      <nav className="mx-auto max-w-2xl px-6 pb-12 pt-3">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            onClick={() => setOpen(false)}
            className="flex items-center justify-between gap-4 border-b border-border py-5 font-display text-[15px] font-bold uppercase tracking-[0.22em] text-primary transition-colors hover:text-primary/70"
          >
            {it.label}
            <ChevronRight className="h-4 w-4 flex-none" strokeWidth={2.6} />
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="grid h-10 w-10 place-items-center rounded-full text-foreground transition-colors hover:bg-accent"
      >
        <Menu className="h-6 w-6" strokeWidth={2.4} />
      </button>
      {open && mounted && createPortal(overlay, document.body)}
    </>
  );
}
