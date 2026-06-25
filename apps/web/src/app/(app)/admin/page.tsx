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
  useResolveReport,
  useSetUserStatus,
  useVerifyCollege,
} from '@/hooks/use-admin';
import { useDecideVerification, useVerificationQueue } from '@/hooks/use-verification';
import {
  HEAD_ROLES,
  useAppointHead,
  useDecideHeadApp,
  useHeadAppQueue,
  useSetCommunityHiring,
} from '@/hooks/use-heads';
import Link from 'next/link';
import {
  useCommunities,
  useCreateCommunity,
  useDeleteCommunity,
  useUpdateCommunity,
} from '@/hooks/use-communities';
import { useColleges } from '@/hooks/use-colleges';
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

// Flagged posts/content reported by community leaders & users — shown at the top.
function FlaggedReports() {
  const { data } = useReports('OPEN');
  const resolve = useResolveReport();
  const deletePost = useAdminDeletePost();
  const reports = data?.data ?? [];
  if (reports.length === 0) return null;
  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Flag className="h-4 w-4 text-destructive" /> Flagged content ({reports.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Reported by community leaders & members — review and act.
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
            <div className="flex gap-1">
              {r.targetType === 'POST' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => {
                    if (window.confirm('Delete the reported post?')) {
                      deletePost.mutate(r.targetId, {
                        onSuccess: () => {
                          resolve.mutate({ id: r.id, status: 'RESOLVED' });
                          toast.success('Post deleted');
                        },
                        onError: (e: unknown) => toast.error((e as Error).message),
                      });
                    }
                  }}
                >
                  Delete post
                </Button>
              )}
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
  const { data: communitiesData } = useCommunities();
  const communities = communitiesData?.pages.flatMap((p) => p.data) ?? [];
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [link, setLink] = useState('');
  // 'all' = everyone; otherwise a community id.
  const [target, setTarget] = useState<string>('all');

  const targetName =
    target === 'all' ? 'all users' : communities.find((c) => c.id === target)?.name ?? 'community';

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="text-base">Broadcast a notification</CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose the audience: everyone, or members of a specific community.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Send to</label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="all">All communities / all users</option>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.memberCount} members)
              </option>
            ))}
          </select>
        </div>
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Body (optional)" value={body} onChange={(e) => setBody(e.target.value)} />
        <Input placeholder="Deeplink, e.g. /opportunities (optional)" value={link} onChange={(e) => setLink(e.target.value)} />
        <Button
          disabled={!title.trim() || broadcast.isPending}
          onClick={() =>
            broadcast.mutate(
              {
                type: 'SYSTEM',
                title,
                body: body || undefined,
                link: link || undefined,
                communityId: target === 'all' ? undefined : target,
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
          Broadcast to {targetName}
        </Button>
      </CardContent>
    </Card>
  );
}

function VerificationTab() {
  const { data, isLoading } = useVerificationQueue();
  const decide = useDecideVerification();
  const rows = data?.data ?? [];
  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!rows.length) return <p className="py-12 text-center text-muted-foreground">No pending verifications 🎉</p>;
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <Card key={r.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{r.user.profile?.fullName ?? r.user.email}</span>
                <Badge variant="secondary">{r.method.replace('_', ' ').toLowerCase()}</Badge>
                {r.college && <span className="text-xs text-muted-foreground">{r.college.name}</span>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {r.collegeEmail ? `email: ${r.collegeEmail}` : r.evidenceKey ? `doc: ${r.evidenceKey}` : ''}
                {r.user.profile?.branch ? ` · ${r.user.profile.branch}` : ''}
                {r.user.profile?.year ? ` · Year ${r.user.profile.year}` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  decide.mutate({ id: r.id, approve: false }, { onSuccess: () => toast.success('Rejected') })
                }
              >
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  decide.mutate({ id: r.id, approve: true }, { onSuccess: () => toast.success('Verified') })
                }
              >
                Approve
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AllCommunities() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useCommunities();
  const appoint = useAppointHead();
  const setHiring = useSetCommunityHiring();
  const update = useUpdateCommunity();
  const del = useDeleteCommunity();
  const [q, setQ] = useState('');
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('CAMPUS_LEAD');
  const [hiringSlug, setHiringSlug] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTopic, setEditTopic] = useState('');
  const all = data?.pages.flatMap((p) => p.data) ?? [];
  const term = q.trim().toLowerCase();
  const items = term ? all.filter((c) => c.name.toLowerCase().includes(term)) : all;

  const typeLabel = (t: string) =>
    t === 'COLLEGE' ? 'College' : t === 'STARTUP' ? 'Startup' : 'Topic';

  const toggle = (slug: string) => {
    setOpenSlug((cur) => (cur === slug ? null : slug));
    setHiringSlug(null);
    setEmail('');
    setRole('CAMPUS_LEAD');
  };
  const toggleHiring = (slug: string, currentNote?: string | null) => {
    setHiringSlug((cur) => (cur === slug ? null : slug));
    setOpenSlug(null);
    setNote(currentNote ?? '');
  };
  const toggleEdit = (slug: string, name: string, topic?: string | null) => {
    setEditSlug((cur) => (cur === slug ? null : slug));
    setOpenSlug(null);
    setHiringSlug(null);
    setEditName(name);
    setEditTopic(topic ?? '');
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">All communities ({all.length})</h3>
        <Input
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-8 w-48"
        />
      </div>
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <div className="space-y-2">
          {items.map((c) => (
            <Card key={c.id}>
              <CardContent className="space-y-2 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">
                      {c.name}{' '}
                      {c.hiringOpen && (
                        <span className="ml-1 rounded bg-green-500/15 px-1.5 py-0.5 text-xs text-green-600">
                          hiring
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {typeLabel(c.type)} · {c.memberCount.toLocaleString()} members
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleHiring(c.slug, c.hiringNote)}>
                      {hiringSlug === c.slug ? 'Cancel' : 'Hiring'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggle(c.slug)}>
                      {openSlug === c.slug ? 'Cancel' : 'Appoint here'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggleEdit(c.slug, c.name, c.topic)}>
                      {editSlug === c.slug ? 'Cancel' : 'Edit'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={() => {
                        if (window.confirm(`Delete "${c.name}"? This removes its posts, members & pools.`)) {
                          del.mutate(c.slug, {
                            onSuccess: () => toast.success('Community deleted'),
                            onError: (e) => toast.error((e as Error).message),
                          });
                        }
                      }}
                    >
                      Delete
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/leadership/${c.slug}`}>Manage</Link>
                    </Button>
                  </div>
                </div>

                {editSlug === c.slug && (
                  <div className="space-y-2 rounded-md border border-border p-2">
                    <Input
                      placeholder="Community name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-9"
                    />
                    {c.type !== 'COLLEGE' && (
                      <Input
                        placeholder="Topic (optional)"
                        value={editTopic}
                        onChange={(e) => setEditTopic(e.target.value)}
                        className="h-9"
                      />
                    )}
                    <Button
                      size="sm"
                      disabled={!editName.trim() || update.isPending}
                      onClick={() =>
                        update.mutate(
                          { slug: c.slug, name: editName.trim(), topic: editTopic || undefined },
                          {
                            onSuccess: () => {
                              toast.success('Community updated');
                              setEditSlug(null);
                            },
                            onError: (e) => toast.error((e as Error).message),
                          },
                        )
                      }
                    >
                      Save changes
                    </Button>
                  </div>
                )}

                {hiringSlug === c.slug && (
                  <div className="space-y-2 rounded-md border border-border p-2">
                    <p className="text-xs text-muted-foreground">
                      Hiring is {c.hiringOpen ? 'OPEN' : 'CLOSED'}. Set the requirement and open/close
                      applications for this community.
                    </p>
                    <Input
                      placeholder="Requirement, e.g. Looking for an Opportunity Head (active, 2nd yr+)"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="h-9"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={setHiring.isPending}
                        onClick={() =>
                          setHiring.mutate(
                            { slug: c.slug, open: true, note: note || undefined },
                            {
                              onSuccess: () => {
                                toast.success(`Hiring opened for ${c.name}`);
                                setHiringSlug(null);
                              },
                              onError: (e) => toast.error((e as Error).message),
                            },
                          )
                        }
                      >
                        {c.hiringOpen ? 'Update & keep open' : 'Open hiring'}
                      </Button>
                      {c.hiringOpen && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={setHiring.isPending}
                          onClick={() =>
                            setHiring.mutate(
                              { slug: c.slug, open: false },
                              {
                                onSuccess: () => {
                                  toast.success(`Hiring closed for ${c.name}`);
                                  setHiringSlug(null);
                                },
                              },
                            )
                          }
                        >
                          Close hiring
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {openSlug === c.slug && (
                  <div className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2">
                    <Input
                      placeholder="User email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-9 flex-1"
                    />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    >
                      {HEAD_ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      disabled={!email.trim() || appoint.isPending}
                      onClick={() =>
                        appoint.mutate(
                          { slug: c.slug, email: email.trim(), role },
                          {
                            onSuccess: () => {
                              toast.success(`Appointed in ${c.name}`);
                              setOpenSlug(null);
                              setEmail('');
                            },
                            onError: (e) => toast.error((e as Error).message),
                          },
                        )
                      }
                    >
                      Appoint
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {hasNextPage && (
            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </div>
      )}
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

function CommunitiesTab() {
  const { data, isLoading } = useHeadAppQueue();
  const decide = useDecideHeadApp();
  const appoint = useAppointHead();
  const create = useCreateCommunity();
  const { data: collegesData } = useColleges({ sort: 'name' });
  const colleges = collegesData?.pages.flatMap((p) => p.data) ?? [];
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('CAMPUS_LEAD');
  // Create-community form
  const [cName, setCName] = useState('');
  const [cType, setCType] = useState<'TOPIC' | 'COLLEGE' | 'STARTUP'>('TOPIC');
  const [cTopic, setCTopic] = useState('');
  const [cCollegeId, setCCollegeId] = useState('');
  const apps = data?.data ?? [];

  const submitCreate = () => {
    if (!cName.trim()) {
      toast.error('Enter a community name');
      return;
    }
    const payload: Record<string, unknown> = { name: cName, type: cType };
    if (cType === 'COLLEGE') {
      if (!cCollegeId) {
        toast.error('Pick a college');
        return;
      }
      payload.collegeId = cCollegeId;
    } else if (cType === 'TOPIC') {
      payload.topic = cTopic || cName;
    }
    // STARTUP needs only a name
    create.mutate(payload, {
      onSuccess: (community) => {
        toast.success(`Created "${community.name}" — now appoint its head below`);
        setSlug(community.slug); // prefill the appoint form
        setCName('');
        setCTopic('');
        setCCollegeId('');
      },
      onError: (e) => toast.error((e as Error).message),
    });
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Create a community</CardTitle>
          <p className="text-sm text-muted-foreground">Spin up a college or topic community.</p>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input placeholder="Community name" value={cName} onChange={(e) => setCName(e.target.value)} />
          <div className="flex gap-2">
            {(['TOPIC', 'COLLEGE', 'STARTUP'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setCType(t)}
                className={`flex-1 rounded-md border px-3 py-1.5 text-sm capitalize ${cType === t ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent'}`}
              >
                {t.toLowerCase()}
              </button>
            ))}
          </div>
          {cType === 'TOPIC' ? (
            <Input placeholder="Topic (e.g. AI, DSA)" value={cTopic} onChange={(e) => setCTopic(e.target.value)} />
          ) : cType === 'STARTUP' ? null : (
            <select
              value={cCollegeId}
              onChange={(e) => setCCollegeId(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">Select a college…</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          <Button disabled={create.isPending} onClick={submitCreate}>
            Create community
          </Button>
        </CardContent>
      </Card>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Appoint a community head / moderator</CardTitle>
          <p className="text-sm text-muted-foreground">Assign a verified student a leadership role.</p>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input placeholder="Community slug (e.g. dsa)" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <Input placeholder="User email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            {HEAD_ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <Button
            disabled={!slug || !email || appoint.isPending}
            onClick={() =>
              appoint.mutate(
                { slug, email, role },
                {
                  onSuccess: () => {
                    toast.success('Head appointed');
                    setEmail('');
                  },
                  onError: (e) => toast.error((e as Error).message),
                },
              )
            }
          >
            Appoint
          </Button>
        </CardContent>
      </Card>

      <AllCommunities />

      <div>
        <h3 className="mb-2 font-semibold">Head applications</h3>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : apps.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No pending applications.</p>
        ) : (
          <div className="space-y-3">
            {apps.map((a) => (
              <Card key={a.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      <span>{a.user?.profile?.fullName ?? a.user?.email}</span>
                      <Badge variant="secondary">{a.requestedRole.replace(/_/g, ' ').toLowerCase()}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.community.name}</p>
                    {a.pitch && <p className="mt-1 text-sm text-muted-foreground">{a.pitch}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => decide.mutate({ id: a.id, approve: false }, { onSuccess: () => toast.success('Rejected') })}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => decide.mutate({ id: a.id, approve: true }, { onSuccess: () => toast.success('Approved') })}
                    >
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
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
        <TabsList>
          <TabsTrigger value="overview">
            <Activity className="mr-1 h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="users">
            <UsersIcon className="mr-1 h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
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
        <TabsContent value="communities">
          <CommunitiesTab />
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
