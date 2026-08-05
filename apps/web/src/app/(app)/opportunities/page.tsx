'use client';

import { Suspense, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Bookmark,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Globe,
  HeartPulse,
  Palette,
  Search as SearchIcon,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHero } from '@/components/page-hero';
import { OpportunityRecommendationCard } from '@/components/opportunity-recommendation-card';
import { useInternshipListings, useInternshipListing, type InternshipListing } from '@/hooks/use-internship-listings';
import { useInternshipListingShortlist } from '@/hooks/use-internship-listing-shortlist';
import { useInternshipListingApplied } from '@/hooks/use-internship-listing-applied';
import { useMe } from '@/hooks/use-profile';
import { cn } from '@/lib/utils';

type Tab = 'all' | 'shortlist' | 'applied';

const CATEGORIES = [
  {
    key: 'Technology',
    icon: Code2,
    accent: 'text-[#5B5FE9]',
    tint: 'bg-[#EDECFC]',
    ring: 'ring-[#5B5FE9]',
    description:
      'Discover software development, AI, data science, cybersecurity, cloud, DevOps, UI/UX, and mobile development opportunities tailored to your technical skills.',
  },
  {
    key: 'Business',
    icon: TrendingUp,
    accent: 'text-[#D9972C]',
    tint: 'bg-[#FBF0DC]',
    ring: 'ring-[#D9972C]',
    description:
      'Explore internships and projects in marketing, finance, HR, sales, operations, and business analytics to gain practical business experience.',
  },
  {
    key: 'Healthcare',
    icon: HeartPulse,
    accent: 'text-[#E0587A]',
    tint: 'bg-[#FBE8ED]',
    ring: 'ring-[#E0587A]',
    description:
      'Build hands-on experience through clinical, laboratory, radiology, physiotherapy, pharmacy, and hospital administration opportunities.',
  },
  {
    key: 'Creative',
    icon: Palette,
    accent: 'text-[#9B59D0]',
    tint: 'bg-[#F1E8FA]',
    ring: 'ring-[#9B59D0]',
    description:
      'Grow your creative portfolio with opportunities in graphic design, video editing, content writing, social media, branding, and digital media.',
  },
  {
    key: 'General',
    icon: Globe,
    accent: 'text-[#8C8676]',
    tint: 'bg-[#EFEDE7]',
    ring: 'ring-[#8C8676]',
    description:
      'Expand your experience through campus ambassador programs, research, startup internships, volunteering, and remote opportunities across diverse industries.',
  },
];

function OpportunityBySlug({ slug }: { slug: string }) {
  const { data: listing, isLoading } = useInternshipListing(slug);
  if (isLoading) return <Skeleton className="h-28 w-full rounded-[20px]" />;
  if (!listing) return null;
  return <OpportunityRecommendationCard listing={listing} />;
}

function ShortlistTab() {
  const { slugs } = useInternshipListingShortlist();

  if (slugs.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        title="Nothing shortlisted yet"
        description="Shortlist opportunities from the All Opportunities tab to keep track of them."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {slugs.map((slug) => (
        <OpportunityBySlug key={slug} slug={slug} />
      ))}
    </div>
  );
}

function AppliedTab() {
  const { slugs } = useInternshipListingApplied();

  if (slugs.length === 0) {
    return (
      <EmptyState icon={CheckCircle2} title="No applications yet" description="Once you apply to an opportunity, it'll show up here." />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {slugs.map((slug) => (
        <OpportunityBySlug key={slug} slug={slug} />
      ))}
    </div>
  );
}

function AllTab({ category, onCategoryChange }: { category?: string; onCategoryChange: (c?: string) => void }) {
  const [q, setQ] = useState('');
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInternshipListings({ category, q: q || undefined });
  const listings: InternshipListing[] = data?.pages.flatMap((p) => p.data) ?? [];
  const sliderRef = useRef<HTMLDivElement>(null);
  const scrollByStep = (dir: 1 | -1) => sliderRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });

  return (
    <div>
      <div className="relative mb-4">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search opportunities by name…" className="pl-9" />
      </div>

      {/* Category filter row — horizontally scrollable, tap a card to filter/unfilter,
          or use the arrow buttons to scroll without touch/trackpad. */}
      <div className="relative mb-8">
        <button
          type="button"
          aria-label="Scroll categories left"
          onClick={() => scrollByStep(-1)}
          className="absolute -left-3.5 top-1/2 z-10 hidden h-[42px] w-[42px] -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] border-border bg-card shadow-lg transition-colors hover:bg-accent sm:flex"
        >
          <ChevronLeft className="h-[18px] w-[18px]" />
        </button>

        <div ref={sliderRef} className="flex gap-3.5 overflow-x-auto pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map(({ key, icon: Icon, accent, tint, ring, description }) => {
            const active = category === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onCategoryChange(active ? undefined : key)}
                className={cn(
                  'flex w-[260px] flex-none items-start gap-3.5 rounded-[16px] border-[1.5px] border-border bg-card p-[18px] text-left transition-all hover:-translate-y-0.5 hover:shadow-lg sm:w-[280px]',
                  active && `${ring} ring-2 ring-offset-0`,
                )}
              >
                <span className={cn('flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[13px]', tint, accent)}>
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="mb-1 block text-[15.5px] font-bold">{key}</span>
                  <span className="block text-[12.5px] leading-relaxed text-muted-foreground">{description}</span>
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Scroll categories right"
          onClick={() => scrollByStep(1)}
          className="absolute -right-3.5 top-1/2 z-10 hidden h-[42px] w-[42px] -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] border-border bg-card shadow-lg transition-colors hover:bg-accent sm:flex"
        >
          <ChevronRight className="h-[18px] w-[18px]" />
        </button>
      </div>

      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-1.5">
        <h2 className="m-0 font-fraunces text-[20px] font-bold">{category ? `${category} opportunities` : 'All opportunities'}</h2>
        {!isLoading && (
          <span className="text-[13px] text-muted-foreground">
            {listings.length} {listings.length === 1 ? 'match' : 'matches'}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-28 w-full rounded-[20px]" />
          <Skeleton className="h-28 w-full rounded-[20px]" />
          <Skeleton className="h-28 w-full rounded-[20px]" />
        </div>
      )}

      {!isLoading && listings.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title="No opportunities found"
          description={q ? `Nothing matched "${q}".` : "Check back soon — we're adding more opportunities."}
        />
      )}

      {listings.length > 0 && (
        <div className="flex flex-col gap-3">
          {listings.map((l) => (
            <OpportunityRecommendationCard key={l.id} listing={l} />
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="mt-5 text-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}

function OpenCareerProgramInner() {
  const { data: me, isLoading: meLoading } = useMe();
  const params = useSearchParams();
  const router = useRouter();
  const initialTab = params.get('tab');
  const [tab, setTab] = useState<Tab>(initialTab === 'shortlist' || initialTab === 'applied' ? initialTab : 'all');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const { slugs: shortlistSlugs } = useInternshipListingShortlist();
  const { slugs: appliedSlugs } = useInternshipListingApplied();

  const verified = me?.profile?.collegeVerification === 'VERIFIED';

  if (!meLoading && !verified) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <EmptyState
          icon={CheckCircle2}
          title="Open only to verified students"
          description="The Open Career Program is unlocked once your student profile is verified."
        />
        <Button className="mt-4" onClick={() => router.push('/verify')}>
          Get verified
        </Button>
      </div>
    );
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All Opportunities' },
    { key: 'shortlist', label: `Shortlist${shortlistSlugs.length > 0 ? ` (${shortlistSlugs.length})` : ''}` },
    { key: 'applied', label: `Applied${appliedSlugs.length > 0 ? ` (${appliedSlugs.length})` : ''}` },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="space-y-6">
        <PageHero
          eyebrow="Recommended"
          title="Find opportunities that"
          accent="fit you."
          sub="Your shortlist, plus every internship, gig, and project matched to your profile."
        />
      </div>

      {/* Sticky tab bar — pinned just below the app's own sticky top nav (h-16),
          stays visible while either list scrolls underneath it. */}
      <div className="sticky top-16 z-20 -mx-4 mb-6 mt-6 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-6 sm:px-6">
        <div className="flex gap-2 rounded-full border border-border bg-card p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pb-10">
        {tab === 'all' && <AllTab category={category} onCategoryChange={setCategory} />}
        {tab === 'shortlist' && <ShortlistTab />}
        {tab === 'applied' && <AppliedTab />}
      </div>
    </div>
  );
}

export default function OpenCareerProgramPage() {
  return (
    <Suspense fallback={null}>
      <OpenCareerProgramInner />
    </Suspense>
  );
}
