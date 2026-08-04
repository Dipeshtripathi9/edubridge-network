'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bookmark, Briefcase, CheckCircle2, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHero } from '@/components/page-hero';
import { OpportunityRecommendationCard } from '@/components/opportunity-recommendation-card';
import { CollegeQuiz } from '@/components/college-quiz';
import { useInternshipListings, useInternshipListing, type InternshipListing } from '@/hooks/use-internship-listings';
import { useInternshipListingShortlist } from '@/hooks/use-internship-listing-shortlist';
import { useInternshipListingApplied } from '@/hooks/use-internship-listing-applied';
import { useMe } from '@/hooks/use-profile';
import { cn } from '@/lib/utils';

type Tab = 'all' | 'shortlist' | 'applied';

function OpportunityBySlug({ slug, onQuiz }: { slug: string; onQuiz: () => void }) {
  const { data: listing, isLoading } = useInternshipListing(slug);
  if (isLoading) return <Skeleton className="h-28 w-full rounded-[20px]" />;
  if (!listing) return null;
  return <OpportunityRecommendationCard listing={listing} onQuiz={onQuiz} />;
}

function ShortlistTab({ onQuiz }: { onQuiz: () => void }) {
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
        <OpportunityBySlug key={slug} slug={slug} onQuiz={onQuiz} />
      ))}
    </div>
  );
}

function AppliedTab({ onQuiz }: { onQuiz: () => void }) {
  const { slugs } = useInternshipListingApplied();

  if (slugs.length === 0) {
    return (
      <EmptyState icon={CheckCircle2} title="No applications yet" description="Once you apply to an opportunity, it'll show up here." />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {slugs.map((slug) => (
        <OpportunityBySlug key={slug} slug={slug} onQuiz={onQuiz} />
      ))}
    </div>
  );
}

function AllTab({ onQuiz }: { onQuiz: () => void }) {
  const [q, setQ] = useState('');
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInternshipListings({ q: q || undefined });
  const listings: InternshipListing[] = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div>
      <div className="relative mb-4">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search opportunities by name…" className="pl-9" />
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
            <OpportunityRecommendationCard key={l.id} listing={l} onQuiz={onQuiz} />
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
  const [quizOpen, setQuizOpen] = useState(false);
  const openQuiz = () => setQuizOpen(true);
  const initialTab = params.get('tab');
  const [tab, setTab] = useState<Tab>(initialTab === 'shortlist' || initialTab === 'applied' ? initialTab : 'all');
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
      <CollegeQuiz open={quizOpen} onClose={() => setQuizOpen(false)} />

      <div className="space-y-6">
        <PageHero
          eyebrow="Recommended"
          title="Find opportunities that"
          accent="fit you."
          sub="Your shortlist, plus every opportunity matched to your profile."
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
        {tab === 'all' && <AllTab onQuiz={openQuiz} />}
        {tab === 'shortlist' && <ShortlistTab onQuiz={openQuiz} />}
        {tab === 'applied' && <AppliedTab onQuiz={openQuiz} />}
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
