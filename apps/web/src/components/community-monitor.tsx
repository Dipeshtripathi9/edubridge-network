'use client';

import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MemberManager } from '@/components/member-manager';
import { useCommunityBroadcast } from '@/hooks/use-notifications';
import { timeAgo } from '@/lib/utils';
import {
  useCommunityActivity,
  useCommunityAnalytics,
  useCommunityReports,
  useResolveCommunityReport,
} from '@/hooks/use-community-monitor';
import { useDecideOpportunity, usePendingOpportunities } from '@/hooks/use-opportunities';
import { useHelpRequests, useResolveHelp } from '@/hooks/use-help';

// Each manager role's primary responsibility + the tab it should land on.
const ROLE_INFO: Record<string, { desc: string; tab: string }> = {
  CAMPUS_LEAD: { desc: '👑 Campus Lead — overall community lead: members, content & oversight.', tab: 'members' },
  OPPORTUNITY_HEAD: { desc: '💼 Opportunity Head — review & approve opportunity submissions.', tab: 'opportunities' },
  STUDENT_RELATIONS_HEAD: { desc: '🤝 Student Relations Head — resolve help requests & student engagement.', tab: 'help' },
  MODERATOR: { desc: '🛡 Moderator — handle reports, mutes/bans & content.', tab: 'reports' },
  ADMIN: { desc: 'Community admin — full control of this community.', tab: 'members' },
};

function OpportunitiesQueue({ communityId, active }: { communityId: string; active: boolean }) {
  const { data, isLoading } = usePendingOpportunities(communityId, active);
  const decide = useDecideOpportunity(communityId);
  const items = data ?? [];
  if (isLoading) return <Skeleton className="h-32 w-full" />;
  if (items.length === 0)
    return <p className="py-8 text-center text-muted-foreground">No opportunities awaiting approval.</p>;
  return (
    <div className="space-y-2">
      {items.map((o) => (
        <Card key={o.id}>
          <CardContent className="flex items-center justify-between gap-2 p-3">
            <div>
              <p className="text-sm font-medium">{o.title}</p>
              <p className="text-xs text-muted-foreground">{o.type.toLowerCase()}</p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => decide.mutate({ id: o.id, approve: false }, { onSuccess: () => toast.success('Rejected') })}>
                Reject
              </Button>
              <Button size="sm" onClick={() => decide.mutate({ id: o.id, approve: true }, { onSuccess: () => toast.success('Approved') })}>
                Approve
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function HelpQueue({ slug, active }: { slug: string; active: boolean }) {
  const { data, isLoading } = useHelpRequests(slug, active);
  const resolve = useResolveHelp(slug);
  const items = data?.data ?? [];
  if (isLoading) return <Skeleton className="h-32 w-full" />;
  if (items.length === 0)
    return <p className="py-8 text-center text-muted-foreground">No help requests.</p>;
  return (
    <div className="space-y-2">
      {items.map((h) => (
        <Card key={h.id} className={h.status === 'RESOLVED' ? 'opacity-60' : undefined}>
          <CardContent className="flex items-start justify-between gap-2 p-3">
            <div>
              <p className="text-sm">{h.body}</p>
              <p className="text-xs text-muted-foreground">
                {h.user?.profile?.fullName ?? 'Member'}
                {h.status === 'RESOLVED' && ' · resolved'}
              </p>
            </div>
            {h.status === 'OPEN' && (
              <Button size="sm" variant="outline" onClick={() => resolve.mutate(h.id, { onSuccess: () => toast.success('Resolved') })}>
                Resolve
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Activity({ slug, active }: { slug: string; active: boolean }) {
  const { data, isLoading } = useCommunityActivity(slug, active);
  const posts = data?.data ?? [];
  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!posts.length) return <p className="py-8 text-center text-muted-foreground">No activity yet.</p>;
  return (
    <div className="space-y-2">
      {posts.map((p) => (
        <Card key={p.id}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{p.author.profile?.fullName ?? 'Student'}</span>
              <Badge variant="secondary" className="capitalize">{p.kind.replace(/_/g, ' ').toLowerCase()}</Badge>
              {p.status !== 'PUBLISHED' && <span className="text-destructive">{p.status}</span>}
              {p.isPinned && <span className="text-primary">pinned</span>}
              <span className="ml-auto">{timeAgo(p.createdAt)} ago</span>
            </div>
            <p className="mt-1 line-clamp-2 text-sm">{p.body}</p>
            <p className="mt-1 text-xs text-muted-foreground">♥ {p.likeCount} · 💬 {p.commentCount}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Reports({ slug, active }: { slug: string; active: boolean }) {
  const { data, isLoading } = useCommunityReports(slug, active);
  const resolve = useResolveCommunityReport(slug);
  const reports = data?.data ?? [];
  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!reports.length) return <p className="py-8 text-center text-muted-foreground">No open reports 🎉</p>;
  return (
    <div className="space-y-2">
      {reports.map((r) => (
        <Card key={r.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3">
            <div>
              <div className="flex items-center gap-1 text-sm">
                <Badge variant="secondary">{r.targetType}</Badge>
                <span className="font-medium">{r.reason}</span>
              </div>
              {r.details && <p className="text-xs text-muted-foreground">{r.details}</p>}
              <p className="text-xs text-muted-foreground">by {r.reporter?.profile?.fullName ?? 'User'}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => resolve.mutate({ id: r.id, status: 'DISMISSED' }, { onSuccess: () => toast.success('Dismissed') })}>Dismiss</Button>
              <Button size="sm" onClick={() => resolve.mutate({ id: r.id, status: 'RESOLVED' }, { onSuccess: () => toast.success('Resolved') })}>Resolve</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Analytics({ slug, active }: { slug: string; active: boolean }) {
  const { data, isLoading } = useCommunityAnalytics(slug, active);
  if (isLoading || !data) return <Skeleton className="h-40 w-full" />;
  const stats = [
    ['Members', data.members],
    ['Posts', data.posts],
    ['Posts (7d)', data.postsThisWeek],
    ['Comments', data.comments],
    ['Open reports', data.openReports],
  ] as const;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-4">
          <p className="mb-2 text-sm font-semibold">Top contributors</p>
          {data.topContributors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contributors yet.</p>
          ) : (
            data.topContributors.map((u) => (
              <div key={u.id} className="flex justify-between py-1 text-sm">
                <span>
                  {u.fullName} <Badge variant="secondary">{u.role.replace(/_/g, ' ').toLowerCase()}</Badge>
                </span>
                <span className="text-muted-foreground">{u.reputationPoints} pts</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BroadcastToCommunity({ communityId }: { communityId: string }) {
  const broadcast = useCommunityBroadcast(communityId);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Megaphone className="h-4 w-4" /> Broadcast to members
      </Button>
    );
  }
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="space-y-2 p-3">
        <p className="text-sm font-medium">Notify every member of this community</p>
        <Input placeholder="Title (e.g. New event this Friday)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Message (optional)" value={body} onChange={(e) => setBody(e.target.value)} />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!title.trim() || broadcast.isPending}
            onClick={() =>
              broadcast.mutate(
                { title: title.trim(), body: body.trim() || undefined },
                {
                  onSuccess: (r) => {
                    toast.success(`Sent to ${r.sent} members`);
                    setOpen(false);
                    setTitle('');
                    setBody('');
                  },
                  onError: (e) => toast.error((e as Error).message),
                },
              )
            }
          >
            Send broadcast
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function CommunityMonitor({
  slug,
  communityId,
  myRole,
}: {
  slug: string;
  communityId?: string;
  myRole?: string | null;
}) {
  const info = (myRole && ROLE_INFO[myRole]) || ROLE_INFO.ADMIN;
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <p className="rounded-md border border-primary/30 bg-primary/5 p-2 text-sm text-muted-foreground">
          {info.desc}
        </p>
        {communityId && <BroadcastToCommunity communityId={communityId} />}
        <Tabs defaultValue={communityId ? info.tab : info.tab === 'opportunities' ? 'members' : info.tab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="members">Members</TabsTrigger>
            {communityId && <TabsTrigger value="opportunities">Opportunities</TabsTrigger>}
            <TabsTrigger value="help">Help</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="members">
            <MemberManager slug={slug} />
          </TabsContent>
          {communityId && (
            <TabsContent value="opportunities">
              <OpportunitiesQueue communityId={communityId} active />
            </TabsContent>
          )}
          <TabsContent value="help">
            <HelpQueue slug={slug} active />
          </TabsContent>
          <TabsContent value="reports">
            <Reports slug={slug} active />
          </TabsContent>
          <TabsContent value="activity">
            <Activity slug={slug} active />
          </TabsContent>
          <TabsContent value="analytics">
            <Analytics slug={slug} active />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
