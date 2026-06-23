'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  LayoutGrid,
  Repeat,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMe } from '@/hooks/use-profile';
import { useMyApplications, useRecommendedOpportunities } from '@/hooks/use-opportunities';
import { useMyJourneys } from '@/hooks/use-transfer';
import { useCommunities } from '@/hooks/use-communities';
import { useMyPools } from '@/hooks/use-pools';

function repStatus(points: number) {
  if (points >= 750) return 'Excellent';
  if (points >= 400) return 'Great';
  if (points >= 150) return 'Rising';
  return 'Newcomer';
}

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
  const { data: journeys } = useMyJourneys();
  const { data: communitiesData, isLoading: communitiesLoading } = useCommunities();
  const { data: recommended } = useRecommendedOpportunities();
  const { data: myPools } = useMyPools();

  const firstName = me?.profile?.fullName?.split(' ')[0];
  const applications = (apps ?? []).filter((a) => a.status !== 'SAVED');
  const savedOpps = (apps ?? []).filter((a) => a.status === 'SAVED');
  const joined = (communitiesData?.pages.flatMap((p) => p.data) ?? []).filter((c) => c.isMember);
  const recommendedCommunities = (communitiesData?.pages.flatMap((p) => p.data) ?? [])
    .filter((c) => !c.isMember)
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, 4);
  const opps = (recommended ?? []).slice(0, 3);
  const points = me?.reputationPoints ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Welcome banner */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/10 via-primary/5 to-accent/20 p-5">
        <h1 className="text-2xl font-bold">Welcome back{firstName ? `, ${firstName}` : ''}! 👋</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your journey.</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={LayoutGrid} label="Communities" value={joined.length} hint="Active communities" href="/communities" />
        <StatCard icon={Target} label="Applications" value={applications.length} hint="Active applications" href="/opportunities" />
        <StatCard icon={BookOpen} label="Saved Opportunities" value={savedOpps.length} hint="Saved for later" href="/opportunities" />
        <StatCard icon={Repeat} label="Transfer Requests" value={journeys?.length ?? 0} hint="In progress" href="/transfer" />
        <StatCard icon={Trophy} label="Reputation" value={points} hint={repStatus(points)} href="#reputation" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
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
                                ? `Topic · ${c.topic}`
                                : 'Topic community'}
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

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Reputation CTA */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="space-y-2 p-4">
              <p className="flex items-center gap-1 font-medium">
                <Sparkles className="h-4 w-4 text-primary" /> Level up your reputation!
              </p>
              <p className="text-sm text-muted-foreground">
                Help more students, share knowledge, and earn exclusive badges.
              </p>
              <Button asChild size="sm">
                <Link href="/opportunities">
                  Explore Opportunities <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
