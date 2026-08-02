'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { CatalogManager } from '@/components/admin/catalog-manager';

// Admin-only left-edge sliding panel for managing the College/Scholarship/
// Internship catalog. Lives outside the /admin dashboard tabs so it's reachable
// from anywhere in the app, mirroring the full-screen overlay pattern in
// nav-menu.tsx but anchored as a slide-in tab on the left edge instead.
export function AdminCatalogPanel() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  useEffect(() => setMounted(true), []);

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

  if (!isAdmin) return null;

  const panel = (
    <div className="fixed inset-0 z-[95]">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <div className="animate-page absolute inset-y-0 left-0 flex w-full max-w-4xl flex-col bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3 md:px-6">
          <h2 className="font-display text-lg font-bold">Catalog</h2>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close catalog panel"
            className="grid h-9 w-9 place-items-center rounded-full text-foreground transition-colors hover:bg-accent"
          >
            <X className="h-5 w-5" strokeWidth={2.4} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <CatalogManager />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open catalog panel"
        className="fixed left-0 top-1/2 z-40 -translate-y-1/2 rounded-r-lg bg-primary px-2 py-4 text-xs font-bold uppercase tracking-[0.15em] text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:translate-x-0.5"
        style={{ writingMode: 'vertical-rl' }}
      >
        Catalog
      </button>
      {open && mounted && createPortal(panel, document.body)}
    </>
  );
}
