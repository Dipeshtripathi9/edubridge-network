'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bookmark, CheckCircle2, GraduationCap, Search as SearchIcon } from 'lucide-react';
import { PageHero } from '@/components/page-hero';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { CollegeRecommendationCard } from '@/components/college-recommendation-card';
import { CollegeQuiz } from '@/components/college-quiz';
import { useColleges, useCollege } from '@/hooks/use-colleges';
import { useCollegeShortlist } from '@/hooks/use-college-shortlist';
import { useCollegeApplied } from '@/hooks/use-college-applied';
import { cn } from '@/lib/utils';

type Tab = 'all' | 'shortlist' | 'applied';

function CollegeBySlug({ slug, onQuiz }: { slug: string; onQuiz: () => void }) {
  const { data: college, isLoading } = useCollege(slug);
  if (isLoading) return <Skeleton className="h-28 w-full rounded-[20px]" />;
  if (!college) return null;
  return <CollegeRecommendationCard college={college} onQuiz={onQuiz} />;
}

function ShortlistTab({ onQuiz }: { onQuiz: () => void }) {
  const { slugs } = useCollegeShortlist();

  if (slugs.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        title="Nothing shortlisted yet"
        description="Shortlist colleges from the All Colleges tab to keep track of your favorites."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {slugs.map((slug) => (
        <CollegeBySlug key={slug} slug={slug} onQuiz={onQuiz} />
      ))}
    </div>
  );
}

function AppliedTab({ onQuiz }: { onQuiz: () => void }) {
  const { slugs } = useCollegeApplied();

  if (slugs.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="No applications yet"
        description="Once you apply to a college, it'll show up here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {slugs.map((slug) => (
        <CollegeBySlug key={slug} slug={slug} onQuiz={onQuiz} />
      ))}
    </div>
  );
}

function AllCollegesTab({ onQuiz }: { onQuiz: () => void }) {
  const [q, setQ] = useState('');
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useColleges({ q, sort: 'rating' });
  const colleges = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div>
      <div className="relative mb-4">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search colleges by name…" className="pl-9" />
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-28 w-full rounded-[20px]" />
          <Skeleton className="h-28 w-full rounded-[20px]" />
          <Skeleton className="h-28 w-full rounded-[20px]" />
        </div>
      )}

      {!isLoading && colleges.length === 0 && (
        <EmptyState icon={GraduationCap} title="No colleges found" description={q ? `Nothing matched "${q}".` : "Check back soon — we're adding more colleges."} />
      )}

      {colleges.length > 0 && (
        <div className="flex flex-col gap-3">
          {colleges.map((c) => (
            <CollegeRecommendationCard key={c.id} college={c} onQuiz={onQuiz} />
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

function RecommendedCollegesPageInner() {
  const [quizOpen, setQuizOpen] = useState(false);
  const openQuiz = () => setQuizOpen(true);
  const params = useSearchParams();
  const initialTab = params.get('tab');
  const [tab, setTab] = useState<Tab>(
    initialTab === 'shortlist' || initialTab === 'applied' ? initialTab : 'all',
  );
  const { slugs: shortlistSlugs } = useCollegeShortlist();
  const { slugs: appliedSlugs } = useCollegeApplied();

  const TABS: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All Colleges' },
    { key: 'shortlist', label: `Shortlist${shortlistSlugs.length > 0 ? ` (${shortlistSlugs.length})` : ''}` },
    { key: 'applied', label: `Applied${appliedSlugs.length > 0 ? ` (${appliedSlugs.length})` : ''}` },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <CollegeQuiz open={quizOpen} onClose={() => setQuizOpen(false)} />

      <div className="space-y-6">
        <PageHero eyebrow="Recommended" title="Find the college that" accent="fits you." sub="Your shortlist, plus every college ranked by real ratings." />
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
        {tab === 'all' && <AllCollegesTab onQuiz={openQuiz} />}
        {tab === 'shortlist' && <ShortlistTab onQuiz={openQuiz} />}
        {tab === 'applied' && <AppliedTab onQuiz={openQuiz} />}
      </div>
    </div>
  );
}

export default function RecommendedCollegesPage() {
  return (
    <Suspense fallback={null}>
      <RecommendedCollegesPageInner />
    </Suspense>
  );
}
