import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Canonical empty state — dashed brand card with an accent icon tile, a display
 * title and an optional CTA. Replaces bare "No X yet" grey text everywhere so no
 * page ever looks unfinished.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center',
        className,
      )}
    >
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <b className="font-display text-lg tracking-tight">{title}</b>
      {description && <span className="mt-1 max-w-sm text-[15px] text-muted-foreground">{description}</span>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
