'use client';

import Link from 'next/link';
import { ArrowRight, Code2, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CommunityCard } from '@/components/community-card';
import { uniqueById } from '@/lib/utils';
import { useCommunities } from '@/hooks/use-communities';

// Featured startups that have their own standalone landing pages.
const FEATURED = [
  { href: '/startups/99x-developers', icon: Code2, name: '99x Developers', desc: 'Web design, development & digital marketing — EduBridge Network’s in-house studio.' },
  { href: '/startups/ez-rentbuddy', icon: HomeIcon, name: 'EZ-Rentbuddy', desc: 'Student housing — find PGs, hostels, flats & rooms, or earn cashback by sharing properties.' },
];

export default function StartupsPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useCommunities({ type: 'STARTUP' });
  const startups = uniqueById(data?.pages.flatMap((p) => p.data) ?? []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Startups</h1>
        <p className="text-muted-foreground">Student-led startups on the network — launch, join a team, or use their services.</p>
      </div>

      {/* Featured landings */}
      <div className="grid gap-4 sm:grid-cols-2">
        {FEATURED.map((s) => (
          <Card key={s.href} className="border-primary/30">
            <CardContent className="flex items-start gap-3 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
                <Button asChild size="sm" variant="outline" className="mt-2">
                  <Link href={s.href}>Visit <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* All startup communities */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">All startup communities</h2>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36" />
            ))}
          </div>
        ) : startups.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">No startup communities yet.</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {startups.map((c) => (
                <CommunityCard key={c.id} community={c} />
              ))}
            </div>
            {hasNextPage && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                  {isFetchingNextPage ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
