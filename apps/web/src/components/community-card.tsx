'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Share2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { type Community, useJoinCommunity } from '@/hooks/use-communities';

export function CommunityCard({ community }: { community: Community }) {
  const join = useJoinCommunity(community.slug);
  const router = useRouter();
  const loggedIn = useAuthStore((s) => !!s.accessToken);

  // Startups with their own landing page are "showcases": no join / member count,
  // just a link to visit and a share button.
  const landingPage =
    community.slug === '99x-developers'
      ? '/startups/99x-developers'
      : community.slug === 'ez-rentbuddy'
        ? '/startups/ez-rentbuddy'
        : null;
  const isShowcase = !!landingPage;

  // College communities open the full College Community Hub.
  const href =
    landingPage ??
    (community.type === 'COLLEGE' && community.college?.slug
      ? `/colleges/${community.college.slug}`
      : `/communities/${community.slug}`);

  const onShare = () => {
    navigator.clipboard
      ?.writeText(`${window.location.origin}${isShowcase ? landingPage : `/communities/${community.slug}`}`)
      .catch(() => {});
    toast.success(isShowcase ? 'Link copied to clipboard' : 'Community link copied to clipboard');
  };
  return (
    <Link href={href} className="block h-full">
      <Card className="group h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg">
        <CardContent className="flex h-full flex-col gap-3 p-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-semibold">{community.name}</span>
              <Badge variant="secondary" className="ml-2">
                {community.type === 'COLLEGE'
                  ? 'College'
                  : community.type === 'STARTUP'
                    ? 'Startup'
                    : community.topic ?? 'Interest'}
              </Badge>
            </div>
          </div>
          {community.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{community.description}</p>
          )}
          <div className="mt-auto flex items-center justify-between pt-2">
            {isShowcase ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                Explore <ArrowRight className="h-3.5 w-3.5" />
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {community.memberCount.toLocaleString()} members
              </span>
            )}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                title="Share"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onShare();
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              {!isShowcase && (
                <Button
                  size="sm"
                  variant={community.isMember ? 'outline' : 'default'}
                  disabled={join.isPending}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!loggedIn) {
                      router.push('/login');
                      return;
                    }
                    join.mutate(!community.isMember, {
                      onError: (err) => toast.error((err as Error).message),
                    });
                  }}
                >
                  {community.isMember ? 'Joined' : 'Join'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
