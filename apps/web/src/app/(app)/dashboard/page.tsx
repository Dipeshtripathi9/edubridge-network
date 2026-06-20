'use client';

import Link from 'next/link';
import { Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CommunityCard } from '@/components/community-card';
import { useMe } from '@/hooks/use-profile';
import { useCommunities } from '@/hooks/use-communities';

export default function DashboardPage() {
  const { data: me } = useMe();
  const { data, isLoading } = useCommunities();
  const communities = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back{me?.profile?.fullName ? `, ${me.profile.fullName.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening in your network.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Award className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold">{me?.reputationPoints ?? 0}</p>
              <p className="text-xs text-muted-foreground">Reputation points</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold">{me?.userBadges?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Badges earned</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium">Your interests</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(me?.profile?.interests ?? []).slice(0, 4).map((i) => (
                <Badge key={i} variant="secondary">
                  {i}
                </Badge>
              ))}
              {!me?.profile?.interests?.length && (
                <Link href="/onboarding" className="text-xs text-primary hover:underline">
                  Add interests
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Discover communities</h2>
          <Link href="/communities" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {communities.slice(0, 6).map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
