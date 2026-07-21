'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Activity,
  BadgeCheck,
  Ban,
  Flag,
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
  useAdminDeletePost,
  useAdminDeleteResource,
  useResolveReport,
  useSetUserStatus,
  useVerifyCollege,
} from '@/hooks/use-admin';
import { useDecideVerification, useVerificationQueue } from '@/hooks/use-verification';
import { useComplaints, useResolveComplaint } from '@/hooks/use-complaints';

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

// Lets the admin delete the reported content (post/resource) and resolve the report.
function ReportDeleteButton({
  targetType,
  targetId,
  onDeleted,
}: {
  targetType: string;
  targetId: string;
  onDeleted: () => void;
}) {
  const delPost = useAdminDeletePost();
  const delResource = useAdminDeleteResource();
  const label = targetType.toLowerCase();
  const mut = targetType === 'POST' ? delPost : targetType === 'RESOURCE' ? delResource : null;
  if (!mut) return null; // only POST/RESOURCE targets are directly deletable
  return (
    <Button
      size="sm"
      variant="outline"
      className="text-destructive"
      disabled={mut.isPending}
      onClick={() => {
        if (window.confirm(`Delete the reported ${label}? This can’t be undone.`)) {
          mut.mutate(targetId, {
            onSuccess: () => {
              onDeleted();
              toast.success(`${label.charAt(0).toUpperCase()}${label.slice(1)} deleted`);
            },
            onError: (e) => toast.error((e as Error).message),
          });
        }
      }}
    >
      Delete {label}
    </Button>
  );
}

// Flagged content reported by users — shown at the top.
function FlaggedReports() {
  const { data } = useReports('OPEN');
  const resolve = useResolveReport();
  const reports = data?.data ?? [];
  if (reports.length === 0) return null;
  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Flag className="h-4 w-4 text-destructive" /> Flagged content ({reports.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Reported by users — review and act.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {reports.slice(0, 6).map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background p-2"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{r.targetType}</Badge>
                <span className="text-sm font-medium">{r.reason}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                by {r.reporter?.profile?.fullName ?? 'User'} · target {r.targetId.slice(0, 8)}…
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              <ReportDeleteButton
                targetType={r.targetType}
                targetId={r.targetId}
                onDeleted={() => resolve.mutate({ id: r.id, status: 'RESOLVED' })}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => resolve.mutate({ id: r.id, status: 'DISMISSED' }, { onSuccess: () => toast.success('Dismissed') })}
              >
                Dismiss
              </Button>
              <Button
                size="sm"
                onClick={() => resolve.mutate({ id: r.id, status: 'RESOLVED' }, { onSuccess: () => toast.success('Resolved') })}
              >
                Resolve
              </Button>
            </div>
          </div>
        ))}
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
      <FlaggedReports />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total users" value={data.users.total} />
        <Stat label="DAU" value={data.users.dau} />
        <Stat label="MAU" value={data.users.mau} />
        <Stat label="Stickiness (DAU/MAU)" value={data.users.stickiness} />
        <Stat label="New today" value={data.users.newToday} />
        <Stat label="New this week" value={data.users.newThisWeek} />
        <Stat label="Open reports" value={data.moderation.openReports} />
      </div>

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
            <div className="flex flex-wrap gap-2">
              <ReportDeleteButton
                targetType={r.targetType}
                targetId={r.targetId}
                onDeleted={() => resolve.mutate({ id: r.id, status: 'RESOLVED' })}
              />
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
        <p className="text-sm text-muted-foreground">Send a notification to all users.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Body (optional)" value={body} onChange={(e) => setBody(e.target.value)} />
        <Input placeholder="Deeplink, e.g. /internship (optional)" value={link} onChange={(e) => setLink(e.target.value)} />
        <Button
          disabled={!title.trim() || broadcast.isPending}
          onClick={() =>
            broadcast.mutate(
              {
                type: 'SYSTEM',
                title,
                body: body || undefined,
                link: link || undefined,
              },
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
          Broadcast to all users
        </Button>
      </CardContent>
    </Card>
  );
}

const FB_LABELS: Record<string, string> = {
  placements: 'Placements & career outcomes',
  culture: 'Student culture & peer group',
  faculty: 'Faculty & learning quality',
  roi: 'ROI (fees vs placements)',
  location: 'Location & industry exposure',
};
const FB_ORDER = ['placements', 'culture', 'faculty', 'roi', 'location'];

function InfoCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="truncate text-sm">{children || '—'}</p>
    </div>
  );
}

function VerificationTab() {
  const { data, isLoading } = useVerificationQueue();
  const decide = useDecideVerification();
  const rows = data?.data ?? [];
  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!rows.length) return <p className="py-12 text-center text-muted-foreground">No pending verifications 🎉</p>;
  return (
    <div className="space-y-4">
      {rows.map((r) => {
        const isDoc = !!r.evidenceKey && /^https?:\/\//i.test(r.evidenceKey);
        return (
          <Card key={r.id} className="overflow-hidden">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold">{r.user.profile?.fullName ?? r.user.email}</span>
                <Badge variant="secondary">{r.method.replace('_', ' ').toLowerCase()}</Badge>
                {r.collegeEmailVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-600">
                    ✓ email authenticated
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => decide.mutate({ id: r.id, approve: false }, { onSuccess: () => toast.success('Rejected') })}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => decide.mutate({ id: r.id, approve: true }, { onSuccess: () => toast.success('Verified') })}
                >
                  Approve
                </Button>
              </div>
            </div>

            <CardContent className="space-y-4 p-4">
              {/* Details grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                <InfoCell label="College">
                  {r.college?.name ?? r.collegeName}
                  {!r.college && r.collegeName ? ' (new)' : ''}
                </InfoCell>
                <InfoCell label="Course">{r.user.profile?.branch}</InfoCell>
                <InfoCell label="Year">{r.user.profile?.year ? `Year ${r.user.profile.year}` : ''}</InfoCell>
                <InfoCell label="Account email">{r.user.email}</InfoCell>
                {r.method === 'COLLEGE_EMAIL' ? (
                  <InfoCell label="College email">{r.collegeEmail}</InfoCell>
                ) : (
                  <InfoCell label="Document">
                    {isDoc ? (
                      <a href={r.evidenceKey!} target="_blank" rel="noreferrer" className="text-primary underline">
                        Open document ↗
                      </a>
                    ) : (
                      r.evidenceKey
                    )}
                  </InfoCell>
                )}
              </div>

              {/* Honest feedback */}
              {r.feedback && Object.values(r.feedback).some(Boolean) && (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Student&apos;s honest feedback
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {FB_ORDER.filter((k) => r.feedback?.[k]).map((k) => (
                      <div key={k} className="rounded-lg border border-border p-2.5">
                        <p className="text-xs font-medium text-foreground">{FB_LABELS[k] ?? k}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">{r.feedback![k]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ComplaintsTab() {
  const { data, isLoading } = useComplaints();
  const resolve = useResolveComplaint();
  const items = data?.data ?? [];
  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (items.length === 0)
    return <p className="py-10 text-center text-muted-foreground">No complaints.</p>;
  return (
    <div className="space-y-3">
      {items.map((c) => (
        <Card key={c.id} className={c.status === 'RESOLVED' ? 'opacity-60' : undefined}>
          <CardContent className="flex flex-wrap items-start justify-between gap-3 p-4">
            <div>
              <p className="text-sm">{c.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {c.user?.profile?.fullName ?? c.user?.email ?? 'User'}
                {c.community ? ` · ${c.community.name}` : ''}
                {c.status === 'RESOLVED' ? ' · resolved' : ''}
              </p>
            </div>
            {c.status === 'OPEN' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => resolve.mutate(c.id, { onSuccess: () => toast.success('Resolved') })}
              >
                Mark resolved
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  useEffect(() => {
    if (hydrated && !isAdmin) router.replace('/home');
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
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="overview">
            <Activity className="mr-1 h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="users">
            <UsersIcon className="mr-1 h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
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
        <TabsContent value="verification">
          <VerificationTab />
        </TabsContent>
        <TabsContent value="complaints">
          <ComplaintsTab />
        </TabsContent>
        <TabsContent value="broadcast">
          <BroadcastTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
