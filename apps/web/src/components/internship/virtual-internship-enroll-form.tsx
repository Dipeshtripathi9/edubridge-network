'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, Check, Rocket, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCreateVirtualInternshipEnrollment, type VirtualInternshipTrack } from '@/hooks/use-virtual-internship';

const TRACKS: { value: VirtualInternshipTrack; icon: typeof Zap; label: string; blurb: string; feeAmount: number }[] = [
  {
    value: 'FOUR_WEEK',
    icon: Zap,
    label: '4-Week Track',
    blurb: 'The fast-track version — same outcome, same certificate, in a quarter of the time.',
    feeAmount: 2_790,
  },
  {
    value: 'FOUR_MONTH',
    icon: Rocket,
    label: '4-Month Track',
    blurb: 'The full track — 4 real projects, deployed live, with mentors reviewing every month.',
    feeAmount: 7_890,
  },
];

export function VirtualInternshipEnrollForm({ initialTrack }: { initialTrack?: VirtualInternshipTrack }) {
  const [track, setTrack] = useState<VirtualInternshipTrack>(initialTrack ?? 'FOUR_WEEK');
  const enroll = useCreateVirtualInternshipEnrollment();

  const onSubmit = () => {
    enroll.mutate(
      { track },
      {
        onSuccess: () => toast.success('Enrolled! Complete your payment to activate your track.'),
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  const selected = TRACKS.find((t) => t.value === track)!;

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Choose your track</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {TRACKS.map((t) => {
              const active = track === t.value;
              return (
                <Card
                  key={t.value}
                  role="button"
                  tabIndex={0}
                  aria-pressed={active}
                  onClick={() => setTrack(t.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setTrack(t.value);
                  }}
                  className={cn(
                    'cursor-pointer border-2 transition-colors',
                    active ? 'border-primary bg-accent/40' : 'border-border hover:border-primary/40',
                  )}
                >
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'grid h-9 w-9 place-items-center rounded-xl',
                          active ? 'bg-primary text-primary-foreground' : 'bg-accent text-primary',
                        )}
                      >
                        <t.icon className="h-[18px] w-[18px]" />
                      </span>
                      {active && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="font-display text-base font-bold">{t.label}</p>
                    <p className="text-sm text-muted-foreground">{t.blurb}</p>
                    <p className="font-display text-lg font-extrabold text-primary">
                      ₹{t.feeAmount.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Button disabled={enroll.isPending} onClick={onSubmit} className="w-full">
          Enroll — ₹{selected.feeAmount.toLocaleString()} <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
