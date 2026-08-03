'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'edubridge-college-applied';

function readSlugs(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

// Client-side-only "applied" marker (no backend application model exists for
// colleges yet — mirrors useCollegeShortlist's localStorage pattern). Once
// applied, a college stays applied; there's no un-apply action.
export function useCollegeApplied() {
  const [mounted, setMounted] = useState(false);
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(readSlugs());
    setMounted(true);
  }, []);

  const markApplied = useCallback((slug: string) => {
    setSlugs((prev) => {
      if (prev.includes(slug)) return prev;
      const next = [...prev, slug];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isApplied = useCallback((slug: string) => mounted && slugs.includes(slug), [mounted, slugs]);

  return { slugs: mounted ? slugs : [], isApplied, markApplied };
}
