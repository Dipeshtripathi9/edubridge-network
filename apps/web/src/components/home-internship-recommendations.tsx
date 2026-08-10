'use client';

import Link from 'next/link';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { InternshipListingCard } from '@/components/internship-listing-card';
import { useInternshipListings, type InternshipListing } from '@/hooks/use-internship-listings';
import { useInternshipListingShortlist } from '@/hooks/use-internship-listing-shortlist';
import { isSafeHttpUrl } from '@/lib/utils';

// Personalized internship-listing preview shown on /home, directly below the
// static internship teaser in HomeTools. Mirrors HomeCollegeRanking's
// mobile-capped / desktop-infinite-scroll split.
export function HomeInternshipRecommendations() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInternshipListings();
  const { isShortlisted, toggle } = useInternshipListingShortlist();

  const listings = data?.pages.flatMap((p) => p.data) ?? [];

  // No catalog data yet — skip the section entirely rather than showing an
  // empty-state placeholder on the home page. Check `data` rather than
  // `isLoading`: with PersistQueryClientProvider, `isLoading` is briefly false
  // during the client's cache-restore phase (before the persisted cache or a
  // fresh fetch has resolved) — a phase SSR never has — so branching on it
  // made this section disappear on the client right at hydration when the
  // server had rendered it loading. `data` stays undefined in both the SSR
  // pass and the client's pre-restore paint, so it doesn't drift.
  if (data && listings.length === 0) return null;

  const cardActions = (l: InternshipListing) => {
    const shortlisted = isShortlisted(l.slug);
    return (
      <>
        <Button size="sm" variant={shortlisted ? 'default' : 'outline'} className="gap-1.5" onClick={() => toggle(l.slug)}>
          {shortlisted ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {shortlisted ? 'Shortlisted' : 'Shortlist'}
        </Button>
        {isSafeHttpUrl(l.applyUrl) && (
          <Button size="sm" variant="outline" asChild>
            <a href={l.applyUrl} target="_blank" rel="noopener noreferrer">
              Apply
            </a>
          </Button>
        )}
      </>
    );
  };

  return (
    <section>
      <h2 className="mb-6 font-display text-[clamp(22px,3vw,28px)] font-semibold">Internships matched to you</h2>

      {!data && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-28 w-full rounded-[18px]" />
          <Skeleton className="h-28 w-full rounded-[18px]" />
          <Skeleton className="h-28 w-full rounded-[18px]" />
        </div>
      )}

      {listings.length > 0 && (
        <>
          <div className="flex flex-col gap-3 lg:hidden">
            {listings.slice(0, 5).map((l) => (
              <InternshipListingCard key={l.id} listing={l} actions={cardActions(l)} />
            ))}
          </div>
          <div className="mt-5 text-center lg:hidden">
            <Button variant="outline" asChild>
              <Link href="/internship">See more</Link>
            </Button>
          </div>

          <div className="hidden lg:block">
            <div className="flex flex-col gap-3">
              {listings.map((l) => (
                <InternshipListingCard key={l.id} listing={l} actions={cardActions(l)} />
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
