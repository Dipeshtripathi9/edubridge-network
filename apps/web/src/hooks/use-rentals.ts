'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface RentalLeadInput {
  kind: 'SEEKER' | 'PROPERTY';
  name: string;
  phone?: string;
  email?: string;
  college?: string;
  location?: string;
  propertyType?: string;
  budget?: string;
  moveInDate?: string;
  occupants?: string;
  gender?: string;
  furnished?: string;
  requirements?: string;
  participant?: string;
  driveUrl?: string;
  details?: string;
}

export function useSubmitRentalLead() {
  return useMutation({
    mutationFn: (input: RentalLeadInput) => api.post('/rentals/leads', input),
  });
}

export interface RentalLead extends RentalLeadInput {
  id: string;
  status: string;
  createdAt: string;
}

export function useRentalLeads(kind?: 'SEEKER' | 'PROPERTY') {
  return useQuery({
    queryKey: ['rentals', 'leads', kind ?? 'all'],
    queryFn: () => api.get<RentalLead[]>(`/rentals/leads${kind ? `?kind=${kind}` : ''}`),
  });
}
