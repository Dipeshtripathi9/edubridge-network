'use client';

import { use, useState } from 'react';
import { Settings, Share2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CommunityMonitor } from '@/components/community-monitor';
import { CommunitySections } from '@/components/community-sections';
import { ApplyHead } from '@/components/apply-head';
import { isCommunityManager, useCommunity, useJoinCommunity } from '@/hooks/use-communities';
import { seededCollegeMembers, seededInterestMembers } from '@/lib/utils';
import { useMe } from '@/hooks/use-profile';
import { useAuthStore } from '@/stores/auth.store';

export default function CommunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: community, isLoading } = useCommunity(slug);
  const { data: me } = useMe();
  const join = useJoinCommunity(slug);
  const [showManage, setShowManage] = useState(false);
  const globalRole = useAuthStore((s) => s.user?.role);
  const loggedIn = useAuthStore((s) => !!s.accessToken);
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
                {community.type === 'COLLEGE'
                  ? 'College'
                  : community.type === 'STARTUP'
                    ? 'Startup'
                    : community.topic ?? 'Interest'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{community.description}</p>
            <span className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {(community.type === 'COLLEGE'
                ? Math.max(community.memberCount, seededCollegeMembers(community.id))
                : community.type === 'TOPIC'
                  ? Math.max(community.memberCount, seededInterestMembers(community.id))
                  : community.memberCount
              ).toLocaleString()}{' '}
              members · {community.postCount} posts
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              title="Share this community"
              onClick={() => {
                navigator.clipboard
                  ?.writeText(`${window.location.origin}/communities/${slug}`)
                  .catch(() => {});
                toast.success('Community link copied to clipboard');
              }}
            >
              <Share2 className="h-4 w-4" /> Share
            </Button>
            {canModerate && (
              <Button variant="outline" onClick={() => setShowManage((v) => !v)}>
                <Settings className="h-4 w-4" /> Manage
              </Button>
            )}
            <Button
              variant={community.isMember ? 'outline' : 'default'}
              disabled={join.isPending}
              onClick={() =>
                loggedIn
                  ? join.mutate(!community.isMember, { onError: (err) => toast.error((err as Error).message) })
                  : window.location.assign('/login')
              }
            >
              {community.isMember ? 'Joined' : 'Join'}
            </Button>
          </div>
        </div>
      </div>

      {canModerate && showManage && (
        <CommunityMonitor slug={slug} communityId={community.id} myRole={community.myRole} />
      )}

      {community.isMember && community.myRole === 'MEMBER' && (
        <ApplyHead
          slug={slug}
          hiringOpen={community.hiringOpen}
          hiringNote={community.hiringNote}
          verified={me?.profile?.collegeVerification === 'VERIFIED'}
          eligible={community.type !== 'COLLEGE' || me?.profile?.college?.id === community.college?.id}
          collegeName={community.college?.name}
        />
      )}

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
