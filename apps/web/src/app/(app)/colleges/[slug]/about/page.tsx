'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Building2, GraduationCap, Heart, Home, MapPin, Trophy, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { InfoSection } from '@/components/college-info-grid';
import { isSafeHttpUrl } from '@/lib/utils';
import { useCollege } from '@/hooks/use-colleges';

const yesNo = (b?: boolean) => (b ? 'Available' : undefined);

export default function CollegeAboutPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: college, isLoading } = useCollege(slug);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full rounded-[22px]" />
      </div>
    );
  }

  if (!college) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState icon={GraduationCap} title="College not found" description="This college may have been removed." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 truncate font-display text-[22px] font-bold">{college.name}</h1>
        <Link
          href={`/colleges/${college.slug}`}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-input bg-background px-5 text-sm font-semibold transition-colors hover:bg-accent"
        >
          Done
        </Link>
      </div>

      <div className="space-y-6 rounded-[22px] border border-border bg-card p-6">
        <InfoSection
          icon={Building2}
          title="College Profile"
          items={[
            { label: 'Establishment Year', value: college.establishmentYear },
            { label: 'Ownership', value: college.ownership },
            { label: 'Affiliation', value: college.affiliation },
            { label: 'Accreditations', value: college.accreditation },
            { label: 'Campus Size', value: college.campusSize },
            { label: 'Contact Details', value: college.contactDetails },
          ]}
          hasExtra={!!college.aboutCollege || !!college.website || !!college.brochureUrl}
          extra={
            <>
              {college.aboutCollege && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{college.aboutCollege}</p>}
              <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-primary">
                {college.website && isSafeHttpUrl(college.website) && (
                  <a href={college.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Official Website →
                  </a>
                )}
                {college.brochureUrl && isSafeHttpUrl(college.brochureUrl) && (
                  <a href={college.brochureUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Download Brochure →
                  </a>
                )}
              </div>
            </>
          }
        />

        <InfoSection
          icon={MapPin}
          title="Location"
          items={[
            { label: 'Nearby Metro', value: college.nearbyMetro },
            { label: 'Railway Station', value: college.nearbyRailwayStation },
            { label: 'Airport', value: college.nearbyAirport },
            { label: 'Restaurants', value: college.nearbyRestaurants },
            { label: 'Hospitals', value: college.nearbyHospitals },
            { label: 'Shopping Areas', value: college.nearbyShoppingAreas },
            { label: 'Cost of Living', value: college.costOfLiving },
          ]}
          hasExtra={!!college.address || !!college.googleMapsUrl}
          extra={
            <>
              {college.address && <p className="mt-4 text-sm text-muted-foreground">{college.address}</p>}
              {college.googleMapsUrl && isSafeHttpUrl(college.googleMapsUrl) && (
                <a
                  href={college.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
                >
                  Open in Google Maps →
                </a>
              )}
            </>
          }
        />

        <InfoSection
          icon={Trophy}
          title="Rankings"
          items={[
            { label: 'NIRF', value: college.nirfRank },
            { label: 'QS', value: college.qsRank },
            { label: 'NAAC', value: college.naacGrade },
            { label: 'NBA', value: college.nbaStatus },
            { label: 'India Today', value: college.indiaTodayRank },
            { label: 'Outlook', value: college.outlookRank },
            { label: 'The Week', value: college.theWeekRank },
          ]}
        />

        <InfoSection
          icon={Building2}
          title="Infrastructure"
          items={[
            { label: 'Library', value: yesNo(college.hasLibrary) },
            { label: 'Labs', value: yesNo(college.hasLabs) },
            { label: 'Smart Classrooms', value: yesNo(college.hasSmartClassrooms) },
            { label: 'Sports Complex', value: yesNo(college.hasSportsComplex) },
            { label: 'Auditorium', value: yesNo(college.hasAuditorium) },
            { label: 'Cafeteria', value: yesNo(college.hasCafeteria) },
            { label: 'Medical Centre', value: yesNo(college.hasMedicalCentre) },
            { label: 'Bank & ATM', value: yesNo(college.hasBankAtm) },
            { label: 'Wi-Fi', value: yesNo(college.hasWifi) },
            { label: 'Security', value: yesNo(college.hasSecurity) },
          ]}
        />

        <InfoSection
          icon={Home}
          title="Hostel"
          items={[
            { label: 'Boys Hostel', value: yesNo(college.boysHostel) },
            { label: 'Girls Hostel', value: yesNo(college.girlsHostel) },
            { label: 'Food Quality', value: college.hostelFoodQuality },
            { label: 'Laundry', value: yesNo(college.hostelLaundry) },
            { label: 'Housekeeping', value: yesNo(college.hostelHousekeeping) },
            { label: 'Curfew', value: college.hostelCurfew },
            { label: 'Security', value: college.hostelSecurity },
            { label: 'Hostel Rules', value: college.hostelRules },
            { label: 'Nearby PG', value: college.nearbyPG },
            { label: 'Nearby Flats', value: college.nearbyFlats },
          ]}
        />

        <InfoSection
          icon={Users}
          title="Student Life"
          items={[
            { label: 'Clubs', value: college.clubs },
            { label: 'Societies', value: college.societies },
            { label: 'Technical Clubs', value: college.technicalClubs },
            { label: 'Cultural Clubs', value: college.culturalClubs },
            { label: 'Annual Fest', value: college.annualFest },
            { label: 'Sports', value: college.sports },
            { label: 'NCC', value: yesNo(college.ncc) },
            { label: 'NSS', value: yesNo(college.nss) },
            { label: 'Events', value: college.studentEvents },
          ]}
        />

        <InfoSection
          icon={Heart}
          title="College Culture"
          items={[
            { label: 'Attendance Policy', value: college.attendancePolicy },
            { label: 'Academic Pressure', value: college.academicPressure },
            { label: 'Coding Culture', value: college.codingCulture },
            { label: 'Startup Culture', value: college.startupCulture },
            { label: 'Research Culture', value: college.researchCulture },
            { label: 'Diversity', value: college.diversity },
            { label: 'Campus Safety', value: college.campusSafety },
            { label: 'Anti-Ragging', value: college.antiRagging },
            { label: 'Student Support', value: college.studentSupport },
          ]}
        />
      </div>
    </div>
  );
}
