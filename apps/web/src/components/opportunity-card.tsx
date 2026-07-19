'use client';

import {
  Award,
  BadgeCheck,
  Bookmark,
  BookmarkX,
  Briefcase,
  CalendarClock,
  ExternalLink,
  FlaskConical,
  GraduationCap,
  MapPin,
  Share2,
  Trash2,
  Trophy,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  useApply,
  useDeleteApplication,
  useDeleteOpportunity,
  type Opportunity,
} from '@/hooks/use-opportunities';

// Type → brand-tinted icon tile.
const TYPE_VISUAL: Record<string, { Icon: typeof Briefcase; tone: string; label: string }> = {
  INTERNSHIP: { Icon: Briefcase, tone: 'bg-accent text-primary', label: 'Internship' },
  SCHOLARSHIP: { Icon: GraduationCap, tone: 'bg-green-soft text-green', label: 'Scholarship' },
  COMPETITION: { Icon: Trophy, tone: 'bg-marigold-soft text-amber-600', label: 'Competition' },
  FELLOWSHIP: { Icon: Award, tone: 'bg-accent text-primary', label: 'Fellowship' },
  RESEARCH: { Icon: FlaskConical, tone: 'bg-marigold-soft text-amber-600', label: 'Research' },
  CERTIFICATION: { Icon: BadgeCheck, tone: 'bg-green-soft text-green', label: 'Certification' },
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
  const v = TYPE_VISUAL[opportunity.type] ?? { Icon: Briefcase, tone: 'bg-accent text-primary', label: opportunity.type };

  const onShare = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/opportunities`).catch(() => {});
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="content-auto animate-page h-full">
      <article className="group flex h-full flex-col gap-3 rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
        <div className="flex items-start gap-3.5">
          <span className={cn('grid h-12 w-12 flex-none place-items-center rounded-[15px]', v.tone)}>
            <v.Icon className="h-[22px] w-[22px]" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-[17px] font-bold leading-tight tracking-tight">{opportunity.title}</h3>
              <span className="rounded-full border border-border bg-background px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[1.1px] text-muted-foreground">
                {v.label}
              </span>
            </div>
            {opportunity.organization && (
              <p className="mt-1 text-sm text-muted-foreground">{opportunity.organization}</p>
            )}
          </div>
          <div className="flex flex-none items-center gap-2">
            {dl && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                <CalendarClock className="h-3 w-3" />
                {dl}
              </span>
            )}
            {canModerate && (
              <button
                className="text-muted-foreground transition-colors hover:text-destructive"
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

        <p className="line-clamp-2 flex-1 text-[14.5px] text-muted-foreground">{opportunity.description}</p>

        <div className="flex flex-wrap gap-3 text-xs font-semibold text-muted-foreground">
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
              <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 pt-1">
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
      </article>
    </div>
  );
}
