'use client';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AgencyLeadInput {
  kind: 'PROPOSAL' | 'CAREER' | 'INFLUENCER';
  name: string;
  email: string;
  phone?: string;
  services?: string[];
  message?: string;
  role?: string;
  projectUrl?: string;
  videoUrls?: string[];
}

export function useSubmitAgencyLead() {
  return useMutation({
    mutationFn: (input: AgencyLeadInput) => api.post('/agency/leads', input),
  });
}
