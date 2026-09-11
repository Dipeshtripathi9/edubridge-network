'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type VirtualInternshipTrack = 'WEEK' | 'MONTH';
export type EnrollmentStatus = 'PENDING_PAYMENT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type EnrollmentTaskStatus = 'ASSIGNED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface VirtualInternshipTaskAdmin {
  id: string;
  taskIndex: number;
  title: string | null;
  status: EnrollmentTaskStatus;
  submissionUrl: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
}

export interface VirtualInternshipEnrollmentAdmin {
  id: string;
  userId: string;
  user: { email: string | null; phone: string | null; profile: { fullName: string } | null };
  track: VirtualInternshipTrack;
  referralApplied: boolean;
  donateApplied: boolean;
  scholarshipApplied: boolean;
  feeAmount: string;
  status: EnrollmentStatus;
  paidAt: string | null;
  createdAt: string;
  tasks: VirtualInternshipTaskAdmin[];
}

export interface VirtualInternshipScholarshipAdmin {
  id: string;
  track: VirtualInternshipTrack;
  capacity: number;
  updatedById: string | null;
}

export function useVirtualInternshipEnrollments() {
  return useQuery({
    queryKey: ['admin', 'virtual-internship', 'enrollments'],
    queryFn: () => api.get<VirtualInternshipEnrollmentAdmin[]>('/virtual-internship/enrollments'),
  });
}

export function useVirtualInternshipScholarships() {
  return useQuery({
    queryKey: ['admin', 'virtual-internship', 'scholarships'],
    queryFn: () => api.get<VirtualInternshipScholarshipAdmin[]>('/virtual-internship/scholarships'),
  });
}
