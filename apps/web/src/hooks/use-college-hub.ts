'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface CollegeHub {
  college: {
    id: string;
    name: string;
    slug: string;
    city?: string | null;
    state?: string | null;
    logoUrl?: string | null;
    coverUrl?: string | null;
    nirfRank?: number | null;
    avgRating: number;
    university?: { id: string; name: string } | null;
  };
  community: { id: string; slug: string; name: string; description?: string | null } | null;
  counts: {
    members: number;
    verifiedStudents: number;
    verifiedAdmins: number;
    posts: number;
    reviews: number;
    resources: number;
    opportunities: number;
    faqs: number;
  };
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface TransferStory {
  id: string;
  story: string;
  fromCollege?: { id: string; name: string } | null;
  toCollege?: { id: string; name: string } | null;
  user: { id: string; profile?: { fullName: string; avatarUrl?: string | null } | null };
}

export function useCollegeHub(slug: string) {
  return useQuery({
    queryKey: ['college-hub', slug],
    queryFn: () => api.get<CollegeHub>(`/colleges/${slug}/hub`),
    enabled: !!slug,
  });
}

export function useFaqs(collegeId?: string) {
  return useQuery({
    queryKey: ['faqs', collegeId],
    queryFn: () => api.get<Faq[]>(`/colleges/${collegeId}/faqs`),
    enabled: !!collegeId,
  });
}

export function useCollegeTransferStories(collegeId?: string) {
  return useQuery({
    queryKey: ['transfer-stories', 'college', collegeId],
    queryFn: () => api.paginated<TransferStory>(`/transfer/stories?toCollegeId=${collegeId}&limit=20`),
    enabled: !!collegeId,
  });
}
