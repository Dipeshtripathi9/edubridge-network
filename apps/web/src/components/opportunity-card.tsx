'use client';

import { Bookmark, BookmarkX, CalendarClock, ExternalLink, MapPin, Share2, Trash2, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { timeAgo } from '@/lib/utils';
import {
  useApply,
  useDeleteApplication,
  useDeleteOpportunity,
  type Opportunity,
} from '@/hooks/use-opportunities';

const TYPE_COLORS: Record<string, string> = {
  INTERNSHIP: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  SCHOLARSHIP: 'bg-green-500/10 text-green-600 dark:text-green-400',
  COMPETITION: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  FELLOWSHIP: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  RESEARCH: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
};

function deadlineLabel(deadline?: string | null) {
  if (!deadline) return null;
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return 'Closed';
  if (days === 0) return 'Closes today';
  return `${days}d left`;
}

export function OpportunityCard({
  opportunity,
  canModerate = false,
  savedApplicationId,
}: {
  opportunity: Opportunity;
  canModerate?: boolean;
  /** When set (e.g. on the Saved page), the Save button becomes Unsave. */
  savedApplicationId?: string;
}) {
  const apply = useApply();
  const unsave = useDeleteApplication();
  const del = useDeleteOpportunity(opportunity.communityId ?? '');
  const dl = deadlineLabel(opportunity.deadline);

  const onShare = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/opportunities`).catch(() => {});
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="content-auto animate-page">
      <Card className="h-full">
        <CardContent className="flex h-full flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${TYPE_COLORS[opportunity.type] ?? ''}`}
            >
              {opportunity.type.toLowerCase()}
            </span>
            <div className="flex items-center gap-2">
              {dl && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {dl}
                </span>
              )}
              {canModerate && (
                <button
                  className="text-muted-foreground hover:text-destructive"
                  title="Delete opportunity"
                  onClick={() => {
                    if (window.confirm('Delete this opportunity?')) {
                      del.mutate(opportunity.id, {
                        onSuccess: () => toast.success('Opportunity deleted'),
                        onError: (e) => toast.error((e as Error).message),
                      });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold leading-tight">{opportunity.title}</h3>
            {opportunity.organization && (
              <p className="text-sm text-muted-foreground">{opportunity.organization}</p>
            )}
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">{opportunity.description}</p>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {(opportunity.isRemote || opportunity.location) && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {opportunity.isRemote ? 'Remote' : opportunity.location}
              </span>
            )}
            {opportunity.stipend && (
              <span className="flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5" />
                {opportunity.stipend}
              </span>
            )}
          </div>

          {opportunity.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {opportunity.tags.slice(0, 4).map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-center gap-2 pt-2">
            {savedApplicationId ? (
              <Button
                variant="outline"
                size="sm"
                disabled={unsave.isPending}
                onClick={() =>
                  unsave.mutate(savedApplicationId, {
                    onSuccess: () => toast.success('Removed from saved'),
                    onError: (e) => toast.error((e as Error).message),
                  })
                }
              >
                <BookmarkX className="h-4 w-4" />
                Unsave
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled={apply.isPending}
                onClick={() =>
                  apply.mutate(
                    { id: opportunity.id, status: 'SAVED' },
                    { onSuccess: () => toast.success('Saved') },
                  )
                }
              >
                <Bookmark className="h-4 w-4" />
                Save
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onShare} title="Share">
              <Share2 className="h-4 w-4" />
            </Button>
            {opportunity.applyUrl && (
              <Button asChild size="sm" className="flex-1">
                <a
                  href={opportunity.applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => apply.mutate({ id: opportunity.id, status: 'APPLIED' })}
                >
                  Apply <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
