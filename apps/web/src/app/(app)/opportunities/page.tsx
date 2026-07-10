'use client';

import { Suspense, useState } from 'react';
import { uniqueById } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { Bookmark, Sparkles, Target, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterChips } from '@/components/ui/filter-chips';
import { EmptyState } from '@/components/ui/empty-state';
import { OpportunityCard } from '@/components/opportunity-card';
import {
  useMyApplications,
  useOpportunities,
  useRecommendedOpportunities,
} from '@/hooks/use-opportunities';

const TYPES = [
  { value: undefined, label: 'All' },
  { value: 'INTERNSHIP', label: 'Internships' },
  { value: 'SCHOLARSHIP', label: 'Scholarships' },
  { value: 'COMPETITION', label: 'Competitions' },
  { value: 'FELLOWSHIP', label: 'Fellowships' },
  { value: 'RESEARCH', label: 'Research' },
  { value: 'CERTIFICATION', label: 'Certifications' },
];

function CardGrid({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56" />
        ))}
      </div>
    );
  }
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function Browse({ type }: { type?: string }) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useOpportunities({ type });
  const items = uniqueById(data?.pages.flatMap((p) => p.data) ?? []);

  return (
    <div className="space-y-4">
      {!isLoading && items.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No opportunities found"
          description="Try a different category — new internships, scholarships & fellowships drop every week."
        />
      ) : (
        <CardGrid loading={isLoading}>
          {items.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} />
          ))}
        </CardGrid>
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}

function Recommended() {
  const { data, isLoading } = useRecommendedOpportunities();
  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        Matched to your interests
      </p>
      {!isLoading && (!data || data.length === 0) ? (
        <EmptyState
          icon={UserCog}
          title="Tell us what you're into"
          description="Add interests in your profile and we'll match you to opportunities that fit."
          action={
            <Button asChild variant="outline">
              <a href="/profile">Update interests</a>
            </Button>
          }
        />
      ) : (
        <CardGrid loading={isLoading}>
          {(data ?? []).map((o) => (
            <OpportunityCard key={o.id} opportunity={o} />
          ))}
        </CardGrid>
      )}
    </div>
  );
}

function Saved() {
  const { data, isLoading } = useMyApplications();
  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!data?.length) {
    return (
      <EmptyState
        icon={Bookmark}
        title="Nothing saved yet"
        description="Save or apply to an opportunity and it'll show up here to track."
      />
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((a) => (
        <div key={a.id} className="relative">
          <Badge className="absolute right-2 top-2 z-10">{a.status}</Badge>
          <OpportunityCard opportunity={a.opportunity} />
        </div>
      ))}
    </div>
  );
}

function OpportunitiesContent() {
  const params = useSearchParams();
  const tab = params.get('tab') === 'recommended' || params.get('tab') === 'saved'
    ? params.get('tab')!
    : 'browse';
  const [type, setType] = useState<string | undefined>(undefined);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Tabs defaultValue={tab}>
        {/* Category filter on top, view switcher (Browse / For You / Saved) on
            the right just below it. */}
        <div className="space-y-3">
          <FilterChips options={TYPES} value={type} onChange={setType} />
          <div className="flex justify-end">
            <TabsList>
              <TabsTrigger value="browse">Browse</TabsTrigger>
              <TabsTrigger value="recommended">For You</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>
          </div>
        </div>
        <TabsContent value="browse">
          <Browse type={type} />
        </TabsContent>
        <TabsContent value="recommended">
          <Recommended />
        </TabsContent>
        <TabsContent value="saved">
          <Saved />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// useSearchParams must sit under a Suspense boundary, otherwise the whole route
// bails out of server rendering (blank initial HTML).
export default function OpportunitiesPage() {
  return (
    <Suspense fallback={null}>
      <OpportunitiesContent />
    </Suspense>
  );
}
