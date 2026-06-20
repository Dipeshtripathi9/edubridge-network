'use client';

import { Award, Crown, Medal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  useBadges,
  useLeaderboard,
  useMyReputation,
  type Badge as BadgeType,
} from '@/hooks/use-reputation';

const TIER_STYLE: Record<string, string> = {
  BRONZE: 'bg-amber-700/15 text-amber-700 dark:text-amber-500 border-amber-700/30',
  SILVER: 'bg-slate-400/15 text-slate-500 dark:text-slate-300 border-slate-400/30',
  GOLD: 'bg-amber-400/15 text-amber-600 dark:text-amber-400 border-amber-400/30',
  PLATINUM: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
};

function rankBadge(rank: number) {
  if (rank === 1) return <Crown className="h-5 w-5 text-amber-400" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
  return <span className="w-5 text-center text-sm font-semibold text-muted-foreground">{rank}</span>;
}

function MyRepCard() {
  const { data } = useMyReputation();
  if (!data) return null;
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Award className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold">{data.points}</p>
            <p className="text-xs text-muted-foreground">Your reputation points</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.badges.length === 0 ? (
            <p className="text-sm text-muted-foreground">No badges yet — start contributing!</p>
          ) : (
            data.badges.map((b) => (
              <span
                key={b.id}
                className={cn('rounded-full border px-3 py-1 text-xs font-medium', TIER_STYLE[b.tier])}
              >
                🏅 {b.name}
              </span>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function LeaderboardList() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useLeaderboard();
  const entries = data?.pages.flatMap((p) => p.data) ?? [];

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (entries.length === 0) {
    return <p className="py-12 text-center text-muted-foreground">No contributors yet.</p>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {entries.map((e) => (
            <div
              key={e.id}
              className={cn(
                'flex items-center gap-4 p-4',
                e.rank <= 3 && 'bg-primary/5',
              )}
            >
              <div className="flex w-6 justify-center">{rankBadge(e.rank)}</div>
              <Avatar src={e.profile?.avatarUrl} name={e.profile?.fullName} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{e.profile?.fullName ?? 'Student'}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {e.profile?.college?.name ?? '—'}
                </p>
              </div>
              {e._count.userBadges > 0 && (
                <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                  <Award className="h-3.5 w-3.5" />
                  {e._count.userBadges}
                </span>
              )}
              <span className="font-bold text-primary">{e.reputationPoints}</span>
            </div>
          ))}
        </CardContent>
      </Card>
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

function BadgesGrid() {
  const { data, isLoading } = useBadges();
  const { data: mine } = useMyReputation();
  const earned = new Set((mine?.badges ?? []).map((b: BadgeType) => b.key));

  if (isLoading) return <Skeleton className="h-48 w-full" />;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {(data ?? []).map((b) => {
        const has = earned.has(b.key);
        return (
          <Card key={b.id} className={cn(!has && 'opacity-60')}>
            <CardContent className="flex items-start gap-3 p-5">
              <span
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full border text-2xl',
                  TIER_STYLE[b.tier],
                )}
              >
                🏅
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{b.name}</p>
                  {has && <span className="text-xs font-medium text-green-600">Earned</span>}
                </div>
                <p className="text-sm text-muted-foreground">{b.description ?? `${b.tier} badge`}</p>
                {b.threshold != null && (
                  <p className="mt-1 text-xs text-muted-foreground">{b.threshold} pts</p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Award className="h-6 w-6 text-primary" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground">Earn points by contributing. Climb the ranks.</p>
      </div>

      <MyRepCard />

      <Tabs defaultValue="ranking">
        <TabsList>
          <TabsTrigger value="ranking">Top Contributors</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>
        <TabsContent value="ranking">
          <LeaderboardList />
        </TabsContent>
        <TabsContent value="badges">
          <BadgesGrid />
        </TabsContent>
      </Tabs>
    </div>
  );
}
