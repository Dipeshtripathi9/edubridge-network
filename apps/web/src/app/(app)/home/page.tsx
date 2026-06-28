'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  LayoutGrid,
  Star,
  Target,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMe } from '@/hooks/use-profile';
import { uniqueById } from '@/lib/utils';
import { useMyApplications, useRecommendedOpportunities } from '@/hooks/use-opportunities';
import { useCommunities } from '@/hooks/use-communities';
import { useMyPools } from '@/hooks/use-pools';
import { useMySavedPosts } from '@/hooks/use-posts';
import { useMyResourceBookmarks } from '@/hooks/use-resources';

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  href,
}: {
  icon: typeof Star;
  label: string;
  value: number;
  hint: string;
  href: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-sm">{label}</span>
        </div>
        <p className="mt-1 text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
        <Link href={href} className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-semibold">{title}</h2>
      {href && (
        <Link href={href} className="text-sm text-primary hover:underline">
          View all
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const { data: me } = useMe();
  const { data: apps } = useMyApplications();
  const { data: communitiesData, isLoading: communitiesLoading } = useCommunities();
  const { data: recommended } = useRecommendedOpportunities();
  const { data: myPools } = useMyPools();
  const { data: savedPosts } = useMySavedPosts();
  const { data: savedResources } = useMyResourceBookmarks();

  const firstName = me?.profile?.fullName?.split(' ')[0];
  const savedOpps = (apps ?? []).filter((a) => a.status === 'SAVED');
  const savedCount = savedOpps.length + (savedPosts?.length ?? 0) + (savedResources?.length ?? 0);
  const allCommunities = uniqueById(communitiesData?.pages.flatMap((p) => p.data) ?? []);
  const joined = allCommunities.filter((c) => c.isMember);
  const recommendedCommunities = allCommunities
    .filter((c) => !c.isMember)
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, 4);
  const opps = (recommended ?? []).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Welcome banner */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/10 via-primary/5 to-accent/20 p-5">
        <h1 className="text-2xl font-bold">Welcome back{firstName ? `, ${firstName}` : ''}! 👋</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your journey.</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard icon={LayoutGrid} label="Communities" value={joined.length} hint="Active communities" href="/communities" />
        <StatCard icon={Target} label="For You" value={(recommended ?? []).length} hint="Opportunities picked for you" href="/opportunities?tab=recommended" />
        <StatCard icon={BookOpen} label="Saved" value={savedCount} hint="Opportunities, posts & resources" href="/saved" />
      </div>

      <div className="grid gap-6">
        {/* Main column */}
        <div className="space-y-6">
          {/* Recommended communities */}
          <section>
            <SectionHeader title="Recommended Communities" href="/communities" />
            <div className="grid gap-3 sm:grid-cols-2">
              {communitiesLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : recommendedCommunities.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You&apos;ve joined them all! <Link href="/communities" className="text-primary hover:underline">Browse →</Link>
                </p>
              ) : (
                recommendedCommunities.map((c) => (
                  <Link key={c.id} href={`/communities/${c.slug}`}>
                    <Card className="h-full transition-colors hover:border-primary/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <LayoutGrid className="h-4 w-4 text-primary" />
                          <p className="font-medium">{c.name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {c.type === 'COLLEGE'
                            ? 'College community'
                            : c.type === 'STARTUP'
                              ? 'Startup community'
                              : c.topic
                                ? `Interest · ${c.topic}`
                                : 'Interest community'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {c.memberCount.toLocaleString()} members
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Recommended opportunities */}
          <section>
            <SectionHeader title="Recommended Opportunities" href="/opportunities" />
            <div className="space-y-3">
              {opps.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recommendations yet — add interests to your profile.</p>
              ) : (
                opps.map((o) => (
                  <Card key={o.id}>
                    <CardContent className="flex items-center justify-between gap-3 p-4">
                      <div>
                        <p className="font-medium">{o.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {o.type.toLowerCase()} {o.organization ? `• ${o.organization}` : ''}
                        </p>
                      </div>
                      {o.deadline && (
                        <Badge variant="secondary">
                          {new Date(o.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>

          {/* My communities */}
          <section>
            <SectionHeader title="My Communities" href="/communities" />
            <div className="grid gap-3 sm:grid-cols-2">
              {communitiesLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : joined.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t joined any communities yet.{' '}
                  <Link href="/communities" className="text-primary hover:underline">Browse →</Link>
                </p>
              ) : (
                joined.slice(0, 6).map((c) => (
                  <Link key={c.id} href={`/communities/${c.slug}`}>
                    <Card className="h-full transition-colors hover:border-primary/50">
                      <CardContent className="flex items-center justify-between p-4">
                        <p className="font-medium">{c.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {c.memberCount.toLocaleString()} members
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Network — pools the user belongs to */}
          <section>
            <SectionHeader title="Network" />
            {(myPools?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pools yet. Join or create a private pool inside any community to chat with a small group.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {myPools!.map((p) => (
                  <Link key={p.id} href={`/pools/${p.id}`}>
                    <Card className="h-full transition-colors hover:border-primary/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{p.title}</p>
                          <Badge variant="secondary">
                            <Users className="mr-1 h-3 w-3" />
                            {p.memberCount}/{p.maxMembers}
                          </Badge>
                        </div>
                        {p.community && (
                          <p className="text-xs text-muted-foreground">{p.community.name}</p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
