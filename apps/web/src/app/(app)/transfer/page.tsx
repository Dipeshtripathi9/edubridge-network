'use client';

import { ArrowRight, BookOpenText, Repeat } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EligibilityChecker } from '@/components/eligibility-checker';
import { useMyJourneys, useStories } from '@/hooks/use-transfer';

const STATUS_VARIANT: Record<string, string> = {
  EXPLORING: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  ELIGIBLE: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  APPLIED: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  COMPLETED: 'bg-green-500/10 text-green-600 dark:text-green-400',
};

function MyJourney() {
  const { data, isLoading } = useMyJourneys();
  if (isLoading) return <Skeleton className="h-32 w-full" />;
  if (!data?.length) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No transfers tracked yet. Use the eligibility checker to find colleges and start a journey.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {data.map((j) => (
        <Card key={j.id}>
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Repeat className="h-5 w-5" />
              </span>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{j.fromCollege?.name ?? 'Current college'}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{j.toCollege?.name ?? 'Target college'}</span>
              </div>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_VARIANT[j.status] ?? ''}`}
            >
              {j.status}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Stories() {
  const { data, isLoading } = useStories();
  if (isLoading) return <Skeleton className="h-32 w-full" />;
  const stories = data?.data ?? [];
  if (!stories.length) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No transfer stories yet. Be the first to share yours!
      </p>
    );
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {stories.map((s) => (
        <Card key={s.id}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Avatar src={s.user.profile?.avatarUrl} name={s.user.profile?.fullName} />
              <div>
                <p className="text-sm font-medium">{s.user.profile?.fullName ?? 'Student'}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  {s.fromCollege?.name ?? '—'} <ArrowRight className="h-3 w-3" /> {s.toCollege?.name ?? '—'}
                </p>
              </div>
            </div>
            <p className="mt-3 line-clamp-4 text-sm text-muted-foreground">{s.story}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function TransferHubPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Repeat className="h-6 w-6 text-primary" />
          Transfer Hub
        </h1>
        <p className="text-muted-foreground">
          Discover colleges you can transfer to, track your journey, and learn from others.
          <Badge variant="secondary" className="ml-2">
            <BookOpenText className="mr-1 h-3 w-3" /> Powered by the College Data layer
          </Badge>
        </p>
      </div>

      <Tabs defaultValue="find">
        <TabsList>
          <TabsTrigger value="find">Find Colleges</TabsTrigger>
          <TabsTrigger value="journey">My Journey</TabsTrigger>
          <TabsTrigger value="stories">Stories</TabsTrigger>
        </TabsList>
        <TabsContent value="find">
          <EligibilityChecker />
        </TabsContent>
        <TabsContent value="journey">
          <MyJourney />
        </TabsContent>
        <TabsContent value="stories">
          <Stories />
        </TabsContent>
      </Tabs>
    </div>
  );
}
