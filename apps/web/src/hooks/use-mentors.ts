'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface MentorRequestInput {
  name: string;
  phone: string;
  email?: string;
  course?: string;
  location?: string;
  marks?: string;
  budget?: string;
  category?: string;
  preferredCollege?: string;
  contactMethod?: 'CALL' | 'CHAT';
  message?: string;
}

export interface MentorRequest extends MentorRequestInput {
  id: string;
  status: string;
  createdAt: string;
}

export function useSubmitMentorRequest() {
  return useMutation({
    mutationFn: (input: MentorRequestInput) => api.post('/mentors/requests', input),
  });
}

export function useMentorRequests(enabled = true) {
  return useQuery({
    queryKey: ['admin', 'mentor-requests'],
    queryFn: () => api.get<MentorRequest[]>('/mentors/requests'),
    enabled,
  });
}
