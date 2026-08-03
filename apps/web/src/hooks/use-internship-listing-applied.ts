'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'edubridge-internship-listing-applied';

function readSlugs(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

// Client-side-only "applied" marker for the opportunities catalog — mirrors
// useCollegeApplied's localStorage pattern (no backend application model
// exists for these listings yet).
export function useInternshipListingApplied() {
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
