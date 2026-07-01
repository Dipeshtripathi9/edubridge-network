'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

export interface Me {
  id: string;
  email: string | null;
  role: string;
  reputationPoints: number;
  profile?: {
    fullName: string;
    username?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    course?: string | null;
    branch?: string | null;
    year?: number | null;
    cgpa?: number | null;
    state?: string | null;
    city?: string | null;
    interests: string[];
    collegeVerification?: string;
    college?: { id: string; name: string } | null;
  } | null;
  userBadges?: { badge: { name: string; tier: string } }[];
}

export function useMe() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<Me>('/users/me'),
    enabled: !!token,
    // Profile status (e.g. verification) can change server-side (admin approval),
    // so always refresh on mount/focus — shows cached instantly, then updates.
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => api.patch<Me>('/users/me', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useCompleteOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => api.put<Me>('/users/me/onboarding', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}
