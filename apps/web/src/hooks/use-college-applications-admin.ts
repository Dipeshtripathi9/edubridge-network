'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface CollegeApplicationAdmin {
  userId: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  state: string | null;
  colleges: { name: string; appliedAt: string }[];
}

export function useCollegeApplicationsAdmin() {
  return useQuery({
    queryKey: ['admin', 'college-applications'],
    queryFn: () => api.get<CollegeApplicationAdmin[]>('/admin/college-applications'),
  });
}
