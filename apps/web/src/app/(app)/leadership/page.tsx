'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useManagedCommunities } from '@/hooks/use-communities';

const roleLabel = (r: string) => r.replace(/_/g, ' ').toLowerCase();

export default function LeadershipPage() {
  const { data: managed, isLoading } = useManagedCommunities();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ShieldCheck className="h-6 w-6 text-primary" /> Leadership
        </h1>
        <p className="text-muted-foreground">
          Communities you lead or moderate. Open one to manage members, activity, reports & analytics.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (managed?.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="space-y-2 p-8 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No leadership posts yet</p>
            <p className="text-sm text-muted-foreground">
              Campus Lead, Opportunity Head, Student Relations Head and Moderator posts are assigned by a
              platform admin (or via an approved application). Once you hold one, your communities appear here.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/communities">Browse communities</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {managed!.map((m) => (
            <Card key={m.community.id} className="transition-colors hover:border-primary/50">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{m.community.name}</p>
                  <Badge className="capitalize">{roleLabel(m.role)}</Badge>
                </div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" /> {m.community.memberCount.toLocaleString()} members ·{' '}
                  {m.community.type === 'COLLEGE'
                    ? 'College'
                    : m.community.type === 'STARTUP'
                      ? 'Startup'
                      : 'Topic'}
                </p>
                <Button asChild size="sm" className="w-full">
                  <Link href={`/communities/${m.community.slug}`}>
                    Manage <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
