'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface EligibleMatch {
  college: {
    id: string;
    name: string;
    slug: string;
    city?: string | null;
    state?: string | null;
    nirfRank?: number | null;
    avgRating?: number;
    avgPlacementPackage?: number | null;
    logoUrl?: string | null;
  };
  requirement: {
    id: string;
    branch?: string | null;
    minCgpa?: number | null;
    minYear?: number | null;
    maxYear?: number | null;
    creditTransfer: boolean;
    deadline?: string | null;
    feeAmount?: number | null;
    notes?: string | null;
  };
  cgpaHeadroom: number | null;
}

export interface EligibilityResult {
  eligibleCount: number;
  matches: EligibleMatch[];
}

export interface EligibilityInput {
  cgpa: number;
  currentYear: number;
  branch: string;
  creditTransferOnly?: boolean;
}

export function useEligibilityCheck() {
  return useMutation({
    mutationFn: (input: EligibilityInput) =>
      api.post<EligibilityResult>('/transfer/eligibility', input, { auth: false }),
  });
}

export interface TransferJourney {
  id: string;
  status: 'EXPLORING' | 'ELIGIBLE' | 'APPLIED' | 'COMPLETED';
  cgpa?: number | null;
  branch?: string | null;
  currentYear?: number | null;
  story?: string | null;
  isStoryPublic: boolean;
  toCollege?: { id: string; name: string; city?: string | null; state?: string | null } | null;
  fromCollege?: { id: string; name: string } | null;
}

export function useMyJourneys() {
  return useQuery({
    queryKey: ['transfer', 'me'],
    queryFn: () => api.get<TransferJourney[]>('/transfer/me'),
  });
}

export function useCreateJourney() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) =>
      api.post<TransferJourney>('/transfer', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transfer', 'me'] }),
  });
}

export function useUpdateJourney() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; status?: string; toCollegeId?: string }) =>
      api.patch<TransferJourney>(`/transfer/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transfer', 'me'] }),
  });
}

export interface TransferStory {
  id: string;
  story: string;
  toCollege?: { id: string; name: string } | null;
  fromCollege?: { id: string; name: string } | null;
  user: { id: string; profile?: { fullName: string; avatarUrl?: string | null } | null };
}

export function useStories() {
  return useQuery({
    queryKey: ['transfer', 'stories'],
    queryFn: () => api.paginated<TransferStory>('/transfer/stories?limit=20'),
  });
}
