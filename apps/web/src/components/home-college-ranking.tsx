'use client';

import Link from 'next/link';
import { Bookmark, BookmarkCheck, GraduationCap, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useColleges } from '@/hooks/use-colleges';
import { useCollegeShortlist } from '@/hooks/use-college-shortlist';

// Ranked-colleges preview shown below the signed-in welcome panel on /home.
// Uses only real College fields (avgRating, nirfRank, avgPlacementPackage) —
// there's no personalized match score or category/verified tag in the data
// model, so none is fabricated here.
export function HomeCollegeRanking({ onQuiz }: { onQuiz: () => void }) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useColleges({ sort: 'rating' });
  const { isShortlisted, toggle } = useCollegeShortlist();

  const colleges = data?.pages.flatMap((p) => p.data) ?? [];

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
        <div className="flex flex-col gap-3">
          {colleges.map((c) => {
            const shortlisted = isShortlisted(c.slug);
            return (
              <article
                key={c.id}
                className="flex flex-col gap-3 rounded-[18px] border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <Link href={`/colleges/${c.slug}`} className="font-display text-[17px] font-semibold hover:text-primary">
                    {c.name}
                  </Link>
                  {(c.city || c.state) && (
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {[c.city, c.state].filter(Boolean).join(', ')}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-semibold text-muted-foreground">
                    <span className="inline-flex items-center gap-1 text-amber-600">
                      <Star className="h-3.5 w-3.5 fill-current" /> {c.avgRating.toFixed(1)} ({c.reviewCount})
                    </span>
                    {c.nirfRank && <span>NIRF #{c.nirfRank}</span>}
                    {c.avgPlacementPackage && <span>₹{c.avgPlacementPackage.toLocaleString()} avg. package</span>}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant={shortlisted ? 'default' : 'outline'}
                    className="gap-1.5"
                    onClick={() => toggle(c.slug)}
                  >
                    {shortlisted ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    {shortlisted ? 'Shortlisted' : 'Shortlist'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={onQuiz}>
                    Ask Expert Guide
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {hasNextPage && (
        <div className="mt-5 text-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'See more'}
          </Button>
        </div>
      )}
    </section>
  );
}
