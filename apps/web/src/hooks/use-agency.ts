'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AgencyLead {
  id: string;
  kind: 'PROPOSAL' | 'CAREER' | 'INFLUENCER';
  name: string;
  email: string;
  phone?: string | null;
  services: string[];
  message?: string | null;
  role?: string | null;
  projectUrl?: string | null;
  videoUrls: string[];
  status: string;
  createdAt: string;
}

export function useAgencyLeads(kind?: 'PROPOSAL' | 'CAREER' | 'INFLUENCER') {
  return useQuery({
    queryKey: ['agency', 'leads', kind ?? 'all'],
    queryFn: () => api.get<AgencyLead[]>(`/agency/leads${kind ? `?kind=${kind}` : ''}`),
  });
}

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
