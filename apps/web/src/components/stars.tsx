'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i <= Math.round(value)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-muted text-muted-foreground/30',
          )}
        />
      ))}
    </span>
  );
}

export function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onChange(i)} aria-label={`${i} stars`}>
          <Star
            className={cn(
              'h-6 w-6 transition-colors',
              i <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40',
            )}
          />
        </button>
      ))}
    </span>
  );
}
