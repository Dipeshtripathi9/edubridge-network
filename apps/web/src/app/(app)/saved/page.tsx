'use client';

import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHero } from '@/components/page-hero';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { PostCard } from '@/components/post-card';
import { OpportunityCard } from '@/components/opportunity-card';
import { ResourceCard } from '@/components/resource-card';
import { useMyApplications } from '@/hooks/use-opportunities';
import { useMySavedPosts } from '@/hooks/use-posts';
import { useMyResourceBookmarks } from '@/hooks/use-resources';

function Empty({ label }: { label: string }) {
  return (
    <EmptyState
      icon={Bookmark}
      title={`No saved ${label} yet`}
      description="Bookmark posts, save opportunities and rate resources to collect them here."
    />
  );
}

export default function SavedPage() {
  const { data: apps, isLoading: appsLoading } = useMyApplications();
  const { data: posts, isLoading: postsLoading } = useMySavedPosts();
  const { data: resources, isLoading: resLoading } = useMyResourceBookmarks();

  const savedOpps = (apps ?? []).filter((a) => a.status === 'SAVED');

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHero
        eyebrow="Saved"
        title="Everything you"
        accent="bookmarked."
        sub="Your saved opportunities, posts and resources — in one place."
      />

      <Tabs defaultValue="opportunities">
        <TabsList className="flex-wrap">
          <TabsTrigger value="opportunities">Opportunities ({savedOpps.length})</TabsTrigger>
          <TabsTrigger value="posts">Posts ({posts?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="resources">Resources ({resources?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities">
          {appsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : savedOpps.length === 0 ? (
            <Empty label="opportunities" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {savedOpps.map((a) => (
                <OpportunityCard key={a.id} opportunity={a.opportunity} savedApplicationId={a.id} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          {postsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (posts?.length ?? 0) === 0 ? (
            <Empty label="posts" />
          ) : (
            posts!.map((p) => (
              <div key={p.id} className="space-y-1">
                {p.community && (
                  <Link href={`/communities/${p.community.slug}`} className="text-xs text-primary hover:underline">
                    {p.community.name}
                  </Link>
                )}
                <PostCard post={p} slug={p.community?.slug ?? ''} />
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="resources">
          {resLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (resources?.length ?? 0) === 0 ? (
            <Empty label="resources" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resources!.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm text-muted-foreground">
          <span>Bookmark posts (🔖), save opportunities & rate/save resources to see them here.</span>
          <Button asChild size="sm" variant="outline">
            <Link href="/opportunities">Browse opportunities</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
