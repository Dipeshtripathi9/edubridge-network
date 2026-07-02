'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Compass,
  GraduationCap,
  LayoutGrid,
  Rocket,
  Sparkles,
  Star,
  Target,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, uniqueById } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useMe } from '@/hooks/use-profile';
import { useMyApplications, useRecommendedOpportunities } from '@/hooks/use-opportunities';
import { useCommunities, type Community } from '@/hooks/use-communities';
import { useMyPools } from '@/hooks/use-pools';
import { ExpertGuidance } from '@/components/expert-guidance';
import { useMySavedPosts } from '@/hooks/use-posts';
import { useMyResourceBookmarks } from '@/hooks/use-resources';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// Type → colored tile, so lists read at a glance.
function communityVisual(type: Community['type']) {
  if (type === 'COLLEGE')
    return { Icon: GraduationCap, tone: 'from-indigo-500 to-blue-600', label: 'College' };
  if (type === 'STARTUP')
    return { Icon: Rocket, tone: 'from-violet-500 to-fuchsia-600', label: 'Startup' };
  return { Icon: LayoutGrid, tone: 'from-sky-500 to-cyan-600', label: 'Interest' };
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  href,
  tone,
}: {
  icon: typeof Star;
  label: string;
  value: number;
  hint: string;
  href: string;
  tone: string;
}) {
  return (
    <Link href={href} className="block h-full">
      <Card className="card-interactive group h-full overflow-hidden">
        <CardContent className="relative p-4">
          <div
            className={cn(
              'pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br opacity-15 blur-2xl transition-opacity group-hover:opacity-30',
              tone,
            )}
          />
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
                tone,
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums">{value}</p>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function SectionHeader({ title, href, icon: Icon }: { title: string; href?: string; icon?: typeof Star }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
        <span className="h-4 w-1 rounded-full bg-gradient-to-b from-primary to-accent-foreground" />
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function CommunityTile({ c }: { c: Community }) {
  const { Icon, tone, label } = communityVisual(c.type);
  return (
    <Link href={`/communities/${c.slug}`}>
      <Card className="card-interactive group h-full">
        <CardContent className="flex items-start gap-3 p-4">
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
              tone,
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{c.name}</p>
              <Badge variant="secondary" className="shrink-0">
                {c.type === 'TOPIC' && c.topic ? c.topic : label}
              </Badge>
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {c.memberCount.toLocaleString()} members
            </p>
          </div>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function HomePage() {
  const loggedIn = useAuthStore((s) => !!s.accessToken);
  const { data: me } = useMe();
  const { data: apps } = useMyApplications();
  const { data: communitiesData, isLoading: communitiesLoading } = useCommunities();
  const { data: recommended } = useRecommendedOpportunities();
  const { data: myPools } = useMyPools();
  const { data: savedPosts } = useMySavedPosts();
  const { data: savedResources } = useMyResourceBookmarks();

  const savedOpps = (apps ?? []).filter((a) => a.status === 'SAVED');
  const savedCount = savedOpps.length + (savedPosts?.length ?? 0) + (savedResources?.length ?? 0);
  const allCommunities = uniqueById(communitiesData?.pages.flatMap((p) => p.data) ?? []);
  const joined = allCommunities.filter((c) => c.isMember);
  const startupCount = allCommunities.filter((c) => c.type === 'STARTUP').length;
  const recommendedCommunities = allCommunities
    .filter((c) => !c.isMember)
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, 4);
  const opps = (recommended ?? []).slice(0, 3);
  const firstName = me?.profile?.fullName?.trim().split(' ')[0];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {loggedIn && firstName ? (
              <>
                {greeting()}, <span className="text-gradient">{firstName}</span> 👋
              </>
            ) : (
              <>
                Welcome to <span className="text-gradient">EduBridge Network</span>
              </>
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loggedIn
              ? "Here's what's happening across your network today."
              : 'Communities, verified reviews, real college data, opportunities & expert guidance — all in one place.'}
          </p>
        </div>
      </div>

      {/* Why EduBridge — experts, verified reviews & real data */}
      <ExpertGuidance />

      {/* Quick stats */}
      <div className={cn('grid grid-cols-2 gap-3', loggedIn ? 'lg:grid-cols-4' : 'sm:grid-cols-2')}>
        <StatCard
          icon={LayoutGrid}
          label="Communities"
          value={loggedIn ? joined.length : allCommunities.length}
          hint={loggedIn ? 'You have joined' : 'Browse communities'}
          href="/communities"
          tone="from-indigo-500 to-blue-600"
        />
        <StatCard
          icon={Rocket}
          label="Startups"
          value={startupCount}
          hint="Startup communities"
          href="/communities?type=STARTUP"
          tone="from-violet-500 to-fuchsia-600"
        />
        {loggedIn && (
          <>
            <StatCard
              icon={Target}
              label="For You"
              value={(recommended ?? []).length}
              hint="Opportunities picked for you"
              href="/opportunities?tab=recommended"
              tone="from-rose-500 to-orange-500"
            />
            <StatCard
              icon={BookOpen}
              label="Saved"
              value={savedCount}
              hint="Opportunities, posts & resources"
              href="/saved"
              tone="from-emerald-500 to-teal-600"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 xl:col-span-2">
          {/* Recommended communities */}
          <section>
            <SectionHeader title="Recommended Communities" href="/communities" icon={Compass} />
            <div className="grid gap-3 sm:grid-cols-2">
              {communitiesLoading ? (
                <>
                  <Skeleton className="h-[76px] w-full" />
                  <Skeleton className="h-[76px] w-full" />
                </>
              ) : recommendedCommunities.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You&apos;ve joined them all!{' '}
                  <Link href="/communities" className="text-primary hover:underline">
                    Browse →
                  </Link>
                </p>
              ) : (
                recommendedCommunities.map((c) => <CommunityTile key={c.id} c={c} />)
              )}
            </div>
          </section>

          {/* Recommended opportunities */}
          <section>
            <SectionHeader title="Recommended Opportunities" href="/opportunities" icon={Target} />
            <div className="space-y-3">
              {opps.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-4 text-sm text-muted-foreground">
                    {loggedIn ? (
                      'No recommendations yet — add interests to your profile to get personalised picks.'
                    ) : (
                      <>
                        <Link href="/opportunities" className="text-primary hover:underline">
                          Browse all opportunities →
                        </Link>{' '}
                        or{' '}
                        <Link href="/login" className="text-primary hover:underline">
                          sign in
                        </Link>{' '}
                        for personalised picks.
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                opps.map((o) => (
                  <Link key={o.id} href="/opportunities">
                    <Card className="card-interactive group">
                      <CardContent className="flex items-center gap-3 p-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-sm">
                          <Target className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{o.title}</p>
                          <p className="text-xs capitalize text-muted-foreground">
                            {o.type.toLowerCase()} {o.organization ? `• ${o.organization}` : ''}
                          </p>
                        </div>
                        {o.deadline && (
                          <Badge variant="secondary" className="shrink-0">
                            {new Date(o.deadline).toLocaleDateString(undefined, {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          {loggedIn ? (
            <>
              {/* My communities */}
              <section>
                <SectionHeader title="My Communities" href="/communities" icon={LayoutGrid} />
                <div className="space-y-3">
                  {communitiesLoading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : joined.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="p-4 text-sm text-muted-foreground">
                        You haven&apos;t joined any communities yet.{' '}
                        <Link href="/communities" className="text-primary hover:underline">
                          Browse →
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    joined.slice(0, 5).map((c) => <CommunityTile key={c.id} c={c} />)
                  )}
                </div>
              </section>

              {/* Network — pools the user belongs to */}
              <section>
                <SectionHeader title="Network" href="/network" icon={Users} />
                {(myPools?.length ?? 0) === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-4 text-sm text-muted-foreground">
                      No pools yet. Join or create a private pool inside any community to chat with a
                      small group.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {myPools!.map((p) => (
                      <Link key={p.id} href={`/pools/${p.id}`}>
                        <Card className="card-interactive">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate font-medium">{p.title}</p>
                              <Badge variant="secondary" className="shrink-0">
                                <Users className="mr-1 h-3 w-3" />
                                {p.memberCount}/{p.maxMembers}
                              </Badge>
                            </div>
                            {p.community && (
                              <p className="mt-0.5 text-xs text-muted-foreground">{p.community.name}</p>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : (
            /* Guest → invite to join */
            <section>
              <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 to-accent/30">
                <CardContent className="p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground shadow-sm">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 font-semibold">Join EduBridge Network</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create a free account to join communities, save opportunities and get personalised
                    guidance from verified experts.
                  </p>
                  <Link
                    href="/signup"
                    className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.97]"
                  >
                    Get started <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
