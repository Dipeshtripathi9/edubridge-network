'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { GlobalSearch } from '@/components/global-search';

// The search feature (GlobalSearch + the /search results page) previously had
// no entry point anywhere in the UI. This wires it into the header behind a
// toggle icon, so the layout's existing centered-logo 3-column grid doesn't
// need to change to make room for a permanent search bar.
export function HeaderSearch() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        aria-label="Search"
        onClick={() => setOpen((v) => !v)}
        className="grid h-9 w-9 place-items-center rounded-full text-foreground transition-colors hover:bg-accent"
      >
        <Search className="h-[19px] w-[19px]" strokeWidth={1.7} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-[min(320px,90vw)]">
          <GlobalSearch autoFocus />
        </div>
      )}
    </div>
  );
}
