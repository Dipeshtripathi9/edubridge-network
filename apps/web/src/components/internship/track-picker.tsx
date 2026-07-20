'use client';

import Link from 'next/link';
import { ArrowRight, Check, GraduationCap, Rocket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePricing } from '@/hooks/use-internships';

const TRACK_B_PIPELINE = ['Applied', 'Reviewed', 'Allocated', 'Certified'];

export function TrackPicker() {
  const { data: pricing, isLoading } = usePricing();

  if (isLoading || !pricing) {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Track A */}
      <Card className="flex flex-col border-marigold/30">
        <CardContent className="flex flex-1 flex-col p-7">
          <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-marigold/40 bg-marigold-soft px-3 py-1 text-xs font-bold text-amber-700">
            <GraduationCap className="h-3.5 w-3.5" /> Track A · You pay EduBridge
          </span>
          <h3 className="font-display text-2xl font-extrabold tracking-tight">Learn &amp; Build</h3>
          <p className="mt-2 text-[15px] text-muted-foreground">
            For students who want structured mentorship on a live project — or their own idea, built
            by a professional team.
          </p>

          <div className="mt-5 space-y-4 border-t border-border pt-5">
            <div className="flex gap-3">
              <span className="font-mono text-xs text-muted-foreground">01</span>
              <div>
                <p className="font-semibold">
                  {pricing.trackA.GUIDED_LEARNING.label}{' '}
                  <span className="font-mono text-primary">
                    ₹{pricing.trackA.GUIDED_LEARNING.feeAmount.toLocaleString()}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">{pricing.trackA.GUIDED_LEARNING.description}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="font-mono text-xs text-muted-foreground">02</span>
              <div>
                <p className="font-semibold">
                  {pricing.trackA.OWN_PROJECT.label}{' '}
                  <span className="font-mono text-primary">
                    ₹{pricing.trackA.OWN_PROJECT.feeAmount.toLocaleString()}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">{pricing.trackA.OWN_PROJECT.description}</p>
              </div>
            </div>
          </div>

          <Button asChild className="mt-6 w-full">
            <Link href="/internship/dashboard/enroll">
              Enroll in Track A <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Track B */}
      <Card className="flex flex-col border-green/30">
        <CardContent className="flex flex-1 flex-col p-7">
          <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-green/40 bg-green-soft px-3 py-1 text-xs font-bold text-green">
            <Rocket className="h-3.5 w-3.5" /> Track B · Free to apply
          </span>
          <h3 className="font-display text-2xl font-extrabold tracking-tight">Apply &amp; Get Selected</h3>
          <p className="mt-2 text-[15px] text-muted-foreground">{pricing.trackB.description}</p>

          <div className="mt-5 space-y-4 border-t border-border pt-5">
            <div className="flex gap-3">
              <Check className="mt-0.5 h-4 w-4 flex-none text-green" />
              <div>
                <p className="font-semibold">If you&apos;re ready</p>
                <p className="text-sm text-muted-foreground">
                  You&apos;re matched to <strong>paid</strong> client or startup work — completing it
                  earns both payment and your certificate.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Check className="mt-0.5 h-4 w-4 flex-none text-green" />
              <div>
                <p className="font-semibold">If you&apos;re not quite there yet</p>
                <p className="text-sm text-muted-foreground">
                  We&apos;re upfront about it and give you a skill-building task instead — complete it
                  and you still earn a certificate.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
            {TRACK_B_PIPELINE.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full border border-border text-[10px]">
                  {i + 1}
                </span>
                {step}
                {i < TRACK_B_PIPELINE.length - 1 && <ArrowRight className="h-3 w-3" />}
              </span>
            ))}
          </div>

          <Button asChild variant="outline" className="mt-6 w-full border-green/40 hover:bg-green-soft">
            <Link href="/internship/dashboard/apply">
              Apply to Track B <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
