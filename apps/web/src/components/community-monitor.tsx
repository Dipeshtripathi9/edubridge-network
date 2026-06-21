'use client';

import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MemberManager } from '@/components/member-manager';
import { timeAgo } from '@/lib/utils';
import {
  useCommunityActivity,
  useCommunityAnalytics,
  useCommunityReports,
  useResolveCommunityReport,
} from '@/hooks/use-community-monitor';

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
              <p className="text-sm">
                <Badge variant="secondary">{r.targetType}</Badge> <span className="font-medium">{r.reason}</span>
              </p>
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

export function CommunityMonitor({ slug }: { slug: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <Tabs defaultValue="members">
          <TabsList className="flex-wrap">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="members">
            <MemberManager slug={slug} />
          </TabsContent>
          <TabsContent value="activity">
            <Activity slug={slug} active />
          </TabsContent>
          <TabsContent value="reports">
            <Reports slug={slug} active />
          </TabsContent>
          <TabsContent value="analytics">
            <Analytics slug={slug} active />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
