'use client';

import { use } from 'react';
import { uniqueById, seededCollegeMembers } from '@/lib/utils';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  GraduationCap,
  MapPin,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { Megaphone } from 'lucide-react';
import { Composer } from '@/components/composer';
import { PostCard } from '@/components/post-card';
import { OpportunityCard } from '@/components/opportunity-card';
import { ResourceCard } from '@/components/resource-card';
import { ResourceUpload } from '@/components/resource-upload';
import { PoolsSection } from '@/components/pools-section';
import { OpportunitiesSection } from '@/components/community-sections';
import { isCommunityManager, useCommunity, useJoinCommunity } from '@/hooks/use-communities';
import { useFeed } from '@/hooks/use-posts';
import { useOpportunities } from '@/hooks/use-opportunities';
import { useResources } from '@/hooks/use-resources';
import {
  useCollegeHub,
  useCollegeTransferStories,
  useFaqs,
} from '@/hooks/use-college-hub';
import { useAuthStore } from '@/stores/auth.store';

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <span className="font-semibold">{value.toLocaleString()}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

function SectionFeed({
  slug,
  section,
  canModerate,
  empty,
}: {
  slug: string;
  section: 'ANNOUNCEMENTS' | 'DISCUSSION' | 'POLLS';
  canModerate: boolean;
  empty: string;
}) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed(slug, section);
  const posts = uniqueById(data?.pages.flatMap((p) => p.data) ?? []);
  const showComposer = section !== 'ANNOUNCEMENTS' || canModerate;
  const placeholder =
    section === 'ANNOUNCEMENTS'
      ? 'Post an announcement…'
      : section === 'POLLS'
        ? 'Ask the community…'
        : 'Start a discussion…';
  return (
    <div className="space-y-4">
      {showComposer ? (
        <Composer
          slug={slug}
          kind={section === 'ANNOUNCEMENTS' ? 'ANNOUNCEMENT' : undefined}
          placeholder={placeholder}
        />
      ) : (
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <Megaphone className="h-4 w-4" /> Only community heads can post announcements.
        </p>
      )}
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : posts.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">{empty}</p>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} slug={slug} canModerate={canModerate} />)
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

function Opportunities({ collegeId }: { collegeId: string }) {
  const { data, isLoading } = useOpportunities({ collegeId });
  const items = uniqueById(data?.pages.flatMap((p) => p.data) ?? []);
  if (isLoading) return <Skeleton className="h-40 w-full" />;
  return items.length === 0 ? (
    <p className="py-10 text-center text-muted-foreground">No opportunities yet.</p>
  ) : (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((o) => (
        <OpportunityCard key={o.id} opportunity={o} />
      ))}
    </div>
  );
}

function Transfers({ collegeId }: { collegeId: string }) {
  const { data, isLoading } = useCollegeTransferStories(collegeId);
  const stories = data?.data ?? [];
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <p className="text-sm text-muted-foreground">
            Considering transferring here? Check eligibility & requirements.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/transfer">
              Transfer Hub <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : stories.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">No transfer stories for this college yet.</p>
      ) : (
        stories.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Avatar src={s.user.profile?.avatarUrl} name={s.user.profile?.fullName} />
                <p className="text-sm font-medium">{s.user.profile?.fullName ?? 'Student'}</p>
                <span className="text-xs text-muted-foreground">
                  {s.fromCollege?.name ?? '—'} → {s.toCollege?.name ?? '—'}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{s.story}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function Resources({ collegeId }: { collegeId: string }) {
  const { data, isLoading } = useResources({ collegeId });
  const items = uniqueById(data?.pages.flatMap((p) => p.data) ?? []);
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ResourceUpload collegeId={collegeId} />
      </div>
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">No resources shared yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function Faqs({ collegeId }: { collegeId: string }) {
  const { data, isLoading } = useFaqs(collegeId);
  if (isLoading) return <Skeleton className="h-32 w-full" />;
  if (!data?.length) return <p className="py-10 text-center text-muted-foreground">No FAQs yet.</p>;
  return (
    <div className="space-y-3">
      {data.map((f) => {
        // FAQs that route to expert guidance get a clickable CTA to the guidance page.
        const isGuidance = f.answer.includes('Get Expert Guidance');
        return (
          <Card key={f.id}>
            <CardContent className="p-4">
              <p className="font-medium">{f.question}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.answer}</p>
              {isGuidance && (
                <Button asChild size="sm" className="mt-3">
                  <Link href="/home#get-expert-guidance">
                    Get Expert Guidance <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function CollegeHubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: hub, isLoading } = useCollegeHub(slug);
  const { data: community } = useCommunity(hub?.community?.slug ?? '');
  const join = useJoinCommunity(hub?.community?.slug ?? '');
  const globalRole = useAuthStore((s) => s.user?.role);
  const canModerate =
    isCommunityManager(community?.myRole) ||
    globalRole === 'ADMIN' ||
    globalRole === 'SUPER_ADMIN' ||
    globalRole === 'MODERATOR';

  if (isLoading) return <Skeleton className="mx-auto h-72 max-w-5xl" />;
  if (!hub) return <p className="py-16 text-center text-muted-foreground">College not found.</p>;

  const c = hub.college;
  const communitySlug = hub.community?.slug;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="h-32 bg-gradient-to-r from-primary/40 via-primary/20 to-accent" />
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <span className="-mt-12 flex h-20 w-20 items-center justify-center rounded-xl border-4 border-background bg-primary/10 text-primary">
              <GraduationCap className="h-9 w-9" />
            </span>
            <div>
              <h1 className="text-2xl font-bold">{c.name}</h1>
              <p className="text-sm text-muted-foreground">Connect • Share • Grow Together</p>
              {(c.city || c.state) && (
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {[c.city, c.state].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>
          {communitySlug && (
            <Button
              variant={community?.isMember ? 'outline' : 'default'}
              disabled={join.isPending}
              onClick={() => join.mutate(!community?.isMember)}
            >
              {community?.isMember ? 'Joined' : 'Join Community'}
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border px-5 py-3">
          <Stat
            icon={BadgeCheck}
            label="Verified Students"
            value={Math.max(hub.counts.verifiedStudents, seededCollegeMembers(c.id))}
          />
        </div>
      </div>

      {/* Sections — same style as every community, plus college-only Transfers & FAQs */}
      <Tabs defaultValue="opportunities">
        <TabsList className="flex-wrap">
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="resources">Resources ({hub.counts.resources})</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
          <TabsTrigger value="polls">Polls</TabsTrigger>
          <TabsTrigger value="pools">Pools</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="faqs">FAQs ({hub.counts.faqs})</TabsTrigger>
        </TabsList>

        {communitySlug ? (
          <>
            <TabsContent value="announcements">
              <SectionFeed slug={communitySlug} section="ANNOUNCEMENTS" canModerate={canModerate} empty="No announcements yet." />
            </TabsContent>
            <TabsContent value="discussion">
              <SectionFeed slug={communitySlug} section="DISCUSSION" canModerate={canModerate} empty="No discussions yet — start one!" />
            </TabsContent>
            <TabsContent value="polls">
              <SectionFeed slug={communitySlug} section="POLLS" canModerate={canModerate} empty="No polls yet." />
            </TabsContent>
            <TabsContent value="pools">
              <PoolsSection slug={communitySlug} />
            </TabsContent>
          </>
        ) : (
          <>
            <TabsContent value="announcements">
              <p className="py-10 text-center text-muted-foreground">No community for this college yet.</p>
            </TabsContent>
            <TabsContent value="discussion">
              <p className="py-10 text-center text-muted-foreground">No community for this college yet.</p>
            </TabsContent>
            <TabsContent value="polls">
              <p className="py-10 text-center text-muted-foreground">No community for this college yet.</p>
            </TabsContent>
            <TabsContent value="pools">
              <p className="py-10 text-center text-muted-foreground">No community for this college yet.</p>
            </TabsContent>
          </>
        )}

        <TabsContent value="resources">
          <Resources collegeId={c.id} />
        </TabsContent>
        <TabsContent value="opportunities">
          {hub.community ? (
            <OpportunitiesSection
              communityId={hub.community.id}
              canModerate={canModerate}
              isMember={!!community?.isMember}
            />
          ) : (
            <Opportunities collegeId={c.id} />
          )}
        </TabsContent>
        <TabsContent value="transfers">
          <Transfers collegeId={c.id} />
        </TabsContent>
        <TabsContent value="faqs">
          <Faqs collegeId={c.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
