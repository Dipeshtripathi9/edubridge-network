'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string | null;
  role: string;
  profile?: { fullName?: string; username?: string | null; avatarUrl?: string | null } | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthUser | null) => void;
  setSession: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      hydrated: false,
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      setSession: (accessToken, refreshToken, user) => set({ accessToken, refreshToken, user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'edubridge-auth',
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
