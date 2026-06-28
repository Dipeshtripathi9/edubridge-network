'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface TravelPool {
  id: string;
  kind: 'TRIP' | 'RIDE';
  title: string;
  seats: number;
  joined: number;
  status: 'OPEN' | 'ALMOST_FULL' | 'CONFIRMED' | 'COMPLETED';
  isMember: boolean;
  destination?: string | null;
  startDate?: string | null;
  returnDate?: string | null;
  budget?: string | null;
  fromLocation?: string | null;
  toLocation?: string | null;
  date?: string | null;
  time?: string | null;
  frequency?: string | null;
  estimatedFare?: string | null;
  costPerPerson?: string | null;
  college?: string | null;
  genderPref?: string | null;
  description?: string | null;
}

export function useTravelPools(kind: 'TRIP' | 'RIDE') {
  return useQuery({
    queryKey: ['travel-pools', kind],
    queryFn: () => api.get<TravelPool[]>(`/travel-pools?kind=${kind}`),
  });
}

export function useCreateTravelPool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => api.post<TravelPool>('/travel-pools', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['travel-pools'] }),
  });
}

export function useJoinTravelPool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<TravelPool>(`/travel-pools/${id}/join`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['travel-pools'] }),
  });
}
