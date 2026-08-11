'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

export interface Me {
  id: string;
  email: string | null;
  phone?: string | null;
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
    signupIntent?: 'COLLEGE_ADMISSIONS' | 'INTERNSHIPS_JOBS' | null;
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

/** Simplified Internships & Jobs onboarding — name/mobile/college/course/state + Google verify. */
export function useCompleteJobsOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      fullName: string;
      phone?: string;
      collegeName: string;
      course: string;
      state: string;
      idToken: string;
    }) => api.put<Me>('/users/me/jobs-onboarding', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}

/** Bare Google identity gate — used before the "find my college" profile form's final submit. */
export function useVerifyGoogle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idToken: string) => api.post<Me>('/users/me/verify-google', { idToken }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}
