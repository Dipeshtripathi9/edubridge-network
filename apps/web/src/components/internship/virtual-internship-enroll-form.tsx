'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, Check, Rocket, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  useCreateVirtualInternshipEnrollment,
  useVirtualInternshipPricing,
  type VirtualInternshipTrack,
} from '@/hooks/use-virtual-internship';

const TRACK_META: Record<VirtualInternshipTrack, { icon: typeof Zap; label: string; blurb: string }> = {
  FOUR_WEEK: {
    icon: Zap,
    label: '4-Week Track',
    blurb: 'The fast-track version — same outcome, same certificate, in a quarter of the time.',
  },
  FOUR_MONTH: {
    icon: Rocket,
    label: '4-Month Track',
    blurb: 'The full track — 4 real projects, deployed live, with mentors reviewing every month.',
  },
};
const TRACK_ORDER: VirtualInternshipTrack[] = ['FOUR_WEEK', 'FOUR_MONTH'];

export function VirtualInternshipEnrollForm({ initialTrack }: { initialTrack?: VirtualInternshipTrack }) {
  const [track, setTrack] = useState<VirtualInternshipTrack>(initialTrack ?? 'FOUR_WEEK');
  const enroll = useCreateVirtualInternshipEnrollment();
  const { data: pricing, isLoading: pricingLoading } = useVirtualInternshipPricing();

  const onSubmit = () => {
    enroll.mutate(
      { track },
      {
        onSuccess: () => toast.success('Enrolled! Complete your payment to activate your track.'),
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  const selectedPricing = pricing?.find((p) => p.track === track);

  if (pricingLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Choose your track</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {TRACK_ORDER.map((value) => {
              const meta = TRACK_META[value];
              const trackPricing = pricing?.find((p) => p.track === value);
              const active = track === value;
              return (
                <Card
                  key={value}
                  role="button"
                  tabIndex={0}
                  aria-pressed={active}
                  onClick={() => setTrack(value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setTrack(value);
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
                        <meta.icon className="h-[18px] w-[18px]" />
                      </span>
                      {active && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="font-display text-base font-bold">{meta.label}</p>
                    <p className="text-sm text-muted-foreground">{meta.blurb}</p>
                    {trackPricing && (
                      <p className="font-display text-lg font-extrabold text-primary">
                        ₹{trackPricing.totalAmount.toLocaleString()}
                        <span className="text-xs font-medium text-muted-foreground"> incl. GST</span>
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Button disabled={enroll.isPending || !selectedPricing} onClick={onSubmit} className="w-full">
          Enroll{selectedPricing && ` — ₹${selectedPricing.totalAmount.toLocaleString()}`}{' '}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
