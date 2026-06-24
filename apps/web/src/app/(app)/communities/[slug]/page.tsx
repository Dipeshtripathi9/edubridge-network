'use client';

import { use, useState } from 'react';
import { Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CommunityMonitor } from '@/components/community-monitor';
import { CommunitySections } from '@/components/community-sections';
import { ApplyHead } from '@/components/apply-head';
import { isCommunityManager, useCommunity, useJoinCommunity } from '@/hooks/use-communities';
import { useMe } from '@/hooks/use-profile';
import { useAuthStore } from '@/stores/auth.store';

export default function CommunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: community, isLoading } = useCommunity(slug);
  const join = useJoinCommunity(slug);
  const [showManage, setShowManage] = useState(false);
  const globalRole = useAuthStore((s) => s.user?.role);
  const { data: me } = useMe();
  const canModerate =
    isCommunityManager(community?.myRole) ||
    globalRole === 'ADMIN' ||
    globalRole === 'SUPER_ADMIN' ||
    globalRole === 'MODERATOR';

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!community) {
    return <p className="py-16 text-center text-muted-foreground">Community not found.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="h-28 bg-gradient-to-r from-primary/30 to-accent" />
        <div className="flex items-center justify-between p-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{community.name}</h1>
              <Badge variant="secondary">
                {community.type === 'COLLEGE' ? 'College' : community.topic ?? 'Topic'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{community.description}</p>
            <span className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {community.memberCount.toLocaleString()} members · {community.postCount} posts
            </span>
          </div>
          <div className="flex gap-2">
            {canModerate && (
              <Button variant="outline" onClick={() => setShowManage((v) => !v)}>
                <Settings className="h-4 w-4" /> Manage
              </Button>
            )}
            <Button
              variant={community.isMember ? 'outline' : 'default'}
              disabled={join.isPending}
              onClick={() => join.mutate(!community.isMember)}
            >
              {community.isMember ? 'Joined' : 'Join'}
            </Button>
          </div>
        </div>
      </div>

      {canModerate && showManage && (
        <CommunityMonitor slug={slug} communityId={community.id} myRole={community.myRole} />
      )}

      {community.isMember &&
        community.myRole === 'MEMBER' &&
        me?.profile?.collegeVerification === 'VERIFIED' && <ApplyHead slug={slug} />}

      <CommunitySections
        slug={slug}
        communityId={community.id}
        canModerate={canModerate}
        collegeSlug={community.college?.slug}
        isMember={community.isMember}
        type={community.type}
      />
    </div>
  );
}
