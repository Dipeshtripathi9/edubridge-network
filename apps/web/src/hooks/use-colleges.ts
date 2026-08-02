'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface CollegeCourse {
  id: string;
  collegeId: string;
  field: string;
  degree: string;
  specialization?: string | null;

  // Admissions
  eligibility?: string | null;
  entranceExam?: string | null;
  cutoff?: string | null;
  admissionProcess?: string | null;
  documents?: string | null;
  seatMatrix?: string | null;
  reservation?: string | null;
  counselling?: string | null;
  managementQuota?: string | null;

  // Fees
  tuitionFee?: number | null;
  registrationFee?: number | null;
  examFee?: number | null;
  hostelFee?: number | null;
  otherCharges?: number | null;
  totalCost?: number | null;
  refundPolicy?: string | null;
  emiAvailable?: boolean;
  educationLoanAvailable?: boolean;

  // Placements
  placementPct?: number | null;
  avgPackage?: number | null;
  medianPackage?: number | null;
  highestPackage?: number | null;
  branchWisePlacement?: string | null;
  internshipPct?: number | null;
  ppoPct?: number | null;
  topRecruiters?: string | null;

  // ROI
  totalInvestment?: number | null;
  averageSalary?: number | null;
  expectedRoi?: string | null;
  breakEvenTime?: string | null;

  // Opportunities
  scholarshipsInfo?: string | null;
  internshipsInfo?: string | null;
  hackathons?: string | null;
  researchProjects?: string | null;
  exchangeProgram?: string | null;
  startupCell?: string | null;
  incubation?: string | null;

  // Career Opportunities
  jobRoles?: string | null;
  governmentJobs?: string | null;
  higherStudies?: string | null;
  certifications?: string | null;
  studyAbroad?: string | null;
  entrepreneurship?: string | null;

  // Reviews (curated aggregate)
  facultyRating?: number | null;
  placementRating?: number | null;
  courseRating?: number | null;
  curriculumRating?: number | null;
  verifiedReviewsCount?: number | null;

  // Q&A
  qna?: { question: string; answer: string }[] | null;
}

export interface College {
  id: string;
  name: string;
  slug: string;
  city?: string | null;
  state?: string | null;
  nirfRank?: number | null;
  avgRating: number;
  reviewCount: number;
  avgPlacementPackage?: number | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  type?: string | null;
  website?: string | null;
  accreditation?: string | null;
  admissionPrimary?: string | null;
  admissionSecondary?: string | null;
  tuitionFeePerYear?: number | null;
  verified?: boolean;
  hasScholarship?: boolean;
  university?: { id: string; name: string } | null;

  // 1. College Profile
  aboutCollege?: string | null;
  establishmentYear?: number | null;
  ownership?: string | null;
  affiliation?: string | null;
  campusSize?: string | null;
  contactDetails?: string | null;
  brochureUrl?: string | null;

  // 2. Location
  address?: string | null;
  googleMapsUrl?: string | null;
  nearbyMetro?: string | null;
  nearbyRailwayStation?: string | null;
  nearbyAirport?: string | null;
  nearbyRestaurants?: string | null;
  nearbyHospitals?: string | null;
  nearbyShoppingAreas?: string | null;
  costOfLiving?: string | null;

  // 3. Rankings
  qsRank?: number | null;
  naacGrade?: string | null;
  nbaStatus?: string | null;
  indiaTodayRank?: number | null;
  outlookRank?: number | null;
  theWeekRank?: number | null;

  // 4. Infrastructure
  hasLibrary?: boolean;
  hasLabs?: boolean;
  hasSmartClassrooms?: boolean;
  hasSportsComplex?: boolean;
  hasAuditorium?: boolean;
  hasCafeteria?: boolean;
  hasMedicalCentre?: boolean;
  hasBankAtm?: boolean;
  hasWifi?: boolean;
  hasSecurity?: boolean;

  // 5. Hostel
  hostelAvailable?: boolean;
  boysHostel?: boolean;
  girlsHostel?: boolean;
  hostelFoodQuality?: string | null;
  hostelLaundry?: boolean;
  hostelHousekeeping?: boolean;
  hostelCurfew?: string | null;
  hostelSecurity?: string | null;
  hostelRules?: string | null;
  nearbyPG?: string | null;
  nearbyFlats?: string | null;

  // 6. Student Life
  clubs?: string | null;
  societies?: string | null;
  technicalClubs?: string | null;
  culturalClubs?: string | null;
  annualFest?: string | null;
  sports?: string | null;
  ncc?: boolean;
  nss?: boolean;
  studentEvents?: string | null;

  // 7. College Culture
  attendancePolicy?: string | null;
  academicPressure?: string | null;
  codingCulture?: string | null;
  startupCulture?: string | null;
  researchCulture?: string | null;
  diversity?: string | null;
  campusSafety?: string | null;
  antiRagging?: string | null;
  studentSupport?: string | null;

  courses?: CollegeCourse[];
}

export function useColleges(filters: { q?: string; state?: string; sort?: string } = {}) {
  return useInfiniteQuery({
    queryKey: ['colleges', filters],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '18' });
      if (filters.q) params.set('q', filters.q);
      if (filters.state) params.set('state', filters.state);
      if (filters.sort) params.set('sort', filters.sort);
      if (pageParam) params.set('cursor', pageParam);
      return api.paginated<College>(`/colleges?${params.toString()}`);
    },
    getNextPageParam: (last) => (last.meta.hasMore ? last.meta.nextCursor ?? undefined : undefined),
  });
}

export function useCollege(slug: string) {
  return useQuery({
    queryKey: ['college', slug],
    queryFn: () => api.get<College>(`/colleges/${slug}`),
    enabled: !!slug,
  });
}
