'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

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

// Guests get a client-side-only "applied" marker (localStorage) — there's no
// account to attach a server record to. Logged-in users write through to the
// backend instead, so admins can see who applied where.
export function useCollegeApplied() {
  const loggedIn = useAuthStore((s) => !!s.accessToken);
  const qc = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [localSlugs, setLocalSlugs] = useState<string[]>([]);

  useEffect(() => {
    setLocalSlugs(readSlugs());
    setMounted(true);
  }, []);

  const { data: serverSlugs } = useQuery({
    queryKey: ['college-applied', 'me'],
    queryFn: () => api.get<string[]>('/colleges/me/applied'),
    enabled: loggedIn,
  });

  const apply = useMutation({
    mutationFn: (slug: string) => api.post(`/colleges/${slug}/apply`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['college-applied', 'me'] }),
  });

  const markApplied = useCallback(
    (slug: string) => {
      if (loggedIn) {
        apply.mutate(slug);
        return;
      }
      setLocalSlugs((prev) => {
        if (prev.includes(slug)) return prev;
        const next = [...prev, slug];
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [loggedIn, apply],
  );

  const slugs = useMemo(() => (loggedIn ? (serverSlugs ?? []) : localSlugs), [loggedIn, serverSlugs, localSlugs]);
  const isApplied = useCallback((slug: string) => mounted && slugs.includes(slug), [mounted, slugs]);

  return { slugs: mounted ? slugs : [], isApplied, markApplied };
}
