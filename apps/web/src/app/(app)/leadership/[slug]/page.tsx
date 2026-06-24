'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CommunityMonitor } from '@/components/community-monitor';
import { isCommunityManager, useCommunity } from '@/hooks/use-communities';
import { useAuthStore } from '@/stores/auth.store';

const roleLabel = (r: string) => r.replace(/_/g, ' ').toLowerCase();

export default function ManageCommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: community, isLoading } = useCommunity(slug);
  const globalRole = useAuthStore((s) => s.user?.role);
  const canManage =
    isCommunityManager(community?.myRole) ||
    globalRole === 'ADMIN' ||
    globalRole === 'SUPER_ADMIN' ||
    globalRole === 'MODERATOR';

  if (isLoading) return <Skeleton className="mx-auto h-72 max-w-4xl" />;
  if (!community) return <p className="py-16 text-center text-muted-foreground">Community not found.</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/leadership">
          <ArrowLeft className="h-4 w-4" /> Leadership
        </Link>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ShieldCheck className="h-6 w-6 text-primary" /> {community.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Managing as{' '}
            <Badge className="capitalize">{roleLabel(community.myRole ?? 'manager')}</Badge>
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/communities/${slug}`}>Open community</Link>
        </Button>
      </div>

      {canManage ? (
        <CommunityMonitor slug={slug} communityId={community.id} myRole={community.myRole} />
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            You don&apos;t hold a leadership post in this community.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
