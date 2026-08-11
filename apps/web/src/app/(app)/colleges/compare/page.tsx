'use client';

import { Suspense, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Bookmark,
  Building2,
  Heart,
  Home as HomeIcon,
  MapPin,
  Scale,
  Search as SearchIcon,
  ShieldCheck,
  Star,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { PageHero } from '@/components/page-hero';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useCollege, useColleges, type College } from '@/hooks/use-colleges';
import { useCollegeShortlist } from '@/hooks/use-college-shortlist';

const MAX_COMPARE = 3;

const yesNo = (b?: boolean) => (b ? 'Available' : undefined);
const money = (n?: number | null) => (n ? `₹${n.toLocaleString()}` : undefined);

function parseSlugs(raw: string | null): string[] {
  if (!raw) return [];
  return raw.split(',').filter(Boolean).slice(0, MAX_COMPARE);
}

// One label + one value per selected college. Unlike the single-college
// About page (which hides empty fields to declutter), a compare table shows
// every row for every college — "this one has no hostel" is itself useful
// signal, and hiding it would misalign rows across columns.
function CompareRow({ label, values }: { label: string; values: ReactNode[] }) {
  return (
    <div
      className="grid border-b border-border last:border-b-0"
      style={{ gridTemplateColumns: `160px repeat(${values.length}, minmax(200px, 1fr))` }}
    >
      <div className="sticky left-0 z-10 bg-background px-3 py-3 text-[13px] font-medium text-muted-foreground">
        {label}
      </div>
      {values.map((v, i) => (
        <div key={i} className="px-3 py-3 text-[13.5px] font-semibold">
          {v === null || v === undefined || v === '' ? <span className="font-normal text-muted-foreground/60">—</span> : v}
        </div>
      ))}
    </div>
  );
}

function CompareSection({
  icon: Icon,
  title,
  rows,
}: {
  icon: typeof Building2;
  title: string;
  rows: { label: string; values: ReactNode[] }[];
}) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border bg-accent/40 px-4 py-3">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-display text-[15px] font-semibold">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-fit">
          {rows.map((r) => (
            <CompareRow key={r.label} label={r.label} values={r.values} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CollegeColumnHeader({ college, onRemove }: { college: College; onRemove: () => void }) {
  return (
    <div className="min-w-0">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/colleges/${college.slug}`} className="min-w-0 flex-1 font-fraunces text-[16px] font-semibold leading-tight hover:underline">
          {college.name}
        </Link>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${college.name} from comparison`}
          className="grid h-6 w-6 flex-none place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {(college.city || college.state) && (
        <p className="mt-0.5 text-[12.5px] text-muted-foreground">{[college.city, college.state].filter(Boolean).join(', ')}</p>
      )}
      {college.verified && (
        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#E4EFF6] px-2 py-0.5 text-[11px] font-semibold text-[#1E5A82]">
          <ShieldCheck className="h-3 w-3" /> Verified
        </span>
      )}
    </div>
  );
}

function CollegePicker({
  selected,
  onAdd,
}: {
  selected: string[];
  onAdd: (slug: string) => void;
}) {
  const [q, setQ] = useState('');
  const { data } = useColleges({ q, sort: 'rating' });
  const { slugs: shortlistSlugs } = useCollegeShortlist();
  const results = (data?.pages.flatMap((p) => p.data) ?? []).filter((c) => !selected.includes(c.slug)).slice(0, 6);
  const shortlistToAdd = shortlistSlugs.filter((s) => !selected.includes(s));
  const full = selected.length >= MAX_COMPARE;

  return (
    <div className="space-y-3">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={full ? `Comparing ${MAX_COMPARE} colleges — remove one to add another` : 'Search a college to add…'}
          className="pl-9"
          disabled={full}
        />
      </div>

      {q && !full && results.length > 0 && (
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {results.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onAdd(c.slug);
                setQ('');
              }}
              className="flex w-full items-center justify-between gap-3 border-b border-border px-4 py-3 text-left text-sm last:border-b-0 hover:bg-accent"
            >
              <span className="min-w-0 flex-1 truncate font-semibold">{c.name}</span>
              <span className="flex-none text-xs text-muted-foreground">{[c.city, c.state].filter(Boolean).join(', ')}</span>
            </button>
          ))}
        </div>
      )}

      {!full && shortlistToAdd.length > 0 && !q && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <Bookmark className="h-3.5 w-3.5" /> From your shortlist:
          </span>
          {shortlistToAdd.map((slug) => (
            <ShortlistChip key={slug} slug={slug} onAdd={onAdd} />
          ))}
        </div>
      )}
    </div>
  );
}

function ShortlistChip({ slug, onAdd }: { slug: string; onAdd: (slug: string) => void }) {
  const { data: college } = useCollege(slug);
  if (!college) return null;
  return (
    <button
      type="button"
      onClick={() => onAdd(slug)}
      className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary/60 hover:bg-primary/5"
    >
      + {college.name}
    </button>
  );
}

function ComparePageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [slugs, setSlugs] = useState<string[]>(() => parseSlugs(params.get('slugs')));

  const update = (next: string[]) => {
    setSlugs(next);
    router.replace(next.length ? `/colleges/compare?slugs=${next.join(',')}` : '/colleges/compare', { scroll: false });
  };
  const addSlug = (slug: string) => {
    if (slugs.includes(slug) || slugs.length >= MAX_COMPARE) return;
    update([...slugs, slug]);
  };
  const removeSlug = (slug: string) => update(slugs.filter((s) => s !== slug));

  // Fixed number of hook calls (never conditional) — up to MAX_COMPARE slots,
  // each individually gated by useCollege's own `enabled: !!slug`.
  const q0 = useCollege(slugs[0] ?? '');
  const q1 = useCollege(slugs[1] ?? '');
  const q2 = useCollege(slugs[2] ?? '');
  const slotQueries = [q0, q1, q2].slice(0, slugs.length);
  const colleges = useMemo(() => slotQueries.map((q) => q.data).filter((c): c is College => !!c), [slotQueries]);
  const stillLoading = slugs.length > 0 && colleges.length < slugs.length && slotQueries.every((q) => !q.isError);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHero eyebrow="Compare" title="Compare colleges" accent="side by side." sub="Pick up to 3 colleges and see fees, placements, rankings and campus life next to each other." />

      <CollegePicker selected={slugs} onAdd={addSlug} />

      {slugs.length === 0 && (
        <EmptyState
          icon={Scale}
          title="Nothing to compare yet"
          description="Search for a college above, or add from your shortlist, to start comparing."
        />
      )}

      {stillLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full rounded-[18px]" />
          <Skeleton className="h-40 w-full rounded-[18px]" />
        </div>
      )}

      {!stillLoading && colleges.length > 0 && (
        <>
          <div
            className="grid overflow-x-auto"
            style={{ gridTemplateColumns: `160px repeat(${colleges.length}, minmax(200px, 1fr))` }}
          >
            <div />
            {colleges.map((c, i) => (
              <div key={c.id} className="px-3">
                <CollegeColumnHeader college={c} onRemove={() => removeSlug(slugs[i])} />
              </div>
            ))}
          </div>

          <CompareSection
            icon={Star}
            title="Quick Facts"
            rows={[
              { label: 'Type', values: colleges.map((c) => c.type) },
              { label: 'NIRF Rank', values: colleges.map((c) => (c.nirfRank ? `#${c.nirfRank}` : undefined)) },
              {
                label: 'Rating',
                values: colleges.map((c) => (c.avgRating ? `★ ${c.avgRating.toFixed(1)} (${c.reviewCount})` : undefined)),
              },
              { label: 'Tuition Fee / Year', values: colleges.map((c) => money(c.tuitionFeePerYear)) },
              { label: 'Avg Placement Package', values: colleges.map((c) => money(c.avgPlacementPackage)) },
              { label: 'Scholarship', values: colleges.map((c) => yesNo(c.hasScholarship)) },
              { label: 'Admission (Primary)', values: colleges.map((c) => c.admissionPrimary) },
              { label: 'Admission (Secondary)', values: colleges.map((c) => c.admissionSecondary) },
              { label: 'University', values: colleges.map((c) => c.university?.name) },
            ]}
          />

          <CompareSection
            icon={Building2}
            title="College Profile"
            rows={[
              { label: 'Establishment Year', values: colleges.map((c) => c.establishmentYear) },
              { label: 'Ownership', values: colleges.map((c) => c.ownership) },
              { label: 'Affiliation', values: colleges.map((c) => c.affiliation) },
              { label: 'Accreditations', values: colleges.map((c) => c.accreditation) },
              { label: 'Campus Size', values: colleges.map((c) => c.campusSize) },
            ]}
          />

          <CompareSection
            icon={MapPin}
            title="Location"
            rows={[
              { label: 'Nearby Metro', values: colleges.map((c) => c.nearbyMetro) },
              { label: 'Railway Station', values: colleges.map((c) => c.nearbyRailwayStation) },
              { label: 'Airport', values: colleges.map((c) => c.nearbyAirport) },
              { label: 'Cost of Living', values: colleges.map((c) => c.costOfLiving) },
            ]}
          />

          <CompareSection
            icon={Trophy}
            title="Rankings"
            rows={[
              { label: 'NIRF', values: colleges.map((c) => c.nirfRank) },
              { label: 'QS', values: colleges.map((c) => c.qsRank) },
              { label: 'NAAC', values: colleges.map((c) => c.naacGrade) },
              { label: 'NBA', values: colleges.map((c) => c.nbaStatus) },
              { label: 'India Today', values: colleges.map((c) => c.indiaTodayRank) },
              { label: 'Outlook', values: colleges.map((c) => c.outlookRank) },
              { label: 'The Week', values: colleges.map((c) => c.theWeekRank) },
            ]}
          />

          <CompareSection
            icon={Building2}
            title="Infrastructure"
            rows={[
              { label: 'Library', values: colleges.map((c) => yesNo(c.hasLibrary)) },
              { label: 'Labs', values: colleges.map((c) => yesNo(c.hasLabs)) },
              { label: 'Smart Classrooms', values: colleges.map((c) => yesNo(c.hasSmartClassrooms)) },
              { label: 'Sports Complex', values: colleges.map((c) => yesNo(c.hasSportsComplex)) },
              { label: 'Auditorium', values: colleges.map((c) => yesNo(c.hasAuditorium)) },
              { label: 'Cafeteria', values: colleges.map((c) => yesNo(c.hasCafeteria)) },
              { label: 'Medical Centre', values: colleges.map((c) => yesNo(c.hasMedicalCentre)) },
              { label: 'Wi-Fi', values: colleges.map((c) => yesNo(c.hasWifi)) },
              { label: 'Security', values: colleges.map((c) => yesNo(c.hasSecurity)) },
            ]}
          />

          <CompareSection
            icon={HomeIcon}
            title="Hostel"
            rows={[
              { label: 'Boys Hostel', values: colleges.map((c) => yesNo(c.boysHostel)) },
              { label: 'Girls Hostel', values: colleges.map((c) => yesNo(c.girlsHostel)) },
              { label: 'Food Quality', values: colleges.map((c) => c.hostelFoodQuality) },
              { label: 'Curfew', values: colleges.map((c) => c.hostelCurfew) },
              { label: 'Security', values: colleges.map((c) => c.hostelSecurity) },
            ]}
          />

          <CompareSection
            icon={Users}
            title="Student Life"
            rows={[
              { label: 'Clubs', values: colleges.map((c) => c.clubs) },
              { label: 'Technical Clubs', values: colleges.map((c) => c.technicalClubs) },
              { label: 'Cultural Clubs', values: colleges.map((c) => c.culturalClubs) },
              { label: 'Annual Fest', values: colleges.map((c) => c.annualFest) },
              { label: 'Sports', values: colleges.map((c) => c.sports) },
              { label: 'NCC', values: colleges.map((c) => yesNo(c.ncc)) },
              { label: 'NSS', values: colleges.map((c) => yesNo(c.nss)) },
            ]}
          />

          <CompareSection
            icon={Heart}
            title="College Culture"
            rows={[
              { label: 'Academic Pressure', values: colleges.map((c) => c.academicPressure) },
              { label: 'Coding Culture', values: colleges.map((c) => c.codingCulture) },
              { label: 'Startup Culture', values: colleges.map((c) => c.startupCulture) },
              { label: 'Research Culture', values: colleges.map((c) => c.researchCulture) },
              { label: 'Diversity', values: colleges.map((c) => c.diversity) },
              { label: 'Campus Safety', values: colleges.map((c) => c.campusSafety) },
            ]}
          />
        </>
      )}

      {!stillLoading && slugs.length > 0 && colleges.length === 0 && (
        <EmptyState
          icon={Scale}
          title="Couldn't load these colleges"
          description="They may have been removed, or something went wrong."
          action={
            <Button variant="outline" onClick={() => update([])}>
              Start over
            </Button>
          }
        />
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={null}>
      <ComparePageInner />
    </Suspense>
  );
}
