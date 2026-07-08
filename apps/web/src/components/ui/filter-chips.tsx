'use client';

import { cn } from '@/lib/utils';

/**
 * Canonical facet filter — rounded-full chips with a violet-tinted active state.
 * Deliberately distinct from PillTabs (ink active) so "switch view" and
 * "filter within view" read as two different actions but one family.
 */
export function FilterChips<T>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.label}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-full border px-3.5 py-2 text-[13px] font-bold transition-colors',
              active
                ? 'border-primary bg-accent text-primary'
                : 'border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
