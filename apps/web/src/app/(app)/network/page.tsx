'use client';

import Link from 'next/link';
import { Lock, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyPools } from '@/hooks/use-pools';

export default function NetworkPage() {
  const { data: pools, isLoading } = useMyPools();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Network</h1>
        <p className="text-muted-foreground">Private pools you&apos;ve joined — chat with your groups.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (pools?.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="space-y-2 p-8 text-center">
            <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No pools yet</p>
            <p className="text-sm text-muted-foreground">
              Join or create a private pool inside any community to chat with a small group.
            </p>
            <Button asChild size="sm">
              <Link href="/communities">Browse communities</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {pools!.map((p) => (
            <Link key={p.id} href={`/pools/${p.id}`}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{p.title}</p>
                    <Badge variant={p.isFull ? 'outline' : 'secondary'}>
                      <Users className="mr-1 h-3 w-3" />
                      {p.memberCount}/{p.maxMembers}
                    </Badge>
                  </div>
                  {p.community && <p className="text-xs text-muted-foreground">{p.community.name}</p>}
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" /> Private group chat
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
