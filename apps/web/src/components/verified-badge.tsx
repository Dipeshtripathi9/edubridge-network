import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

// Green "verified student" tick, optionally with the college name.
export function VerifiedBadge({
  college,
  className,
  size = 'sm',
}: {
  college?: string | null;
  className?: string;
  size?: 'sm' | 'xs';
}) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 text-green-500', className)}
      title={college ? `Verified student · ${college}` : 'Verified student'}
    >
      <BadgeCheck className={size === 'xs' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      {college && <span className="text-xs font-medium text-muted-foreground">{college}</span>}
    </span>
  );
}
