'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Award, Bookmark, BookmarkCheck, Search as SearchIcon } from 'lucide-react';
import { PageHero } from '@/components/page-hero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ScholarshipCard } from '@/components/scholarship-card';
import { useScholarships, useScholarshipCategories } from '@/hooks/use-scholarships';
import { useScholarshipShortlist } from '@/hooks/use-scholarship-shortlist';
import { useMe } from '@/hooks/use-profile';
import { matchPercent } from '@/lib/scholarship-match';
import { cn } from '@/lib/utils';

export default function ScholarshipsPage() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);

  const { data: me } = useMe();
  const { data: categories } = useScholarshipCategories();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useScholarships({ q, category, sort: 'deadline' });
  const { isShortlisted, toggle } = useScholarshipShortlist();

  const scholarships = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHero eyebrow="Fund your future" title="Scholarships matched to" accent="your profile." />

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search scholarships…" className="pl-9" />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory(undefined)}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
            category === undefined ? 'bg-foreground text-background' : 'bg-accent text-foreground hover:bg-accent/70',
          )}
        >
          All matches
        </button>
        {categories?.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              category === c ? 'bg-foreground text-background' : 'bg-accent text-foreground hover:bg-accent/70',
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-28 w-full rounded-[18px]" />
          <Skeleton className="h-28 w-full rounded-[18px]" />
          <Skeleton className="h-28 w-full rounded-[18px]" />
        </div>
      )}

      {!isLoading && scholarships.length === 0 && (
        <EmptyState icon={Award} title="No scholarships found" description={q ? `Nothing matched "${q}".` : 'Check back soon — we\'re adding more scholarships.'} />
      )}

      {scholarships.length > 0 && (
        <div className="flex flex-col gap-3">
          {scholarships.map((s) => {
            const shortlisted = isShortlisted(s.slug);
            const pct = matchPercent(s, me?.profile);
            return (
              <ScholarshipCard
                key={s.id}
                scholarship={s}
                matchPct={pct}
                actions={
                  <>
                    <Button size="sm" variant={shortlisted ? 'default' : 'outline'} className="gap-1.5" onClick={() => toggle(s.slug)}>
                      {shortlisted ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                      {shortlisted ? 'Shortlisted' : 'Shortlist'}
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/scholarships/${s.slug}`}>View details</Link>
                    </Button>
                  </>
                }
              />
            );
          })}
        </div>
      )}

      {hasNextPage && (
        <div className="text-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}
