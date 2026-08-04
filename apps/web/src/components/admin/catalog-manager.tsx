'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import type { College, CollegeCourse } from '@/hooks/use-colleges';
import { useCollege } from '@/hooks/use-colleges';
import { useScholarshipCategories } from '@/hooks/use-scholarships';
import { useInternshipCategories, OPPORTUNITY_TYPE_LABEL, type OpportunityType } from '@/hooks/use-internship-listings';
import { CoursePathSelector } from '@/components/ui/course-path-selector';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  useAdminColleges,
  useCreateCollege,
  useUpdateCollege,
  useDeleteCollege,
  useCreateCollegeCourse,
  useUpdateCollegeCourse,
  useDeleteCollegeCourse,
  useAdminScholarships,
  useCreateScholarship,
  useUpdateScholarship,
  useDeleteScholarship,
  useAdminInternshipListings,
  useCreateInternshipListing,
  useUpdateInternshipListing,
  useDeleteInternshipListing,
  type Scholarship,
  type InternshipListingAdmin,
} from '@/hooks/use-catalog-admin';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

function BoolField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground sm:col-span-2">{children}</p>;
}

// Inline confirm instead of window.confirm — native confirm() dialogs are
// blocking and inconsistent with the rest of the UI.
function ConfirmDeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            setConfirming(false);
            onConfirm();
          }}
        >
          Confirm delete
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    );
  }
  return (
    <Button size="sm" variant="outline" onClick={() => setConfirming(true)}>
      Delete
    </Button>
  );
}

// ---------- Colleges ----------

const emptyCollegeForm = (initial?: College) => ({
  name: initial?.name ?? '',
  state: initial?.state ?? '',
  city: initial?.city ?? '',
  type: initial?.type ?? '',
  nirfRank: initial?.nirfRank?.toString() ?? '',
  accreditation: initial?.accreditation ?? '',
  admissionPrimary: initial?.admissionPrimary ?? '',
  admissionSecondary: initial?.admissionSecondary ?? '',
  tuitionFeePerYear: initial?.tuitionFeePerYear?.toString() ?? '',
  verified: initial?.verified ?? false,
  hasScholarship: initial?.hasScholarship ?? false,

  // 1. College Profile
  aboutCollege: initial?.aboutCollege ?? '',
  establishmentYear: initial?.establishmentYear?.toString() ?? '',
  ownership: initial?.ownership ?? '',
  affiliation: initial?.affiliation ?? '',
  campusSize: initial?.campusSize ?? '',
  contactDetails: initial?.contactDetails ?? '',
  brochureUrl: initial?.brochureUrl ?? '',
  website: initial?.website ?? '',

  // 2. Location
  address: initial?.address ?? '',
  googleMapsUrl: initial?.googleMapsUrl ?? '',
  nearbyMetro: initial?.nearbyMetro ?? '',
  nearbyRailwayStation: initial?.nearbyRailwayStation ?? '',
  nearbyAirport: initial?.nearbyAirport ?? '',
  nearbyRestaurants: initial?.nearbyRestaurants ?? '',
  nearbyHospitals: initial?.nearbyHospitals ?? '',
  nearbyShoppingAreas: initial?.nearbyShoppingAreas ?? '',
  costOfLiving: initial?.costOfLiving ?? '',

  // 3. Rankings
  qsRank: initial?.qsRank?.toString() ?? '',
  naacGrade: initial?.naacGrade ?? '',
  nbaStatus: initial?.nbaStatus ?? '',
  indiaTodayRank: initial?.indiaTodayRank?.toString() ?? '',
  outlookRank: initial?.outlookRank?.toString() ?? '',
  theWeekRank: initial?.theWeekRank?.toString() ?? '',

  // 4. Infrastructure
  hasLibrary: initial?.hasLibrary ?? false,
  hasLabs: initial?.hasLabs ?? false,
  hasSmartClassrooms: initial?.hasSmartClassrooms ?? false,
  hasSportsComplex: initial?.hasSportsComplex ?? false,
  hasAuditorium: initial?.hasAuditorium ?? false,
  hasCafeteria: initial?.hasCafeteria ?? false,
  hasMedicalCentre: initial?.hasMedicalCentre ?? false,
  hasBankAtm: initial?.hasBankAtm ?? false,
  hasWifi: initial?.hasWifi ?? false,
  hasSecurity: initial?.hasSecurity ?? false,

  // 5. Hostel
  hostelAvailable: initial?.hostelAvailable ?? false,
  boysHostel: initial?.boysHostel ?? false,
  girlsHostel: initial?.girlsHostel ?? false,
  hostelFoodQuality: initial?.hostelFoodQuality ?? '',
  hostelLaundry: initial?.hostelLaundry ?? false,
  hostelHousekeeping: initial?.hostelHousekeeping ?? false,
  hostelCurfew: initial?.hostelCurfew ?? '',
  hostelSecurity: initial?.hostelSecurity ?? '',
  hostelRules: initial?.hostelRules ?? '',
  nearbyPG: initial?.nearbyPG ?? '',
  nearbyFlats: initial?.nearbyFlats ?? '',

  // 6. Student Life
  clubs: initial?.clubs ?? '',
  societies: initial?.societies ?? '',
  technicalClubs: initial?.technicalClubs ?? '',
  culturalClubs: initial?.culturalClubs ?? '',
  annualFest: initial?.annualFest ?? '',
  sports: initial?.sports ?? '',
  ncc: initial?.ncc ?? false,
  nss: initial?.nss ?? false,
  studentEvents: initial?.studentEvents ?? '',

  // 7. College Culture
  attendancePolicy: initial?.attendancePolicy ?? '',
  academicPressure: initial?.academicPressure ?? '',
  codingCulture: initial?.codingCulture ?? '',
  startupCulture: initial?.startupCulture ?? '',
  researchCulture: initial?.researchCulture ?? '',
  diversity: initial?.diversity ?? '',
  campusSafety: initial?.campusSafety ?? '',
  antiRagging: initial?.antiRagging ?? '',
  studentSupport: initial?.studentSupport ?? '',
});

function CollegeForm({ initial, onDone }: { initial?: College; onDone: () => void }) {
  const [form, setForm] = useState(emptyCollegeForm(initial));
  const create = useCreateCollege();
  const update = useUpdateCollege();
  const pending = create.isPending || update.isPending;

  const submit = () => {
    if (!form.name.trim()) return toast.error('Name is required');
    const str = (v: string) => v.trim() || undefined;
    const num = (v: string) => (v ? Number(v) : undefined);
    const payload = {
      name: form.name.trim(),
      state: str(form.state),
      city: str(form.city),
      type: str(form.type),
      nirfRank: num(form.nirfRank),
      accreditation: str(form.accreditation),
      admissionPrimary: str(form.admissionPrimary),
      admissionSecondary: str(form.admissionSecondary),
      tuitionFeePerYear: num(form.tuitionFeePerYear),
      verified: form.verified,
      hasScholarship: form.hasScholarship,

      aboutCollege: str(form.aboutCollege),
      establishmentYear: num(form.establishmentYear),
      ownership: str(form.ownership),
      affiliation: str(form.affiliation),
      campusSize: str(form.campusSize),
      contactDetails: str(form.contactDetails),
      brochureUrl: str(form.brochureUrl),
      website: str(form.website),

      address: str(form.address),
      googleMapsUrl: str(form.googleMapsUrl),
      nearbyMetro: str(form.nearbyMetro),
      nearbyRailwayStation: str(form.nearbyRailwayStation),
      nearbyAirport: str(form.nearbyAirport),
      nearbyRestaurants: str(form.nearbyRestaurants),
      nearbyHospitals: str(form.nearbyHospitals),
      nearbyShoppingAreas: str(form.nearbyShoppingAreas),
      costOfLiving: str(form.costOfLiving),

      qsRank: num(form.qsRank),
      naacGrade: str(form.naacGrade),
      nbaStatus: str(form.nbaStatus),
      indiaTodayRank: num(form.indiaTodayRank),
      outlookRank: num(form.outlookRank),
      theWeekRank: num(form.theWeekRank),

      hasLibrary: form.hasLibrary,
      hasLabs: form.hasLabs,
      hasSmartClassrooms: form.hasSmartClassrooms,
      hasSportsComplex: form.hasSportsComplex,
      hasAuditorium: form.hasAuditorium,
      hasCafeteria: form.hasCafeteria,
      hasMedicalCentre: form.hasMedicalCentre,
      hasBankAtm: form.hasBankAtm,
      hasWifi: form.hasWifi,
      hasSecurity: form.hasSecurity,

      hostelAvailable: form.hostelAvailable,
      boysHostel: form.boysHostel,
      girlsHostel: form.girlsHostel,
      hostelFoodQuality: str(form.hostelFoodQuality),
      hostelLaundry: form.hostelLaundry,
      hostelHousekeeping: form.hostelHousekeeping,
      hostelCurfew: str(form.hostelCurfew),
      hostelSecurity: str(form.hostelSecurity),
      hostelRules: str(form.hostelRules),
      nearbyPG: str(form.nearbyPG),
      nearbyFlats: str(form.nearbyFlats),

      clubs: str(form.clubs),
      societies: str(form.societies),
      technicalClubs: str(form.technicalClubs),
      culturalClubs: str(form.culturalClubs),
      annualFest: str(form.annualFest),
      sports: str(form.sports),
      ncc: form.ncc,
      nss: form.nss,
      studentEvents: str(form.studentEvents),

      attendancePolicy: str(form.attendancePolicy),
      academicPressure: str(form.academicPressure),
      codingCulture: str(form.codingCulture),
      startupCulture: str(form.startupCulture),
      researchCulture: str(form.researchCulture),
      diversity: str(form.diversity),
      campusSafety: str(form.campusSafety),
      antiRagging: str(form.antiRagging),
      studentSupport: str(form.studentSupport),
    };
    const onSettled = {
      onSuccess: () => {
        toast.success(initial ? 'College updated' : 'College created');
        onDone();
      },
      onError: (e: unknown) => toast.error((e as Error).message),
    };
    if (initial) update.mutate({ id: initial.id, ...payload }, onSettled);
    else create.mutate(payload, onSettled);
  };

  const set = <K extends keyof ReturnType<typeof emptyCollegeForm>>(key: K, value: ReturnType<typeof emptyCollegeForm>[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="grid gap-3 rounded-lg border border-dashed border-border p-4 sm:grid-cols-2">
      <Field label="Name">
        <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
      </Field>
      <Field label="NIRF rank">
        <Input type="number" value={form.nirfRank} onChange={(e) => set('nirfRank', e.target.value)} />
      </Field>
      <Field label="City">
        <Input value={form.city} onChange={(e) => set('city', e.target.value)} />
      </Field>
      <Field label="State">
        <Input value={form.state} onChange={(e) => set('state', e.target.value)} />
      </Field>
      <Field label="Type">
        <Input value={form.type} onChange={(e) => set('type', e.target.value)} placeholder="Engineering, Design…" />
      </Field>
      <Field label="Accreditation">
        <Input value={form.accreditation} onChange={(e) => set('accreditation', e.target.value)} placeholder="UGC · AICTE Approved" />
      </Field>
      <Field label="Admission criteria (line 1)">
        <Input value={form.admissionPrimary} onChange={(e) => set('admissionPrimary', e.target.value)} placeholder="Direct Admission" />
      </Field>
      <Field label="Admission criteria (line 2)">
        <Input value={form.admissionSecondary} onChange={(e) => set('admissionSecondary', e.target.value)} placeholder="Board score >50%" />
      </Field>
      <Field label="Tuition fee / year (₹)">
        <Input type="number" value={form.tuitionFeePerYear} onChange={(e) => set('tuitionFeePerYear', e.target.value)} />
      </Field>
      <div className="flex items-end gap-4">
        <BoolField label="Verified" checked={form.verified} onChange={(v) => set('verified', v)} />
        <BoolField label="Scholarship available" checked={form.hasScholarship} onChange={(v) => set('hasScholarship', v)} />
      </div>

      <SectionLabel>1. College Profile</SectionLabel>
      <Field label="Establishment year">
        <Input type="number" value={form.establishmentYear} onChange={(e) => set('establishmentYear', e.target.value)} />
      </Field>
      <Field label="Ownership">
        <Input value={form.ownership} onChange={(e) => set('ownership', e.target.value)} placeholder="Government, Private, Deemed…" />
      </Field>
      <Field label="Affiliation">
        <Input value={form.affiliation} onChange={(e) => set('affiliation', e.target.value)} />
      </Field>
      <Field label="Campus size">
        <Input value={form.campusSize} onChange={(e) => set('campusSize', e.target.value)} placeholder="68 Acres" />
      </Field>
      <Field label="Official website">
        <Input value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://…" />
      </Field>
      <Field label="Contact details">
        <Input value={form.contactDetails} onChange={(e) => set('contactDetails', e.target.value)} />
      </Field>
      <Field label="Brochure URL">
        <Input value={form.brochureUrl} onChange={(e) => set('brochureUrl', e.target.value)} placeholder="https://…" />
      </Field>
      <div className="sm:col-span-2">
        <Field label="About college">
          <Textarea value={form.aboutCollege} onChange={(e) => set('aboutCollege', e.target.value)} rows={3} />
        </Field>
      </div>

      <SectionLabel>2. Location</SectionLabel>
      <div className="sm:col-span-2">
        <Field label="Address">
          <Textarea value={form.address} onChange={(e) => set('address', e.target.value)} rows={2} />
        </Field>
      </div>
      <Field label="Google Maps URL">
        <Input value={form.googleMapsUrl} onChange={(e) => set('googleMapsUrl', e.target.value)} placeholder="https://…" />
      </Field>
      <Field label="Cost of living">
        <Input value={form.costOfLiving} onChange={(e) => set('costOfLiving', e.target.value)} />
      </Field>
      <Field label="Nearby metro">
        <Input value={form.nearbyMetro} onChange={(e) => set('nearbyMetro', e.target.value)} />
      </Field>
      <Field label="Nearby railway station">
        <Input value={form.nearbyRailwayStation} onChange={(e) => set('nearbyRailwayStation', e.target.value)} />
      </Field>
      <Field label="Nearby airport">
        <Input value={form.nearbyAirport} onChange={(e) => set('nearbyAirport', e.target.value)} />
      </Field>
      <Field label="Nearby restaurants">
        <Input value={form.nearbyRestaurants} onChange={(e) => set('nearbyRestaurants', e.target.value)} />
      </Field>
      <Field label="Nearby hospitals">
        <Input value={form.nearbyHospitals} onChange={(e) => set('nearbyHospitals', e.target.value)} />
      </Field>
      <Field label="Nearby shopping areas">
        <Input value={form.nearbyShoppingAreas} onChange={(e) => set('nearbyShoppingAreas', e.target.value)} />
      </Field>

      <SectionLabel>3. Rankings</SectionLabel>
      <Field label="QS rank">
        <Input type="number" value={form.qsRank} onChange={(e) => set('qsRank', e.target.value)} />
      </Field>
      <Field label="NAAC grade">
        <Input value={form.naacGrade} onChange={(e) => set('naacGrade', e.target.value)} placeholder="A+" />
      </Field>
      <Field label="NBA status">
        <Input value={form.nbaStatus} onChange={(e) => set('nbaStatus', e.target.value)} />
      </Field>
      <Field label="India Today rank">
        <Input type="number" value={form.indiaTodayRank} onChange={(e) => set('indiaTodayRank', e.target.value)} />
      </Field>
      <Field label="Outlook rank">
        <Input type="number" value={form.outlookRank} onChange={(e) => set('outlookRank', e.target.value)} />
      </Field>
      <Field label="The Week rank">
        <Input type="number" value={form.theWeekRank} onChange={(e) => set('theWeekRank', e.target.value)} />
      </Field>

      <SectionLabel>4. Infrastructure</SectionLabel>
      <div className="grid grid-cols-2 gap-2 sm:col-span-2 sm:grid-cols-3">
        <BoolField label="Library" checked={form.hasLibrary} onChange={(v) => set('hasLibrary', v)} />
        <BoolField label="Labs" checked={form.hasLabs} onChange={(v) => set('hasLabs', v)} />
        <BoolField label="Smart classrooms" checked={form.hasSmartClassrooms} onChange={(v) => set('hasSmartClassrooms', v)} />
        <BoolField label="Sports complex" checked={form.hasSportsComplex} onChange={(v) => set('hasSportsComplex', v)} />
        <BoolField label="Auditorium" checked={form.hasAuditorium} onChange={(v) => set('hasAuditorium', v)} />
        <BoolField label="Cafeteria" checked={form.hasCafeteria} onChange={(v) => set('hasCafeteria', v)} />
        <BoolField label="Medical centre" checked={form.hasMedicalCentre} onChange={(v) => set('hasMedicalCentre', v)} />
        <BoolField label="Bank & ATM" checked={form.hasBankAtm} onChange={(v) => set('hasBankAtm', v)} />
        <BoolField label="Wi-Fi" checked={form.hasWifi} onChange={(v) => set('hasWifi', v)} />
        <BoolField label="Security" checked={form.hasSecurity} onChange={(v) => set('hasSecurity', v)} />
      </div>

      <SectionLabel>5. Hostel</SectionLabel>
      <div className="grid grid-cols-2 gap-2 sm:col-span-2 sm:grid-cols-3">
        <BoolField label="Hostel available" checked={form.hostelAvailable} onChange={(v) => set('hostelAvailable', v)} />
        <BoolField label="Boys hostel" checked={form.boysHostel} onChange={(v) => set('boysHostel', v)} />
        <BoolField label="Girls hostel" checked={form.girlsHostel} onChange={(v) => set('girlsHostel', v)} />
        <BoolField label="Laundry" checked={form.hostelLaundry} onChange={(v) => set('hostelLaundry', v)} />
        <BoolField label="Housekeeping" checked={form.hostelHousekeeping} onChange={(v) => set('hostelHousekeeping', v)} />
      </div>
      <Field label="Food quality">
        <Input value={form.hostelFoodQuality} onChange={(e) => set('hostelFoodQuality', e.target.value)} />
      </Field>
      <Field label="Curfew">
        <Input value={form.hostelCurfew} onChange={(e) => set('hostelCurfew', e.target.value)} />
      </Field>
      <Field label="Hostel security">
        <Input value={form.hostelSecurity} onChange={(e) => set('hostelSecurity', e.target.value)} />
      </Field>
      <Field label="Nearby PG">
        <Input value={form.nearbyPG} onChange={(e) => set('nearbyPG', e.target.value)} />
      </Field>
      <Field label="Nearby flats">
        <Input value={form.nearbyFlats} onChange={(e) => set('nearbyFlats', e.target.value)} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Hostel rules">
          <Textarea value={form.hostelRules} onChange={(e) => set('hostelRules', e.target.value)} rows={2} />
        </Field>
      </div>

      <SectionLabel>6. Student Life</SectionLabel>
      <div className="grid grid-cols-2 gap-2 sm:col-span-2 sm:grid-cols-3">
        <BoolField label="NCC" checked={form.ncc} onChange={(v) => set('ncc', v)} />
        <BoolField label="NSS" checked={form.nss} onChange={(v) => set('nss', v)} />
      </div>
      <Field label="Clubs">
        <Input value={form.clubs} onChange={(e) => set('clubs', e.target.value)} />
      </Field>
      <Field label="Societies">
        <Input value={form.societies} onChange={(e) => set('societies', e.target.value)} />
      </Field>
      <Field label="Technical clubs">
        <Input value={form.technicalClubs} onChange={(e) => set('technicalClubs', e.target.value)} />
      </Field>
      <Field label="Cultural clubs">
        <Input value={form.culturalClubs} onChange={(e) => set('culturalClubs', e.target.value)} />
      </Field>
      <Field label="Annual fest">
        <Input value={form.annualFest} onChange={(e) => set('annualFest', e.target.value)} />
      </Field>
      <Field label="Sports">
        <Input value={form.sports} onChange={(e) => set('sports', e.target.value)} />
      </Field>
      <Field label="Events">
        <Input value={form.studentEvents} onChange={(e) => set('studentEvents', e.target.value)} />
      </Field>

      <SectionLabel>7. College Culture</SectionLabel>
      <Field label="Attendance policy">
        <Input value={form.attendancePolicy} onChange={(e) => set('attendancePolicy', e.target.value)} />
      </Field>
      <Field label="Academic pressure">
        <Input value={form.academicPressure} onChange={(e) => set('academicPressure', e.target.value)} />
      </Field>
      <Field label="Coding culture">
        <Input value={form.codingCulture} onChange={(e) => set('codingCulture', e.target.value)} />
      </Field>
      <Field label="Startup culture">
        <Input value={form.startupCulture} onChange={(e) => set('startupCulture', e.target.value)} />
      </Field>
      <Field label="Research culture">
        <Input value={form.researchCulture} onChange={(e) => set('researchCulture', e.target.value)} />
      </Field>
      <Field label="Diversity">
        <Input value={form.diversity} onChange={(e) => set('diversity', e.target.value)} />
      </Field>
      <Field label="Campus safety">
        <Input value={form.campusSafety} onChange={(e) => set('campusSafety', e.target.value)} />
      </Field>
      <Field label="Anti-ragging">
        <Input value={form.antiRagging} onChange={(e) => set('antiRagging', e.target.value)} />
      </Field>
      <Field label="Student support">
        <Input value={form.studentSupport} onChange={(e) => set('studentSupport', e.target.value)} />
      </Field>

      <div className="flex gap-2 pt-2 sm:col-span-2">
        <Button size="sm" onClick={submit} disabled={pending}>
          {initial ? 'Save' : 'Add college'}
        </Button>
        <Button size="sm" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ---------- College courses (per-college Field -> Degree -> Specialization) ----------

const emptyCourseForm = (initial?: CollegeCourse) => ({
  field: initial?.field ?? '',
  degree: initial?.degree ?? '',
  specialization: initial?.specialization ?? '',

  eligibility: initial?.eligibility ?? '',
  entranceExam: initial?.entranceExam ?? '',
  cutoff: initial?.cutoff ?? '',
  admissionProcess: initial?.admissionProcess ?? '',
  documents: initial?.documents ?? '',
  seatMatrix: initial?.seatMatrix ?? '',
  reservation: initial?.reservation ?? '',
  counselling: initial?.counselling ?? '',
  managementQuota: initial?.managementQuota ?? '',

  tuitionFee: initial?.tuitionFee?.toString() ?? '',
  registrationFee: initial?.registrationFee?.toString() ?? '',
  examFee: initial?.examFee?.toString() ?? '',
  hostelFee: initial?.hostelFee?.toString() ?? '',
  otherCharges: initial?.otherCharges?.toString() ?? '',
  totalCost: initial?.totalCost?.toString() ?? '',
  refundPolicy: initial?.refundPolicy ?? '',
  emiAvailable: initial?.emiAvailable ?? false,
  educationLoanAvailable: initial?.educationLoanAvailable ?? false,

  placementPct: initial?.placementPct?.toString() ?? '',
  avgPackage: initial?.avgPackage?.toString() ?? '',
  medianPackage: initial?.medianPackage?.toString() ?? '',
  highestPackage: initial?.highestPackage?.toString() ?? '',
  branchWisePlacement: initial?.branchWisePlacement ?? '',
  internshipPct: initial?.internshipPct?.toString() ?? '',
  ppoPct: initial?.ppoPct?.toString() ?? '',
  topRecruiters: initial?.topRecruiters ?? '',

  totalInvestment: initial?.totalInvestment?.toString() ?? '',
  averageSalary: initial?.averageSalary?.toString() ?? '',
  expectedRoi: initial?.expectedRoi ?? '',
  breakEvenTime: initial?.breakEvenTime ?? '',

  scholarshipsInfo: initial?.scholarshipsInfo ?? '',
  internshipsInfo: initial?.internshipsInfo ?? '',
  hackathons: initial?.hackathons ?? '',
  researchProjects: initial?.researchProjects ?? '',
  exchangeProgram: initial?.exchangeProgram ?? '',
  startupCell: initial?.startupCell ?? '',
  incubation: initial?.incubation ?? '',

  jobRoles: initial?.jobRoles ?? '',
  governmentJobs: initial?.governmentJobs ?? '',
  higherStudies: initial?.higherStudies ?? '',
  certifications: initial?.certifications ?? '',
  studyAbroad: initial?.studyAbroad ?? '',
  entrepreneurship: initial?.entrepreneurship ?? '',

  facultyRating: initial?.facultyRating?.toString() ?? '',
  placementRating: initial?.placementRating?.toString() ?? '',
  courseRating: initial?.courseRating?.toString() ?? '',
  curriculumRating: initial?.curriculumRating?.toString() ?? '',
  verifiedReviewsCount: initial?.verifiedReviewsCount?.toString() ?? '',

  qnaText: (initial?.qna ?? []).map((qa) => `${qa.question} :: ${qa.answer}`).join('\n'),
});

function CollegeCourseForm({
  collegeId,
  initial,
  onDone,
}: {
  collegeId: string;
  initial?: CollegeCourse;
  onDone: () => void;
}) {
  const [form, setForm] = useState(emptyCourseForm(initial));
  const create = useCreateCollegeCourse(collegeId);
  const update = useUpdateCollegeCourse(collegeId);
  const pending = create.isPending || update.isPending;

  const set = <K extends keyof ReturnType<typeof emptyCourseForm>>(key: K, value: ReturnType<typeof emptyCourseForm>[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    if (!form.field.trim() || !form.degree.trim()) return toast.error('Field and degree are required');
    const str = (v: string) => v.trim() || undefined;
    const num = (v: string) => (v ? Number(v) : undefined);
    const qna = form.qnaText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [question, ...rest] = line.split('::');
        return { question: question.trim(), answer: rest.join('::').trim() };
      })
      .filter((qa) => qa.question && qa.answer);
    const payload = {
      field: form.field.trim(),
      degree: form.degree.trim(),
      specialization: str(form.specialization),

      eligibility: str(form.eligibility),
      entranceExam: str(form.entranceExam),
      cutoff: str(form.cutoff),
      admissionProcess: str(form.admissionProcess),
      documents: str(form.documents),
      seatMatrix: str(form.seatMatrix),
      reservation: str(form.reservation),
      counselling: str(form.counselling),
      managementQuota: str(form.managementQuota),

      tuitionFee: num(form.tuitionFee),
      registrationFee: num(form.registrationFee),
      examFee: num(form.examFee),
      hostelFee: num(form.hostelFee),
      otherCharges: num(form.otherCharges),
      totalCost: num(form.totalCost),
      refundPolicy: str(form.refundPolicy),
      emiAvailable: form.emiAvailable,
      educationLoanAvailable: form.educationLoanAvailable,

      placementPct: num(form.placementPct),
      avgPackage: num(form.avgPackage),
      medianPackage: num(form.medianPackage),
      highestPackage: num(form.highestPackage),
      branchWisePlacement: str(form.branchWisePlacement),
      internshipPct: num(form.internshipPct),
      ppoPct: num(form.ppoPct),
      topRecruiters: str(form.topRecruiters),

      totalInvestment: num(form.totalInvestment),
      averageSalary: num(form.averageSalary),
      expectedRoi: str(form.expectedRoi),
      breakEvenTime: str(form.breakEvenTime),

      scholarshipsInfo: str(form.scholarshipsInfo),
      internshipsInfo: str(form.internshipsInfo),
      hackathons: str(form.hackathons),
      researchProjects: str(form.researchProjects),
      exchangeProgram: str(form.exchangeProgram),
      startupCell: str(form.startupCell),
      incubation: str(form.incubation),

      jobRoles: str(form.jobRoles),
      governmentJobs: str(form.governmentJobs),
      higherStudies: str(form.higherStudies),
      certifications: str(form.certifications),
      studyAbroad: str(form.studyAbroad),
      entrepreneurship: str(form.entrepreneurship),

      facultyRating: num(form.facultyRating),
      placementRating: num(form.placementRating),
      courseRating: num(form.courseRating),
      curriculumRating: num(form.curriculumRating),
      verifiedReviewsCount: num(form.verifiedReviewsCount),

      qna,
    };
    const onSettled = {
      onSuccess: () => {
        toast.success(initial ? 'Course updated' : 'Course added');
        onDone();
      },
      onError: (e: unknown) => toast.error((e as Error).message),
    };
    if (initial) update.mutate({ id: initial.id, ...payload }, onSettled);
    else create.mutate(payload, onSettled);
  };

  return (
    <div className="grid gap-3 rounded-lg border border-dashed border-border bg-background p-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <CoursePathSelector
          value={{ field: form.field, degree: form.degree, specialization: form.specialization }}
          onChange={(v) => setForm((f) => ({ ...f, field: v.field, degree: v.degree, specialization: v.specialization }))}
        />
      </div>

      <SectionLabel>1. Admissions</SectionLabel>
      <Field label="Eligibility">
        <Input value={form.eligibility} onChange={(e) => set('eligibility', e.target.value)} />
      </Field>
      <Field label="Entrance exam">
        <Input value={form.entranceExam} onChange={(e) => set('entranceExam', e.target.value)} placeholder="CAT/MAT/XAT" />
      </Field>
      <Field label="Cutoff">
        <Input value={form.cutoff} onChange={(e) => set('cutoff', e.target.value)} placeholder="75 Percentile" />
      </Field>
      <Field label="Admission process">
        <Input value={form.admissionProcess} onChange={(e) => set('admissionProcess', e.target.value)} />
      </Field>
      <Field label="Documents">
        <Input value={form.documents} onChange={(e) => set('documents', e.target.value)} />
      </Field>
      <Field label="Seat matrix">
        <Input value={form.seatMatrix} onChange={(e) => set('seatMatrix', e.target.value)} />
      </Field>
      <Field label="Reservation">
        <Input value={form.reservation} onChange={(e) => set('reservation', e.target.value)} />
      </Field>
      <Field label="Counselling">
        <Input value={form.counselling} onChange={(e) => set('counselling', e.target.value)} />
      </Field>
      <Field label="Management quota">
        <Input value={form.managementQuota} onChange={(e) => set('managementQuota', e.target.value)} />
      </Field>

      <SectionLabel>2. Fees</SectionLabel>
      <Field label="Tuition fee (₹)">
        <Input type="number" value={form.tuitionFee} onChange={(e) => set('tuitionFee', e.target.value)} />
      </Field>
      <Field label="Registration fee (₹)">
        <Input type="number" value={form.registrationFee} onChange={(e) => set('registrationFee', e.target.value)} />
      </Field>
      <Field label="Exam fee (₹)">
        <Input type="number" value={form.examFee} onChange={(e) => set('examFee', e.target.value)} />
      </Field>
      <Field label="Hostel fee (₹)">
        <Input type="number" value={form.hostelFee} onChange={(e) => set('hostelFee', e.target.value)} />
      </Field>
      <Field label="Other charges (₹)">
        <Input type="number" value={form.otherCharges} onChange={(e) => set('otherCharges', e.target.value)} />
      </Field>
      <Field label="Total cost (₹)">
        <Input type="number" value={form.totalCost} onChange={(e) => set('totalCost', e.target.value)} />
      </Field>
      <Field label="Refund policy">
        <Input value={form.refundPolicy} onChange={(e) => set('refundPolicy', e.target.value)} />
      </Field>
      <div className="flex items-end gap-4">
        <BoolField label="EMI available" checked={form.emiAvailable} onChange={(v) => set('emiAvailable', v)} />
        <BoolField label="Education loan" checked={form.educationLoanAvailable} onChange={(v) => set('educationLoanAvailable', v)} />
      </div>

      <SectionLabel>3. Placements</SectionLabel>
      <Field label="Placement %">
        <Input type="number" value={form.placementPct} onChange={(e) => set('placementPct', e.target.value)} />
      </Field>
      <Field label="Average package (LPA)">
        <Input type="number" value={form.avgPackage} onChange={(e) => set('avgPackage', e.target.value)} />
      </Field>
      <Field label="Median package (LPA)">
        <Input type="number" value={form.medianPackage} onChange={(e) => set('medianPackage', e.target.value)} />
      </Field>
      <Field label="Highest package (LPA)">
        <Input type="number" value={form.highestPackage} onChange={(e) => set('highestPackage', e.target.value)} />
      </Field>
      <Field label="Branch-wise placement">
        <Input value={form.branchWisePlacement} onChange={(e) => set('branchWisePlacement', e.target.value)} />
      </Field>
      <Field label="Internship %">
        <Input type="number" value={form.internshipPct} onChange={(e) => set('internshipPct', e.target.value)} />
      </Field>
      <Field label="PPO %">
        <Input type="number" value={form.ppoPct} onChange={(e) => set('ppoPct', e.target.value)} />
      </Field>
      <Field label="Top recruiters">
        <Input value={form.topRecruiters} onChange={(e) => set('topRecruiters', e.target.value)} placeholder="Deloitte, KPMG, HDFC Bank" />
      </Field>

      <SectionLabel>4. ROI</SectionLabel>
      <Field label="Total investment (₹)">
        <Input type="number" value={form.totalInvestment} onChange={(e) => set('totalInvestment', e.target.value)} />
      </Field>
      <Field label="Average salary (LPA)">
        <Input type="number" value={form.averageSalary} onChange={(e) => set('averageSalary', e.target.value)} />
      </Field>
      <Field label="Expected ROI">
        <Input value={form.expectedRoi} onChange={(e) => set('expectedRoi', e.target.value)} />
      </Field>
      <Field label="Break-even time">
        <Input value={form.breakEvenTime} onChange={(e) => set('breakEvenTime', e.target.value)} />
      </Field>

      <SectionLabel>5. Opportunities</SectionLabel>
      <Field label="Scholarships">
        <Input value={form.scholarshipsInfo} onChange={(e) => set('scholarshipsInfo', e.target.value)} />
      </Field>
      <Field label="Internships">
        <Input value={form.internshipsInfo} onChange={(e) => set('internshipsInfo', e.target.value)} />
      </Field>
      <Field label="Hackathons">
        <Input value={form.hackathons} onChange={(e) => set('hackathons', e.target.value)} />
      </Field>
      <Field label="Research projects">
        <Input value={form.researchProjects} onChange={(e) => set('researchProjects', e.target.value)} />
      </Field>
      <Field label="Exchange program">
        <Input value={form.exchangeProgram} onChange={(e) => set('exchangeProgram', e.target.value)} />
      </Field>
      <Field label="Startup cell">
        <Input value={form.startupCell} onChange={(e) => set('startupCell', e.target.value)} />
      </Field>
      <Field label="Incubation">
        <Input value={form.incubation} onChange={(e) => set('incubation', e.target.value)} />
      </Field>

      <SectionLabel>6. Career Opportunities</SectionLabel>
      <Field label="Job roles">
        <Input value={form.jobRoles} onChange={(e) => set('jobRoles', e.target.value)} />
      </Field>
      <Field label="Government jobs">
        <Input value={form.governmentJobs} onChange={(e) => set('governmentJobs', e.target.value)} />
      </Field>
      <Field label="Higher studies">
        <Input value={form.higherStudies} onChange={(e) => set('higherStudies', e.target.value)} />
      </Field>
      <Field label="Certifications">
        <Input value={form.certifications} onChange={(e) => set('certifications', e.target.value)} />
      </Field>
      <Field label="Study abroad">
        <Input value={form.studyAbroad} onChange={(e) => set('studyAbroad', e.target.value)} />
      </Field>
      <Field label="Entrepreneurship">
        <Input value={form.entrepreneurship} onChange={(e) => set('entrepreneurship', e.target.value)} />
      </Field>

      <SectionLabel>7. Reviews (curated)</SectionLabel>
      <Field label="Faculty rating (/5)">
        <Input type="number" value={form.facultyRating} onChange={(e) => set('facultyRating', e.target.value)} />
      </Field>
      <Field label="Placement rating (/5)">
        <Input type="number" value={form.placementRating} onChange={(e) => set('placementRating', e.target.value)} />
      </Field>
      <Field label="Course rating (/5)">
        <Input type="number" value={form.courseRating} onChange={(e) => set('courseRating', e.target.value)} />
      </Field>
      <Field label="Curriculum rating (/5)">
        <Input type="number" value={form.curriculumRating} onChange={(e) => set('curriculumRating', e.target.value)} />
      </Field>
      <Field label="Verified reviews count">
        <Input type="number" value={form.verifiedReviewsCount} onChange={(e) => set('verifiedReviewsCount', e.target.value)} />
      </Field>

      <SectionLabel>8. Course-specific Q&amp;A</SectionLabel>
      <div className="sm:col-span-2">
        <Field label="One per line: question :: answer">
          <Textarea
            value={form.qnaText}
            onChange={(e) => set('qnaText', e.target.value)}
            rows={3}
            placeholder={'Is CSE worth it? :: Yes, given strong placement outcomes.'}
          />
        </Field>
      </div>

      <div className="flex gap-2 pt-2 sm:col-span-2">
        <Button size="sm" onClick={submit} disabled={pending}>
          {initial ? 'Save course' : 'Add course'}
        </Button>
        <Button size="sm" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function CollegeCoursesManager({ college }: { college: College }) {
  const { data: full, isLoading } = useCollege(college.slug);
  const [editing, setEditing] = useState<CollegeCourse | 'new' | null>(null);
  const del = useDeleteCollegeCourse(college.id);
  const courses = full?.courses ?? [];

  return (
    <div className="space-y-3 border-t border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Courses offered by {college.name}</p>
        {editing !== 'new' && (
          <Button size="sm" variant="outline" onClick={() => setEditing('new')}>
            + Add course
          </Button>
        )}
      </div>

      {editing === 'new' && <CollegeCourseForm collegeId={college.id} onDone={() => setEditing(null)} />}

      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-background">
          {courses.length === 0 && <p className="p-3 text-sm text-muted-foreground">No courses added yet.</p>}
          {courses.map((c) =>
            editing !== 'new' && editing?.id === c.id ? (
              <div key={c.id} className="p-2">
                <CollegeCourseForm collegeId={college.id} initial={c} onDone={() => setEditing(null)} />
              </div>
            ) : (
              <div key={c.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                <p className="min-w-0 font-semibold">
                  {c.field} → {c.degree}
                  {c.specialization ? ` → ${c.specialization}` : ''}
                </p>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(c)}>
                    Edit
                  </Button>
                  <ConfirmDeleteButton
                    onConfirm={() =>
                      del.mutate(c.id, {
                        onSuccess: () => toast.success('Course deleted'),
                        onError: (e) => toast.error((e as Error).message),
                      })
                    }
                  />
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function CollegesSection() {
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<College | 'new' | null>(null);
  const [managingCourses, setManagingCourses] = useState<string | null>(null);
  const { data, isLoading } = useAdminColleges(q);
  const del = useDeleteCollege();
  const colleges = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Colleges</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="Search colleges…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
          <Button size="sm" onClick={() => setEditing('new')}>
            + Add college
          </Button>
        </div>

        {editing === 'new' && <CollegeForm onDone={() => setEditing(null)} />}

        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {colleges.length === 0 && <p className="p-4 text-sm text-muted-foreground">No colleges yet.</p>}
            {colleges.map((c) =>
              editing !== 'new' && editing?.id === c.id ? (
                <div key={c.id} className="p-2">
                  <CollegeForm initial={c} onDone={() => setEditing(null)} />
                </div>
              ) : (
                <div key={c.id}>
                  <div className="flex items-center justify-between gap-3 p-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-muted-foreground">
                        {[c.city, c.state].filter(Boolean).join(', ')}
                        {c.nirfRank ? ` · NIRF #${c.nirfRank}` : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setManagingCourses(managingCourses === c.id ? null : c.id)}
                      >
                        {managingCourses === c.id ? 'Hide courses' : 'Manage courses'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(c)}>
                        Edit
                      </Button>
                      <ConfirmDeleteButton
                        onConfirm={() =>
                          del.mutate(c.id, {
                            onSuccess: () => toast.success('College deleted'),
                            onError: (e) => toast.error((e as Error).message),
                          })
                        }
                      />
                    </div>
                  </div>
                  {managingCourses === c.id && <CollegeCoursesManager college={c} />}
                </div>
              ),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Scholarships ----------

function ScholarshipForm({ initial, onDone }: { initial?: Scholarship; onDone: () => void }) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    provider: initial?.provider ?? '',
    amountPerYear: initial?.amountPerYear?.toString() ?? '',
    category: initial?.category ?? '',
    eligibilityText: initial?.eligibilityText ?? '',
    applyUrl: initial?.applyUrl ?? '',
    deadline: initial?.deadline ? initial.deadline.slice(0, 10) : '',
  });
  const create = useCreateScholarship();
  const update = useUpdateScholarship();
  const pending = create.isPending || update.isPending;
  const { data: categories } = useScholarshipCategories();

  const submit = () => {
    if (!form.title.trim() || !form.provider.trim() || !form.deadline) {
      return toast.error('Title, provider, and deadline are required');
    }
    const payload = {
      title: form.title.trim(),
      provider: form.provider.trim(),
      amountPerYear: Number(form.amountPerYear) || 0,
      category: form.category.trim() || 'General',
      eligibilityText: form.eligibilityText.trim() || 'See apply link for details',
      applyUrl: form.applyUrl.trim(),
      deadline: form.deadline,
      eligibleCourses: initial?.eligibleCourses ?? [],
      eligibleStates: initial?.eligibleStates ?? [],
    };
    const onSettled = {
      onSuccess: () => {
        toast.success(initial ? 'Scholarship updated' : 'Scholarship created');
        onDone();
      },
      onError: (e: unknown) => toast.error((e as Error).message),
    };
    if (initial) update.mutate({ id: initial.id, ...payload }, onSettled);
    else create.mutate(payload, onSettled);
  };

  return (
    <div className="grid gap-3 rounded-lg border border-dashed border-border p-4 sm:grid-cols-2">
      <Field label="Title">
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </Field>
      <Field label="Provider">
        <Input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
      </Field>
      <Field label="Amount / year (₹)">
        <Input
          type="number"
          value={form.amountPerYear}
          onChange={(e) => setForm({ ...form, amountPerYear: e.target.value })}
        />
      </Field>
      <Field label="Category">
        <SearchableSelect
          label="Category"
          value={form.category}
          onChange={(v) => setForm({ ...form, category: v })}
          options={categories ?? []}
          placeholder="Select or type a category"
          searchPlaceholder="Search or type: Merit, Need-based…"
        />
      </Field>
      <Field label="Apply URL">
        <Input value={form.applyUrl} onChange={(e) => setForm({ ...form, applyUrl: e.target.value })} />
      </Field>
      <Field label="Deadline">
        <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Eligibility">
          <Textarea
            value={form.eligibilityText}
            onChange={(e) => setForm({ ...form, eligibilityText: e.target.value })}
            rows={2}
          />
        </Field>
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <Button size="sm" onClick={submit} disabled={pending}>
          {initial ? 'Save' : 'Add scholarship'}
        </Button>
        <Button size="sm" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function ScholarshipsSection() {
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Scholarship | 'new' | null>(null);
  const { data, isLoading } = useAdminScholarships(q);
  const del = useDeleteScholarship();
  const scholarships = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scholarships</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="Search scholarships…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
          <Button size="sm" onClick={() => setEditing('new')}>
            + Add scholarship
          </Button>
        </div>

        {editing === 'new' && <ScholarshipForm onDone={() => setEditing(null)} />}

        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {scholarships.length === 0 && <p className="p-4 text-sm text-muted-foreground">No scholarships yet.</p>}
            {scholarships.map((s) =>
              editing !== 'new' && editing?.id === s.id ? (
                <div key={s.id} className="p-2">
                  <ScholarshipForm initial={s} onDone={() => setEditing(null)} />
                </div>
              ) : (
                <div key={s.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold">{s.title}</p>
                    <p className="text-muted-foreground">
                      {s.provider} · ₹{s.amountPerYear.toLocaleString()}/yr · {s.category}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(s)}>
                      Edit
                    </Button>
                    <ConfirmDeleteButton
                      onConfirm={() =>
                        del.mutate(s.id, {
                          onSuccess: () => toast.success('Scholarship deleted'),
                          onError: (e) => toast.error((e as Error).message),
                        })
                      }
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Internship listings ----------

function InternshipListingForm({ initial, onDone }: { initial?: InternshipListingAdmin; onDone: () => void }) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    company: initial?.company ?? '',
    location: initial?.location ?? '',
    isRemote: initial?.isRemote ?? false,
    type: initial?.type ?? 'INTERNSHIP',
    stipend: initial?.stipend?.toString() ?? '',
    duration: initial?.duration ?? '',
    category: initial?.category ?? '',
    description: initial?.description ?? '',
    applyUrl: initial?.applyUrl ?? '',
  });
  const create = useCreateInternshipListing();
  const update = useUpdateInternshipListing();
  const pending = create.isPending || update.isPending;
  const { data: categories } = useInternshipCategories();

  const submit = () => {
    if (!form.title.trim() || !form.company.trim() || !form.applyUrl.trim()) {
      return toast.error('Title, company, and apply URL are required');
    }
    const payload = {
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim() || 'Remote',
      isRemote: form.isRemote,
      type: form.type,
      stipend: form.stipend ? Number(form.stipend) : undefined,
      duration: form.duration.trim() || 'Flexible',
      category: form.category.trim() || 'General',
      description: form.description.trim() || 'See apply link for details',
      applyUrl: form.applyUrl.trim(),
    };
    const onSettled = {
      onSuccess: () => {
        toast.success(initial ? 'Internship listing updated' : 'Internship listing created');
        onDone();
      },
      onError: (e: unknown) => toast.error((e as Error).message),
    };
    if (initial) update.mutate({ id: initial.id, ...payload }, onSettled);
    else create.mutate(payload, onSettled);
  };

  return (
    <div className="grid gap-3 rounded-lg border border-dashed border-border p-4 sm:grid-cols-2">
      <Field label="Title">
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </Field>
      <Field label="Company">
        <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
      </Field>
      <Field label="Location">
        <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
      </Field>
      <Field label="Remote?">
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={form.isRemote ? 'yes' : 'no'}
          onChange={(e) => setForm({ ...form, isRemote: e.target.value === 'yes' })}
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </Field>
      <Field label="Opportunity type">
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as OpportunityType })}
        >
          {Object.entries(OPPORTUNITY_TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Stipend (₹/month, blank = unpaid)">
        <Input type="number" value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} />
      </Field>
      <Field label="Duration">
        <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="3 months" />
      </Field>
      <Field label="Category">
        <SearchableSelect
          label="Category"
          value={form.category}
          onChange={(v) => setForm({ ...form, category: v })}
          options={categories ?? []}
          placeholder="Select or type a category"
          searchPlaceholder="Search or type: Engineering, Design…"
        />
      </Field>
      <Field label="Apply URL">
        <Input value={form.applyUrl} onChange={(e) => setForm({ ...form, applyUrl: e.target.value })} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Description">
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
        </Field>
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <Button size="sm" onClick={submit} disabled={pending}>
          {initial ? 'Save' : 'Add internship'}
        </Button>
        <Button size="sm" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function InternshipListingsSection() {
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<InternshipListingAdmin | 'new' | null>(null);
  const { data, isLoading } = useAdminInternshipListings(q);
  const del = useDeleteInternshipListing();
  const listings = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Internships</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="Search internships…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
          <Button size="sm" onClick={() => setEditing('new')}>
            + Add internship
          </Button>
        </div>

        {editing === 'new' && <InternshipListingForm onDone={() => setEditing(null)} />}

        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {listings.length === 0 && <p className="p-4 text-sm text-muted-foreground">No internship listings yet.</p>}
            {listings.map((l) =>
              editing !== 'new' && editing?.id === l.id ? (
                <div key={l.id} className="p-2">
                  <InternshipListingForm initial={l} onDone={() => setEditing(null)} />
                </div>
              ) : (
                <div key={l.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {l.title} · {l.company}
                    </p>
                    <p className="text-muted-foreground">
                      {OPPORTUNITY_TYPE_LABEL[l.type]} · {l.isRemote ? 'Remote' : l.location} · {l.category} ·{' '}
                      {l.stipend ? `₹${l.stipend.toLocaleString()}/mo` : 'Unpaid'}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(l)}>
                      Edit
                    </Button>
                    <ConfirmDeleteButton
                      onConfirm={() =>
                        del.mutate(l.id, {
                          onSuccess: () => toast.success('Internship listing deleted'),
                          onError: (e) => toast.error((e as Error).message),
                        })
                      }
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CatalogManager() {
  return (
    <div className="space-y-6">
      <CollegesSection />
      <ScholarshipsSection />
      <InternshipListingsSection />
    </div>
  );
}
