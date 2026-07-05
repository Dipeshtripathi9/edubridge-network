'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  GraduationCap,
  LayoutGrid,
  Search as SearchIcon,
  Star,
  Target,
  User as UserIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSearchAll, type SearchHit, type SearchType } from '@/hooks/use-search';

const TYPE_ICON: Record<SearchType, typeof Star> = {
  college: GraduationCap,
  community: LayoutGrid,
  user: UserIcon,
  opportunity: Target,
  resource: BookOpen,
  review: Star,
};
const TYPES = Object.keys(TYPE_ICON) as SearchType[];

// Show suggestions only once the user has typed at least this many characters.
const MIN_CHARS = 3;

export function GlobalSearch() {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [q, setQ] = useState(''); // debounced query actually sent to the API
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const ready = term.trim().length >= MIN_CHARS;

  // Debounce: wait for a pause in typing before querying, and never query
  // until at least MIN_CHARS characters are entered.
  useEffect(() => {
    const t = term.trim();
    if (t.length < MIN_CHARS) {
      setQ('');
      return;
    }
    const id = setTimeout(() => setQ(t), 250);
    return () => clearTimeout(id);
  }, [term]);

  const { data, isLoading } = useSearchAll(q);

  // Flatten the top few hits per type into one suggestion list.
  const hits = useMemo<SearchHit[]>(
    () => (q ? TYPES.flatMap((ty) => (data?.groups?.[ty] ?? []).slice(0, 3)) : []),
    [q, data],
  );

  // Close the dropdown when clicking outside the box.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const goToFullResults = () => {
    const t = term.trim();
    if (!t) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(t)}`);
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') goToFullResults();
            if (e.key === 'Escape') setOpen(false);
          }}
          placeholder="Search colleges, communities, people…"
          className="pl-9"
          aria-label="Search"
        />
      </div>

      {open && ready && (
        <div className="absolute z-40 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          {isLoading || (q && !data) ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">Searching…</p>
          ) : hits.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              No matches for “{term.trim()}”.
            </p>
          ) : (
            <ul className="max-h-96 overflow-auto py-1">
              {hits.map((h) => {
                const Icon = TYPE_ICON[h.type];
                const row = (
                  <div className="flex items-center gap-3 px-3 py-2 hover:bg-accent">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{h.title}</p>
                      {h.subtitle && (
                        <p className="truncate text-xs text-muted-foreground">{h.subtitle}</p>
                      )}
                    </div>
                  </div>
                );
                return (
                  <li key={`${h.type}-${h.id}`}>
                    {h.url ? (
                      <Link href={h.url} onClick={() => setOpen(false)}>
                        {row}
                      </Link>
                    ) : (
                      row
                    )}
                  </li>
                );
              })}
              <li>
                <button
                  onClick={goToFullResults}
                  className={cn(
                    'w-full border-t border-border px-3 py-2 text-left text-sm font-medium text-primary hover:bg-accent',
                  )}
                >
                  See all results for “{term.trim()}”
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
