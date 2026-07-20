'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  GraduationCap,
  Search as SearchIcon,
  Star,
  Target,
  User as UserIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { cn, uniqueById } from '@/lib/utils';
import {
  useSearchAll,
  useSearchType,
  type SearchHit,
  type SearchType,
} from '@/hooks/use-search';

const TYPE_META: Record<SearchType, { label: string; icon: typeof Star }> = {
  college: { label: 'Colleges', icon: GraduationCap },
  user: { label: 'People', icon: UserIcon },
  opportunity: { label: 'Opportunities', icon: Target },
  resource: { label: 'Resources', icon: BookOpen },
  review: { label: 'Reviews', icon: Star },
};

const TYPES = Object.keys(TYPE_META) as SearchType[];

function HitRow({ hit }: { hit: SearchHit }) {
  const Icon = TYPE_META[hit.type].icon;
  const inner = (
    <Card className={cn('transition-shadow', hit.url && 'hover:shadow-md')}>
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">{hit.title}</p>
          {hit.subtitle && <p className="truncate text-sm text-muted-foreground">{hit.subtitle}</p>}
          {hit.body && <p className="line-clamp-1 text-xs text-muted-foreground">{hit.body}</p>}
        </div>
      </CardContent>
    </Card>
  );
  return hit.url ? <Link href={hit.url}>{inner}</Link> : inner;
}

function AllResults({ q, onPickType }: { q: string; onPickType: (t: SearchType) => void }) {
  const { data, isLoading } = useSearchAll(q);
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!data) return null;

  const nonEmpty = TYPES.filter((t) => (data.groups[t]?.length ?? 0) > 0);
  if (nonEmpty.length === 0) {
    return <EmptyState icon={SearchIcon} title="No results" description={`Nothing matched “${q}”. Try different keywords.`} />;
  }

  return (
    <div className="space-y-8">
      {nonEmpty.map((t) => (
        <section key={t}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{TYPE_META[t].label}</h2>
            {data.counts[t] > (data.groups[t]?.length ?? 0) && (
              <button onClick={() => onPickType(t)} className="text-sm text-primary hover:underline">
                See all {data.counts[t]}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {data.groups[t].map((h) => (
              <HitRow key={`${h.type}-${h.id}`} hit={h} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function TypeResults({ q, type }: { q: string; type: SearchType }) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useSearchType(q, type);
  const items = uniqueById(data?.pages.flatMap((p) => p.data) ?? []);
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (items.length === 0) {
    return <EmptyState icon={SearchIcon} title={`No ${TYPE_META[type].label.toLowerCase()} found`} description={`Nothing matched “${q}” in ${TYPE_META[type].label.toLowerCase()}.`} />;
  }
  return (
    <div className="space-y-2">
      {items.map((h) => (
        <HitRow key={`${h.type}-${h.id}`} hit={h} />
      ))}
      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}

function SearchInner() {
  const params = useSearchParams();
  const q = params.get('q') ?? '';
  const [active, setActive] = useState<SearchType | 'all'>('all');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <SearchIcon className="h-6 w-6 text-primary" />
          Search
        </h1>
        {q && (
          <p className="text-muted-foreground">
            Results for <span className="font-medium text-foreground">“{q}”</span>
          </p>
        )}
      </div>

      {!q ? (
        <EmptyState icon={SearchIcon} title="Search EduBridge" description="Type a query in the search bar above to find colleges, opportunities & people." />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActive('all')}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm',
                active === 'all' ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent',
              )}
            >
              All
            </button>
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setActive(t)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm',
                  active === t ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent',
                )}
              >
                {TYPE_META[t].label}
              </button>
            ))}
          </div>

          {active === 'all' ? (
            <AllResults q={q} onPickType={setActive} />
          ) : (
            <TypeResults q={q} type={active} />
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchInner />
    </Suspense>
  );
}
