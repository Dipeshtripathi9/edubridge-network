'use client';

import { Bookmark } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHero } from '@/components/page-hero';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ResourceCard } from '@/components/resource-card';
import { useMyResourceBookmarks } from '@/hooks/use-resources';

function Empty({ label }: { label: string }) {
  return (
    <EmptyState
      icon={Bookmark}
      title={`No saved ${label} yet`}
      description="Rate resources to collect them here."
    />
  );
}

export default function SavedPage() {
  const { data: resources, isLoading: resLoading } = useMyResourceBookmarks();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHero
        eyebrow="Saved"
        title="Everything you"
        accent="bookmarked."
        sub="Your saved resources — in one place."
      />

      <section>
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
      </section>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm text-muted-foreground">
          <span>Rate/save resources to see them here.</span>
        </CardContent>
      </Card>
    </div>
  );
}
