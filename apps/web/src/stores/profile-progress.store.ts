'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tracks EduBridge Profile completion (0 → 100, in 25% steps). Persisted so the
// account drawer's progress line and the profile page stay in sync across refreshes.
interface ProfileProgressState {
  pct: number;
  setPct: (pct: number) => void;
  reset: () => void;
}

export const useProfileProgress = create<ProfileProgressState>()(
  persist(
    (set) => ({
      pct: 0,
      // Only ever move forward — completing a later step shouldn't be undone by
      // re-entering an earlier one.
      setPct: (pct) => set((s) => ({ pct: Math.max(s.pct, Math.min(100, pct)) })),
      reset: () => set({ pct: 0 }),
    }),
    { name: 'edubridge-profile-progress' },
  ),
);
