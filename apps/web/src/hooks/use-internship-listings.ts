'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type OpportunityType = 'INTERNSHIP' | 'PART_TIME' | 'FREELANCE' | 'BLOGGING' | 'STARTUP';

export const OPPORTUNITY_TYPE_LABEL: Record<OpportunityType, string> = {
  INTERNSHIP: 'Internship',
  PART_TIME: 'Part-time work',
  FREELANCE: 'Freelance gig',
  BLOGGING: 'Blogging',
  STARTUP: 'Startup project',
};

export interface InternshipListing {
  id: string;
  title: string;
  slug: string;
  company: string;
  location: string;
  isRemote: boolean;
  type: OpportunityType;
  stipend?: number | null;
  duration: string;
  category: string;
  description: string;
  applyUrl: string;
  deadline?: string | null;
}

export function useInternshipListing(slug: string) {
  return useQuery({
    queryKey: ['internship-listing', slug],
    queryFn: () => api.get<InternshipListing>(`/internship-listings/${slug}`),
    enabled: !!slug,
  });
}

export function useInternshipCategories() {
  return useQuery({
    queryKey: ['internship-listing-categories'],
    queryFn: () => api.get<string[]>('/internship-listings/categories'),
  });
}
