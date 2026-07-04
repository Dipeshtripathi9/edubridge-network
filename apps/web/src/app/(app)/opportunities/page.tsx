'use client';

import { useState } from 'react';
import { uniqueById } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { Search, Sparkles, Target } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

function Browse() {
  const [type, setType] = useState<string | undefined>(undefined);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useOpportunities({
    type,
    q: search || undefined,
  });
  const items = uniqueById(data?.pages.flatMap((p) => p.data) ?? []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.label}
              onClick={() => setType(t.value)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                type === t.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:bg-accent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <form
          className="relative w-full sm:w-64"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(q);
          }}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </form>
      </div>

      {!isLoading && items.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No opportunities found.</p>
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
        <p className="py-12 text-center text-muted-foreground">
          Add interests in your profile to get personalized recommendations.
        </p>
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
    return <p className="py-12 text-center text-muted-foreground">Nothing saved yet.</p>;
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

export default function OpportunitiesPage() {
  const params = useSearchParams();
  const tab = params.get('tab') === 'recommended' || params.get('tab') === 'saved'
    ? params.get('tab')!
    : 'browse';
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Target className="h-6 w-6 text-primary" />
          Opportunity Hub
        </h1>
        <p className="text-muted-foreground">
          Internships, scholarships, competitions, fellowships & research programs.
        </p>
      </div>

      <Tabs defaultValue={tab}>
        <TabsList>
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="recommended">For You</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>
        <TabsContent value="browse">
          <Browse />
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
