'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Search, Star, Trophy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Stars } from '@/components/stars';
import { useColleges } from '@/hooks/use-colleges';

export default function ReviewsPage() {
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useColleges({
    q: search || undefined,
  });
  const colleges = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Star className="h-6 w-6 text-primary" />
            College Reviews
          </h1>
          <p className="text-muted-foreground">Genuine reviews from verified students.</p>
        </div>
        <form
          className="relative w-full sm:w-72"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(q);
          }}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search colleges…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </form>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : colleges.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No colleges found.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {colleges.map((c) => (
              <Link key={c.id} href={`/reviews/${c.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex h-full flex-col gap-2 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold leading-tight">{c.name}</h3>
                      {c.nirfRank && (
                        <Badge variant="secondary" className="shrink-0">
                          <Trophy className="mr-1 h-3 w-3" />#{c.nirfRank}
                        </Badge>
                      )}
                    </div>
                    {(c.city || c.state) && (
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {[c.city, c.state].filter(Boolean).join(', ')}
                      </p>
                    )}
                    <div className="mt-auto flex items-center gap-2 pt-2">
                      <Stars value={c.avgRating} />
                      <span className="text-sm font-medium">{c.avgRating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({c.reviewCount})</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {hasNextPage && (
            <div className="flex justify-center">
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
