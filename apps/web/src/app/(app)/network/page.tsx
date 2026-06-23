'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, Search, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyPools } from '@/hooks/use-pools';

export default function NetworkPage() {
  const { data: pools, isLoading } = useMyPools();
  const [q, setQ] = useState('');

  const term = q.trim().toLowerCase();
  const filtered = (pools ?? []).filter(
    (p) =>
      !term ||
      p.title.toLowerCase().includes(term) ||
      (p.community?.name ?? '').toLowerCase().includes(term),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Network</h1>
        <p className="text-muted-foreground">Private pools you&apos;ve joined — chat with your groups.</p>
      </div>

      {(pools?.length ?? 0) > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search your pools…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      )}

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
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">No pools match “{q}”.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((p) => (
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
