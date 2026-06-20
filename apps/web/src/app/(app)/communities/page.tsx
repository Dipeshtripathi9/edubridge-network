'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { CommunityCard } from '@/components/community-card';
import { useCommunities } from '@/hooks/use-communities';

export default function CommunitiesPage() {
  const [type, setType] = useState<string | undefined>(undefined);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useCommunities({
    type,
    q: search || undefined,
  });
  const communities = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Communities</h1>
          <p className="text-muted-foreground">Connect with your college and topics you love.</p>
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
            placeholder="Search communities…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </form>
      </div>

      <Tabs defaultValue="all" onValueChange={(v) => setType(v === 'all' ? undefined : v)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="COLLEGE">Colleges</TabsTrigger>
          <TabsTrigger value="TOPIC">Topics</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : communities.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No communities found.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {communities.map((c) => (
              <CommunityCard key={c.id} community={c} />
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
