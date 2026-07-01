'use client';

import { useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResourceCard } from '@/components/resource-card';
import { ResourceUpload } from '@/components/resource-upload';
import { cn, uniqueById } from '@/lib/utils';
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
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.label}
              onClick={() => setType(t.value)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm',
                type === t.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:bg-accent',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <form
            className="relative"
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
              className="w-44 pl-9"
            />
          </form>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="recent">Recent</option>
            <option value="top">Top rated</option>
            <option value="downloads">Most downloaded</option>
          </select>
        </div>
      </div>

      {!isLoading && items.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No resources yet.</p>
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
  if (!data?.length) return <p className="py-12 text-center text-muted-foreground">Nothing saved yet.</p>;
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
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <BookOpen className="h-6 w-6 text-primary" />
            Resource Hub
          </h1>
          <p className="text-muted-foreground">
            Notes, PDFs, roadmaps & placement reports shared by students.
          </p>
        </div>
        <ResourceUpload />
      </div>

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>
        <TabsContent value="browse">
          <Browse />
        </TabsContent>
        <TabsContent value="saved">
          <Saved />
        </TabsContent>
      </Tabs>
    </div>
  );
}
