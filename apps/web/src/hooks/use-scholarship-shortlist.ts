'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'edubridge-scholarship-shortlist';

function readSlugs(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

// Client-side-only scholarship shortlist (mirrors use-college-shortlist.ts —
// no backend model exists for this yet). Guarded behind a mounted check so
// SSR/hydration never sees a mismatched list.
export function useScholarshipShortlist() {
  const [mounted, setMounted] = useState(false);
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(readSlugs());
    setMounted(true);
  }, []);

  const toggle = useCallback((slug: string) => {
    setSlugs((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isShortlisted = useCallback((slug: string) => mounted && slugs.includes(slug), [mounted, slugs]);

  return { slugs: mounted ? slugs : [], isShortlisted, toggle };
}
