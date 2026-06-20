'use client';

import Link from 'next/link';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type Community, useJoinCommunity } from '@/hooks/use-communities';

export function CommunityCard({ community }: { community: Community }) {
  const join = useJoinCommunity(community.slug);
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between">
          <div>
            <Link href={`/communities/${community.slug}`} className="font-semibold hover:underline">
              {community.name}
            </Link>
            <Badge variant="secondary" className="ml-2">
              {community.type === 'COLLEGE' ? 'College' : community.topic ?? 'Topic'}
            </Badge>
          </div>
        </div>
        {community.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{community.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {community.memberCount.toLocaleString()} members
          </span>
          <Button
            size="sm"
            variant={community.isMember ? 'outline' : 'default'}
            disabled={join.isPending}
            onClick={() => join.mutate(!community.isMember)}
          >
            {community.isMember ? 'Joined' : 'Join'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
