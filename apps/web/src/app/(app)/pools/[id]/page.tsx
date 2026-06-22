'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Lock, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PoolChat } from '@/components/pools-section';
import { usePool, useJoinPool } from '@/hooks/use-pools';

export default function PoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: pool, isLoading } = usePool(id);
  const join = useJoinPool(pool?.community?.slug ?? '');

  if (isLoading || !pool) {
    return <Skeleton className="mx-auto h-96 max-w-2xl" />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {pool.isMember ? (
        <PoolChat pool={pool} onBack={() => router.push('/home')} />
      ) : (
        <Card>
          <CardContent className="space-y-3 p-6 text-center">
            <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-lg font-semibold">{pool.title}</p>
            <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" /> {pool.memberCount}/{pool.maxMembers} members · private
            </p>
            <Button
              disabled={pool.isFull || join.isPending}
              onClick={() =>
                join.mutate(pool.id, {
                  onSuccess: () => toast.success('Joined — you can chat now'),
                  onError: (e) => toast.error((e as Error).message),
                })
              }
            >
              {pool.isFull ? 'Pool is full' : 'Connect to chat'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
