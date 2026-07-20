'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StageTrackerStage {
  key: string;
  label: string;
  status: 'done' | 'active' | 'pending';
}

function Dot({ status, index }: { status: StageTrackerStage['status']; index: number }) {
  return (
    <span
      className={cn(
        'grid h-7 w-7 flex-none place-items-center rounded-full border-2 text-[11px] font-bold',
        status === 'done' && 'border-primary bg-primary text-primary-foreground',
        status === 'active' && 'border-primary bg-accent text-primary',
        status === 'pending' && 'border-border bg-card text-muted-foreground',
      )}
    >
      {status === 'done' ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : index + 1}
    </span>
  );
}

/**
 * Horizontal row of stage dots + connector lines on wider screens, collapsing to
 * a vertical timeline on narrow ones. Purely presentational — callers derive
 * each stage's `status` from the real backend enum(s), so this component never
 * needs its own notion of "stage" to keep in sync.
 */
export function StageTracker({ stages, className }: { stages: StageTrackerStage[]; className?: string }) {
  return (
    <>
      {/* Horizontal layout — sm and up */}
      <div className={cn('hidden items-start sm:flex', className)}>
        {stages.map((stage, i) => (
          <div key={stage.key} className={cn('flex items-center', i > 0 && 'flex-1')}>
            {i > 0 && (
              <span
                className={cn(
                  'mx-2 h-0.5 flex-1 rounded-full',
                  stage.status === 'pending' ? 'bg-border' : 'bg-primary',
                )}
              />
            )}
            <div className="flex flex-col items-center gap-1.5 text-center">
              <Dot status={stage.status} index={i} />
              <span
                className={cn(
                  'max-w-[6.5rem] text-[11.5px] font-semibold leading-tight',
                  stage.status === 'pending' ? 'text-muted-foreground' : 'text-foreground',
                )}
              >
                {stage.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Vertical layout — below sm */}
      <div className={cn('flex flex-col sm:hidden', className)}>
        {stages.map((stage, i) => (
          <div key={stage.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <Dot status={stage.status} index={i} />
              {i < stages.length - 1 && (
                <span
                  className={cn(
                    'my-1 w-0.5 flex-1 rounded-full',
                    stage.status === 'pending' ? 'bg-border' : 'bg-primary',
                  )}
                  style={{ minHeight: '1.25rem' }}
                />
              )}
            </div>
            <span
              className={cn(
                'pb-4 pt-1 text-[13px] font-semibold',
                stage.status === 'pending' ? 'text-muted-foreground' : 'text-foreground',
              )}
            >
              {stage.label}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
