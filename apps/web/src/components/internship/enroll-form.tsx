'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowRight, Check, GraduationCap, Rocket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { usePricing, useCreateTrackAEnrollment, type EnrollmentSubtype } from '@/hooks/use-internships';

const SUBTYPES: { value: EnrollmentSubtype; icon: typeof GraduationCap; blurb: string }[] = [
  { value: 'GUIDED_LEARNING', icon: GraduationCap, blurb: 'A mentor, hands-on tasks on a live project, and feedback until you’re job-ready.' },
  { value: 'OWN_PROJECT', icon: Rocket, blurb: 'Our team builds your own project idea end-to-end, plus 1 year of free maintenance.' },
];

export function EnrollForm() {
  const router = useRouter();
  const { data: pricing, isLoading: pricingLoading } = usePricing();
  const [subtype, setSubtype] = useState<EnrollmentSubtype>('GUIDED_LEARNING');
  const [projectDescription, setProjectDescription] = useState('');
  const enroll = useCreateTrackAEnrollment();

  const onSubmit = () => {
    if (projectDescription.trim().length < 10) {
      toast.error('Describe what you want to learn / build in at least 10 characters');
      return;
    }
    enroll.mutate(
      { subtype, projectDescription: projectDescription.trim() },
      {
        onSuccess: () => {
          toast.success('Enrolled! Complete your payment to activate.');
          router.push('/internship/dashboard');
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  if (pricingLoading || !pricing) return <Skeleton className="h-72 w-full" />;

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Choose your track</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {SUBTYPES.map((s) => {
              const info = pricing.trackA[s.value];
              const active = subtype === s.value;
              return (
                <Card
                  key={s.value}
                  role="button"
                  tabIndex={0}
                  aria-pressed={active}
                  onClick={() => setSubtype(s.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSubtype(s.value);
                  }}
                  className={cn(
                    'cursor-pointer border-2 transition-colors',
                    active ? 'border-primary bg-accent/40' : 'border-border hover:border-primary/40',
                  )}
                >
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-center justify-between">
                      <span className={cn('grid h-9 w-9 place-items-center rounded-xl', active ? 'bg-primary text-primary-foreground' : 'bg-accent text-primary')}>
                        <s.icon className="h-[18px] w-[18px]" />
                      </span>
                      {active && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="font-display text-base font-bold">{info.label}</p>
                    <p className="text-sm text-muted-foreground">{s.blurb}</p>
                    <p className="font-display text-lg font-extrabold text-primary">
                      ₹{info.feeAmount.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-semibold">
            {subtype === 'OWN_PROJECT' ? 'Describe your project idea' : 'What do you want to learn / build?'}
          </p>
          <Textarea
            placeholder={
              subtype === 'OWN_PROJECT'
                ? 'e.g. A website for my college club with event registrations...'
                : 'e.g. I want to learn React by building real features on a live project...'
            }
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            rows={4}
          />
        </div>

        <Button disabled={enroll.isPending} onClick={onSubmit} className="w-full">
          Enroll — ₹{pricing.trackA[subtype].feeAmount.toLocaleString()} <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
