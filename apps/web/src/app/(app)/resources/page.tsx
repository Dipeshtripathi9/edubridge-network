'use client';

import { useState } from 'react';
import { Bookmark, FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PageHero } from '@/components/page-hero';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PillTabs, PillTabsContent, PillTabsList, PillTabsTrigger } from '@/components/ui/pill-tabs';
import { FilterChips } from '@/components/ui/filter-chips';
import { EmptyState } from '@/components/ui/empty-state';
import { ResourceCard } from '@/components/resource-card';
import { ResourceUpload } from '@/components/resource-upload';
import { uniqueById } from '@/lib/utils';
import { useMyResourceBookmarks, useResources } from '@/hooks/use-resources';

const TYPES = [
  { value: undefined, label: 'All' },
  { value: 'NOTES', label: 'Notes' },
  { value: 'PDF', label: 'PDFs' },
  { value: 'ROADMAP', label: 'Roadmaps' },
  { value: 'PLACEMENT_REPORT', label: 'Placement Reports' },
  { value: 'STUDY_MATERIAL', label: 'Study Material' },
];

function Grid({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-60" />
        ))}
      </div>
    );
  }
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function Browse() {
  const [type, setType] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState('recent');
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useResources({
    type,
    sort,
    q: search || undefined,
  });
  const items = uniqueById(data?.pages.flatMap((p) => p.data) ?? []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterChips options={TYPES} value={type} onChange={setType} />
        <div className="flex items-center gap-2">
          <form
            className="relative"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(q);
            }}
          >
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-44 rounded-full pl-10"
            />
          </form>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 rounded-full border border-border bg-card px-4 text-[13px] font-bold text-muted-foreground shadow-sm"
          >
            <option value="recent">Recent</option>
            <option value="top">Top rated</option>
            <option value="downloads">Most downloaded</option>
          </select>
        </div>
      </div>

      {!isLoading && items.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resources yet"
          description="Be the first to share notes, a roadmap or a placement report with your peers."
          action={<ResourceUpload />}
        />
      ) : (
        <Grid loading={isLoading}>
          {items.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </Grid>
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

function Saved() {
  const { data, isLoading } = useMyResourceBookmarks();
  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!data?.length)
    return (
      <EmptyState
        icon={Bookmark}
        title="Nothing saved yet"
        description="Tap the bookmark on any resource to keep it here for later."
      />
    );
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((r) => (
        <ResourceCard key={r.id} resource={r} />
      ))}
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHero
          eyebrow="Resource Hub"
          title="Learn from what"
          accent="actually worked."
          sub="Notes, PDFs, roadmaps & placement reports shared by students."
        />
        <ResourceUpload />
      </div>

      <PillTabs defaultValue="browse">
        <PillTabsList>
          <PillTabsTrigger value="browse">Browse</PillTabsTrigger>
          <PillTabsTrigger value="saved">Saved</PillTabsTrigger>
        </PillTabsList>
        <PillTabsContent value="browse">
          <Browse />
        </PillTabsContent>
        <PillTabsContent value="saved">
          <Saved />
        </PillTabsContent>
      </PillTabs>
    </div>
  );
}
