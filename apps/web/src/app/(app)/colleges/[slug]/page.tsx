'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Briefcase,
  GraduationCap,
  HelpCircle,
  MapPin,
  Percent,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { InfoSection } from '@/components/college-info-grid';
import { useCollege, type CollegeCourse } from '@/hooks/use-colleges';

const money = (n?: number | null) => (n != null ? `₹${n.toLocaleString()}` : undefined);
const lpa = (n?: number | null) => (n != null ? `₹${n} LPA` : undefined);
const pct = (n?: number | null) => (n != null ? `${n}%` : undefined);
const rating5 = (n?: number | null) => (n != null ? `${n.toFixed(1)}/5` : undefined);
const yesNo = (b?: boolean) => (b ? 'Available' : undefined);

function CourseSelect({
  label,
  value,
  options,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder: string;
}) {
  return (
    <label className="block min-w-0 flex-1 space-y-1">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full truncate rounded-lg border border-input bg-background px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:text-muted-foreground"
      >
        {!value && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function CollegeHubPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: college, isLoading } = useCollege(slug);
  const courses = useMemo(() => college?.courses ?? [], [college?.courses]);

  const [field, setField] = useState('');
  const [degree, setDegree] = useState('');
  const [specialization, setSpecialization] = useState('');

  const fieldOptions = useMemo(() => Array.from(new Set(courses.map((c) => c.field))), [courses]);
  const activeField = field || fieldOptions[0] || '';
  const degreeOptions = useMemo(
    () => Array.from(new Set(courses.filter((c) => c.field === activeField).map((c) => c.degree))),
    [courses, activeField],
  );
  const activeDegree = degree || degreeOptions[0] || '';
  const specOptions = useMemo(
    () =>
      Array.from(
        new Set(
          courses
            .filter((c) => c.field === activeField && c.degree === activeDegree)
            .map((c) => c.specialization)
            .filter((s): s is string => !!s),
        ),
      ),
    [courses, activeField, activeDegree],
  );
  const activeSpec = specialization || specOptions[0] || '';

  const selected: CollegeCourse | undefined = courses.find(
    (c) => c.field === activeField && c.degree === activeDegree && (specOptions.length === 0 || c.specialization === activeSpec),
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-40 w-full rounded-[22px]" />
        <Skeleton className="h-24 w-full rounded-[22px]" />
      </div>
    );
  }

  if (!college) {
    return (
      <div className="mx-auto max-w-4xl">
        <EmptyState icon={GraduationCap} title="College not found" description="This college may have been removed." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Summary header */}
      <div className="rounded-[22px] border border-border bg-card p-6">
        <h1 className="font-display text-[26px] font-bold leading-tight">{college.name}</h1>
        {(college.city || college.state) && (
          <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" /> {[college.city, college.state].filter(Boolean).join(', ')}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {college.nirfRank && <span className="rounded-full bg-accent px-3 py-1.5 text-sm font-semibold">NIRF: {college.nirfRank}</span>}
          {college.naacGrade && <span className="rounded-full bg-accent px-3 py-1.5 text-sm font-semibold">NAAC: {college.naacGrade}</span>}
          {college.campusSize && <span className="rounded-full bg-accent px-3 py-1.5 text-sm font-semibold">Campus: {college.campusSize}</span>}
          {college.hasWifi && <span className="rounded-full bg-accent px-3 py-1.5 text-sm font-semibold">Wi-Fi: Yes</span>}
        </div>
        <Link
          href={`/colleges/${college.slug}/about`}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-colors hover:bg-primary/90"
        >
          See more about college
        </Link>
      </div>

      {/* Course selector */}
      {courses.length > 0 && (
        <div className="rounded-[22px] border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-[17px] font-semibold">Select your course</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <CourseSelect
              label="Field"
              value={activeField}
              options={fieldOptions}
              onChange={(v) => {
                setField(v);
                setDegree('');
                setSpecialization('');
              }}
              placeholder="Select field"
            />
            <CourseSelect
              label="Degree"
              value={activeDegree}
              options={degreeOptions}
              onChange={(v) => {
                setDegree(v);
                setSpecialization('');
              }}
              placeholder="Select degree"
            />
            <CourseSelect
              label="Specialization"
              value={activeSpec}
              options={specOptions}
              onChange={setSpecialization}
              disabled={specOptions.length === 0}
              placeholder={specOptions.length === 0 ? 'Not applicable' : 'Select specialization'}
            />
          </div>
        </div>
      )}

      {/* Dynamic per-course data */}
      {selected ? (
        <div className="space-y-6 rounded-[22px] border border-border bg-card p-6">
          <h2 className="font-display text-[20px] font-semibold">
            {selected.field} → {selected.degree}
            {selected.specialization ? ` → ${selected.specialization}` : ''}
          </h2>

          <InfoSection
            icon={Target}
            title="Admissions"
            items={[
              { label: 'Eligibility', value: selected.eligibility },
              { label: 'Entrance Exam', value: selected.entranceExam },
              { label: 'Cutoff', value: selected.cutoff },
              { label: 'Admission Process', value: selected.admissionProcess },
              { label: 'Documents', value: selected.documents },
              { label: 'Seat Matrix', value: selected.seatMatrix },
              { label: 'Reservation', value: selected.reservation },
              { label: 'Counselling', value: selected.counselling },
              { label: 'Management Quota', value: selected.managementQuota },
            ]}
          />

          <InfoSection
            icon={Wallet}
            title="Fees"
            items={[
              { label: 'Tuition Fee', value: money(selected.tuitionFee) },
              { label: 'Registration Fee', value: money(selected.registrationFee) },
              { label: 'Exam Fee', value: money(selected.examFee) },
              { label: 'Hostel Fee', value: money(selected.hostelFee) },
              { label: 'Other Charges', value: money(selected.otherCharges) },
              { label: 'Total Cost', value: money(selected.totalCost) },
              { label: 'Refund Policy', value: selected.refundPolicy },
              { label: 'EMI', value: yesNo(selected.emiAvailable) },
              { label: 'Education Loan', value: yesNo(selected.educationLoanAvailable) },
            ]}
          />

          <InfoSection
            icon={TrendingUp}
            title="Placements"
            items={[
              { label: 'Placement %', value: pct(selected.placementPct) },
              { label: 'Average Package', value: lpa(selected.avgPackage) },
              { label: 'Median Package', value: lpa(selected.medianPackage) },
              { label: 'Highest Package', value: lpa(selected.highestPackage) },
              { label: 'Branch-wise Placement', value: selected.branchWisePlacement },
              { label: 'Internship %', value: pct(selected.internshipPct) },
              { label: 'PPO %', value: pct(selected.ppoPct) },
              { label: 'Top Recruiters', value: selected.topRecruiters },
            ]}
          />

          <InfoSection
            icon={Percent}
            title="ROI"
            items={[
              { label: 'Total Investment', value: money(selected.totalInvestment) },
              { label: 'Average Salary', value: lpa(selected.averageSalary) },
              { label: 'Expected ROI', value: selected.expectedRoi },
              { label: 'Break-even Time', value: selected.breakEvenTime },
            ]}
          />

          <InfoSection
            icon={Sparkles}
            title="Opportunities"
            items={[
              { label: 'Scholarships', value: selected.scholarshipsInfo },
              { label: 'Internships', value: selected.internshipsInfo },
              { label: 'Hackathons', value: selected.hackathons },
              { label: 'Research Projects', value: selected.researchProjects },
              { label: 'Exchange Program', value: selected.exchangeProgram },
              { label: 'Startup Cell', value: selected.startupCell },
              { label: 'Incubation', value: selected.incubation },
            ]}
          />

          <InfoSection
            icon={Briefcase}
            title="Career Opportunities"
            items={[
              { label: 'Job Roles', value: selected.jobRoles },
              { label: 'Government Jobs', value: selected.governmentJobs },
              { label: 'Higher Studies', value: selected.higherStudies },
              { label: 'Certifications', value: selected.certifications },
              { label: 'Study Abroad', value: selected.studyAbroad },
              { label: 'Entrepreneurship', value: selected.entrepreneurship },
            ]}
          />

          <InfoSection
            icon={Star}
            title="Reviews"
            items={[
              { label: 'Faculty Rating', value: rating5(selected.facultyRating) },
              { label: 'Placement Rating', value: rating5(selected.placementRating) },
              { label: 'Course Rating', value: rating5(selected.courseRating) },
              { label: 'Curriculum Rating', value: rating5(selected.curriculumRating) },
              { label: 'Verified Reviews', value: selected.verifiedReviewsCount ? `${selected.verifiedReviewsCount}` : undefined },
            ]}
          />

          {selected.qna && selected.qna.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-display text-[16px] font-semibold">
                <HelpCircle className="h-4 w-4 text-primary" /> Course-specific Q&A
              </h3>
              <div className="space-y-3 border-t border-border pt-4">
                {selected.qna.map((qa, i) => (
                  <div key={i}>
                    <p className="text-sm font-semibold">{qa.question}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{qa.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        courses.length === 0 && (
          <EmptyState
            icon={GraduationCap}
            title="No courses added yet"
            description="Check back soon — we're adding course details for this college."
          />
        )
      )}
    </div>
  );
}
