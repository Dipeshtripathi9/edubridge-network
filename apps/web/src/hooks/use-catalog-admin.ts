'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { College, CollegeCourse } from '@/hooks/use-colleges';
import type { OpportunityType } from '@/hooks/use-internship-listings';

export interface Scholarship {
  id: string;
  title: string;
  slug: string;
  provider: string;
  amountPerYear: number;
  renewalYears?: number | null;
  category: string;
  eligibilityText: string;
  minCgpa?: number | null;
  eligibleCourses: string[];
  eligibleStates: string[];
  applyUrl: string;
  deadline: string;
}

export interface InternshipListingAdmin {
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

// ---------- Colleges ----------

export function useAdminColleges(q: string) {
  return useQuery({
    queryKey: ['admin', 'colleges', q],
    queryFn: () => api.paginated<College>(`/colleges?limit=50${q ? `&q=${encodeURIComponent(q)}` : ''}`),
  });
}

export function useCreateCollege() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<College> & { name: string }) => api.post('/colleges', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'colleges'] });
      qc.invalidateQueries({ queryKey: ['colleges'] });
    },
  });
}

export function useUpdateCollege() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<College> & { id: string }) => api.patch(`/colleges/${id}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'colleges'] });
      qc.invalidateQueries({ queryKey: ['colleges'] });
    },
  });
}

export function useDeleteCollege() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/colleges/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'colleges'] });
      qc.invalidateQueries({ queryKey: ['colleges'] });
    },
  });
}

// ---------- College courses (Field -> Degree -> Specialization per college) ----------

export function useCreateCollegeCourse(collegeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CollegeCourse> & { field: string; degree: string }) =>
      api.post(`/colleges/${collegeId}/courses`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['college'] }),
  });
}

export function useUpdateCollegeCourse(collegeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<CollegeCourse> & { id: string }) =>
      api.patch(`/colleges/${collegeId}/courses/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['college'] }),
  });
}

export function useDeleteCollegeCourse(collegeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => api.delete(`/colleges/${collegeId}/courses/${courseId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['college'] }),
  });
}

// ---------- Scholarships ----------

export function useAdminScholarships(q: string) {
  return useQuery({
    queryKey: ['admin', 'scholarships', q],
    queryFn: () => api.paginated<Scholarship>(`/scholarships?limit=50${q ? `&q=${encodeURIComponent(q)}` : ''}`),
  });
}

export function useCreateScholarship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Scholarship, 'id' | 'slug'>) => api.post('/scholarships', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'scholarships'] });
      qc.invalidateQueries({ queryKey: ['scholarships'] });
    },
  });
}

export function useUpdateScholarship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<Scholarship> & { id: string }) => api.patch(`/scholarships/${id}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'scholarships'] });
      qc.invalidateQueries({ queryKey: ['scholarships'] });
    },
  });
}

export function useDeleteScholarship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/scholarships/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'scholarships'] });
      qc.invalidateQueries({ queryKey: ['scholarships'] });
    },
  });
}

// ---------- Internship listings ----------

export function useAdminInternshipListings(q: string) {
  return useQuery({
    queryKey: ['admin', 'internship-listings', q],
    queryFn: () =>
      api.paginated<InternshipListingAdmin>(`/internship-listings?limit=50${q ? `&q=${encodeURIComponent(q)}` : ''}`),
  });
}

export function useCreateInternshipListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<InternshipListingAdmin, 'id' | 'slug'>) => api.post('/internship-listings', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'internship-listings'] });
      qc.invalidateQueries({ queryKey: ['internship-listings'] });
    },
  });
}

export function useUpdateInternshipListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<InternshipListingAdmin> & { id: string }) =>
      api.patch(`/internship-listings/${id}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'internship-listings'] });
      qc.invalidateQueries({ queryKey: ['internship-listings'] });
    },
  });
}

export function useDeleteInternshipListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/internship-listings/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'internship-listings'] });
      qc.invalidateQueries({ queryKey: ['internship-listings'] });
    },
  });
}
