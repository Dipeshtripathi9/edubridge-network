'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Activity,
  BadgeCheck,
  Ban,
  Megaphone,
  ShieldCheck,
  Users as UsersIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth.store';
import {
  useAdminUsers,
  useAnalytics,
  useBroadcast,
  useReports,
  useResolveReport,
  useSetUserStatus,
  useVerifyCollege,
} from '@/hooks/use-admin';

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function Overview() {
  const { data, isLoading } = useAnalytics();
  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total users" value={data.users.total} />
        <Stat label="DAU" value={data.users.dau} />
        <Stat label="MAU" value={data.users.mau} />
        <Stat label="Stickiness (DAU/MAU)" value={data.users.stickiness} />
        <Stat label="New today" value={data.users.newToday} />
        <Stat label="New this week" value={data.users.newThisWeek} />
        <Stat label="Posts (7d)" value={data.content.postsThisWeek} />
        <Stat label="Open reports" value={data.moderation.openReports} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Communities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topCommunities.map((c) => (
              <div key={c.id} className="flex justify-between text-sm">
                <span className="truncate">{c.name}</span>
                <span className="text-muted-foreground">{c.memberCount}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Colleges (reviews)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topColleges.map((c) => (
              <div key={c.id} className="flex justify-between text-sm">
                <span className="truncate">{c.name}</span>
                <span className="text-muted-foreground">
                  {c.reviewCount} · {c.avgRating.toFixed(1)}★
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Contributors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topContributors.map((u) => (
              <div key={u.id} className="flex justify-between text-sm">
                <span className="truncate">{u.profile?.fullName ?? 'Student'}</span>
                <span className="text-muted-foreground">{u.reputationPoints} pts</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-500/10 text-green-600 dark:text-green-400',
  SUSPENDED: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  BANNED: 'bg-red-500/10 text-red-600 dark:text-red-400',
  PENDING_VERIFICATION: 'bg-slate-500/10 text-slate-500',
};

function UsersTab() {
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAdminUsers({ q: search || undefined });
  const setStatus = useSetUserStatus();
  const verify = useVerifyCollege();
  const users = data?.data ?? [];

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(q);
        }}
        className="max-w-sm"
      >
        <Input placeholder="Search by name or email…" value={q} onChange={(e) => setQ(e.target.value)} />
      </form>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {users.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center gap-3 p-4">
                <Avatar src={u.profile?.avatarUrl} name={u.profile?.fullName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{u.profile?.fullName ?? 'Student'}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[u.status] ?? ''}`}>
                  {u.status}
                </span>
                {u.profile?.collegeVerification === 'VERIFIED' && (
                  <BadgeCheck className="h-4 w-4 text-green-500" />
                )}
                <div className="flex gap-1">
                  {u.profile?.collegeVerification !== 'VERIFIED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        verify.mutate(
                          { id: u.id, status: 'VERIFIED' },
                          { onSuccess: () => toast.success('Verified') },
                        )
                      }
                    >
                      Verify
                    </Button>
                  )}
                  {u.status !== 'SUSPENDED' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setStatus.mutate(
                          { id: u.id, status: 'SUSPENDED' },
                          { onSuccess: () => toast.success('Suspended'), onError: (e) => toast.error((e as Error).message) },
                        )
                      }
                    >
                      Suspend
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setStatus.mutate(
                          { id: u.id, status: 'ACTIVE' },
                          { onSuccess: () => toast.success('Reactivated') },
                        )
                      }
                    >
                      Reactivate
                    </Button>
                  )}
                  {u.status !== 'BANNED' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        setStatus.mutate(
                          { id: u.id, status: 'BANNED' },
                          { onSuccess: () => toast.success('Banned'), onError: (e) => toast.error((e as Error).message) },
                        )
                      }
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReportsTab() {
  const { data, isLoading } = useReports('OPEN');
  const resolve = useResolveReport();
  const reports = data?.data ?? [];

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!reports.length) return <p className="py-12 text-center text-muted-foreground">No open reports 🎉</p>;

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <Card key={r.id}>
          <CardContent className="flex flex-wrap items-start justify-between gap-3 p-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{r.targetType}</Badge>
                <span className="font-medium">{r.reason}</span>
              </div>
              {r.details && <p className="mt-1 text-sm text-muted-foreground">{r.details}</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                by {r.reporter?.profile?.fullName ?? 'User'} · target {r.targetId.slice(0, 8)}…
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  resolve.mutate({ id: r.id, status: 'DISMISSED' }, { onSuccess: () => toast.success('Dismissed') })
                }
              >
                Dismiss
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  resolve.mutate({ id: r.id, status: 'RESOLVED' }, { onSuccess: () => toast.success('Resolved') })
                }
              >
                Resolve
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function BroadcastTab() {
  const broadcast = useBroadcast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [link, setLink] = useState('');

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="text-base">Broadcast a notification</CardTitle>
        <p className="text-sm text-muted-foreground">Sends to all active users (e.g. a new scholarship).</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Body (optional)" value={body} onChange={(e) => setBody(e.target.value)} />
        <Input placeholder="Deeplink, e.g. /opportunities (optional)" value={link} onChange={(e) => setLink(e.target.value)} />
        <Button
          disabled={!title.trim() || broadcast.isPending}
          onClick={() =>
            broadcast.mutate(
              { type: 'SYSTEM', title, body: body || undefined, link: link || undefined },
              {
                onSuccess: (r) => {
                  toast.success(`Sent to ${r.sent} users`);
                  setTitle('');
                  setBody('');
                  setLink('');
                },
                onError: (e) => toast.error((e as Error).message),
              },
            )
          }
        >
          <Megaphone className="h-4 w-4" />
          Broadcast
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  useEffect(() => {
    if (hydrated && !isAdmin) router.replace('/dashboard');
  }, [hydrated, isAdmin, router]);

  if (!hydrated || !isAdmin) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground">Moderation, analytics and platform management.</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">
            <Activity className="mr-1 h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="users">
            <UsersIcon className="mr-1 h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Overview />
        </TabsContent>
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>
        <TabsContent value="broadcast">
          <BroadcastTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
