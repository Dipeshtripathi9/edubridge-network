'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'edubridge-college-shortlist';

function readStoredSlugs(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Tiny localStorage-backed college shortlist, shared by /colleges and /compare.
 * Starts empty on the server render and hydrates from localStorage on mount,
 * so the first client render always matches the server's (no hydration mismatch).
 */
export function useCollegeShortlist() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSlugs(readStoredSlugs());
    setMounted(true);
  }, []);

  const persist = useCallback((next: string[]) => {
    setSlugs(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const toggle = useCallback(
    (slug: string) => {
      persist(slugs.includes(slug) ? slugs.filter((s) => s !== slug) : [...slugs, slug]);
    },
    [slugs, persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  return {
    mounted,
    slugs,
    isShortlisted: (slug: string) => slugs.includes(slug),
    toggle,
    clear,
  };
}
