'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Award, Heart, MapPin, Search, TrendingUp } from 'lucide-react';
import { PageHero } from '@/components/page-hero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useColleges } from '@/hooks/use-colleges';
import { useCollegeShortlist } from '@/hooks/use-college-shortlist';
import { cn } from '@/lib/utils';

const STATES = [
  'Delhi', 'Uttar Pradesh', 'Haryana', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'West Bengal', 'Rajasthan', 'Gujarat',
];

export default function CollegesBrowsePage() {
  const [q, setQ] = useState('');
  const [state, setState] = useState('');
  const [sort, setSort] = useState('rank');
  const { isShortlisted, toggle, slugs, mounted } = useCollegeShortlist();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useColleges({ q, state, sort });

  const colleges = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHero
          eyebrow="Shortlist colleges"
          title="Browse and"
          accent="shortlist."
          sub="Filter by state, sort by rank or rating, and shortlist the colleges worth a closer look."
        />
        {mounted && slugs.length > 0 && (
          <Button asChild variant="outline" className="gap-1.5">
            <Link href="/compare">
              <Heart className="h-4 w-4 fill-current" /> {slugs.length} shortlisted — Compare
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2.5">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search colleges by name…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm hover:border-primary/40 focus-visible:border-primary focus-visible:outline-none"
        >
          <option value="">All states</option>
          {STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm hover:border-primary/40 focus-visible:border-primary focus-visible:outline-none"
        >
          <option value="rank">Sort: NIRF rank</option>
          <option value="rating">Sort: Rating</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : colleges.length === 0 ? (
        <EmptyState icon={Search} title="No colleges found" description="Try a different search or clear the state filter." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {colleges.map((c) => (
              <div key={c.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-display text-[17px] font-extrabold leading-snug tracking-tight">{c.name}</span>
                  <button
                    type="button"
                    aria-label={isShortlisted(c.slug) ? 'Remove from shortlist' : 'Add to shortlist'}
                    onClick={() => toggle(c.slug)}
                    className="grid h-8 w-8 flex-none place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                  >
                    <Heart className={cn('h-[18px] w-[18px]', isShortlisted(c.slug) && 'fill-primary text-primary')} />
                  </button>
                </div>
                {(c.city || c.state) && (
                  <p className="mt-1 flex items-center gap-1 text-[13px] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {[c.city, c.state].filter(Boolean).join(', ')}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-muted-foreground">
                  {c.nirfRank && <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5 text-marigold" /> NIRF #{c.nirfRank}</span>}
                  <span className="flex items-center gap-1">★ {c.avgRating.toFixed(1)} ({c.reviewCount})</span>
                  {c.avgPlacementPackage != null && (
                    <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5 text-primary" /> ₹{c.avgPlacementPackage.toFixed(1)} LPA</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
