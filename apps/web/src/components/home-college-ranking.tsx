'use client';

import Link from 'next/link';
import { Bookmark, BookmarkCheck, ChevronRight, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { CollegeCard } from '@/components/college-card';
import { useColleges, type College } from '@/hooks/use-colleges';
import { useCollegeShortlist } from '@/hooks/use-college-shortlist';

// Ranked-colleges preview shown below the signed-in welcome panel on /home.
// Uses only real College fields (avgRating, nirfRank, avgPlacementPackage) —
// there's no personalized match score or category/verified tag in the data
// model, so none is fabricated here.
//
// Mobile (<lg) caps the preview to 5 cards and sends "See more" to a
// dedicated page (/colleges/recommended). Desktop (lg+) is unchanged from
// how it originally shipped — full list with an in-place "See more" that
// loads further pages via fetchNextPage.
export function HomeCollegeRanking({ onQuiz }: { onQuiz: () => void }) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useColleges({ sort: 'rating' });
  const { isShortlisted, toggle } = useCollegeShortlist();

  const colleges = data?.pages.flatMap((p) => p.data) ?? [];

  const cardActions = (c: College) => {
    const shortlisted = isShortlisted(c.slug);
    return (
      <>
        <Button size="sm" variant={shortlisted ? 'default' : 'outline'} className="gap-1.5" onClick={() => toggle(c.slug)}>
          {shortlisted ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {shortlisted ? 'Shortlisted' : 'Shortlist'}
        </Button>
        <Button size="sm" variant="outline" onClick={onQuiz}>
          Ask Expert Guide
        </Button>
      </>
    );
  };

  return (
    <section>
      <h2 className="mb-6 font-display text-[clamp(22px,3vw,28px)] font-semibold">Top-rated colleges for you</h2>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-28 w-full rounded-[18px]" />
          <Skeleton className="h-28 w-full rounded-[18px]" />
          <Skeleton className="h-28 w-full rounded-[18px]" />
        </div>
      )}

      {!isLoading && colleges.length === 0 && (
        <EmptyState icon={GraduationCap} title="No colleges yet" description="Check back soon — we're adding more colleges." />
      )}

      {colleges.length > 0 && (
        <>
          {/* Mobile: capped preview, "See more" navigates to a dedicated page */}
          <div className="flex flex-col gap-3 lg:hidden">
            {colleges.slice(0, 5).map((c) => (
              <CollegeCard key={c.id} college={c} actions={cardActions(c)} />
            ))}
          </div>
          <div className="mt-5 text-center lg:hidden">
            <Button variant="outline" className="gap-1.5" asChild>
              <Link href="/colleges/recommended">
                See more recommendations <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Desktop/laptop: unchanged from how this originally shipped */}
          <div className="hidden lg:block">
            <div className="flex flex-col gap-3">
              {colleges.map((c) => (
                <CollegeCard key={c.id} college={c} actions={cardActions(c)} />
              ))}
            </div>
            {hasNextPage && (
              <div className="mt-5 text-center">
                <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                  {isFetchingNextPage ? 'Loading…' : 'See more'}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
