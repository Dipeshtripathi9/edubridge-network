'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Award,
  Check,
  ClipboardCheck,
  Code2,
  GraduationCap,
  IndianRupee,
  Send,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePricing } from '@/hooks/use-internships';

function OptionTile({ icon: Icon, title, desc }: { icon: typeof Award; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-4 text-center">
      <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-2.5 text-[13.5px] font-semibold leading-tight">{title}</p>
      <p className="mt-1 text-[12.5px] leading-snug text-muted-foreground">{desc}</p>
    </div>
  );
}

export function TrackPicker() {
  const { data: pricing, isLoading } = usePricing();

  if (isLoading || !pricing) {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        <Skeleton className="h-[34rem] w-full" />
        <Skeleton className="h-[34rem] w-full" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Track A */}
      <Card className="flex flex-col overflow-hidden border-marigold/30 p-0">
        <div className="flex items-center gap-3 bg-marigold px-6 py-5 text-white sm:px-7">
          <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-white/15">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/80">Option 1</p>
            <p className="font-display text-lg font-extrabold tracking-tight">Learn &amp; Build with Guidance</p>
          </div>
        </div>
        <CardContent className="flex flex-1 flex-col p-7">
          <h3 className="font-display text-2xl font-extrabold tracking-tight">Learn &amp; Build</h3>
          <p className="mt-2 text-[15px] text-muted-foreground">
            Perfect for students who want to learn, get certified, and grow through guided tasks —
            or their own idea, built by a professional team.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-2.5 lg:grid-cols-3">
            <OptionTile
              icon={GraduationCap}
              title="Guided Learning with Tasks"
              desc="Real-world tasks with mentor feedback."
            />
            <OptionTile
              icon={Code2}
              title="Work on Your Own Project"
              desc="Your idea, built with guidance."
            />
            <OptionTile
              icon={Award}
              title="Certification & Learning"
              desc="Verified certificate on completion."
            />
          </div>

          <div className="mt-5 grid flex-1 gap-5 border-t border-border pt-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">What you get</p>
              <ul className="mt-2.5 space-y-2 text-[13.5px]">
                {['Expert guidance', 'Tasks & feedback', 'Skill development', 'Verified certification', 'Completion letter'].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-none text-marigold" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Fee structure</p>
              <ul className="mt-2.5 space-y-2 text-[13.5px]">
                <li className="flex items-center justify-between gap-2">
                  <span>{pricing.trackA.GUIDED_LEARNING.label}</span>
                  <span className="font-mono font-semibold text-marigold">
                    ₹{pricing.trackA.GUIDED_LEARNING.feeAmount.toLocaleString()}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span>{pricing.trackA.OWN_PROJECT.label}</span>
                  <span className="font-mono font-semibold text-marigold">
                    ₹{pricing.trackA.OWN_PROJECT.feeAmount.toLocaleString()}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <Button asChild className="mt-6 w-full bg-marigold text-white hover:bg-marigold/90">
            <Link href="/internship/dashboard/enroll">
              Choose Option 1 <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Track B */}
      <Card className="flex flex-col overflow-hidden border-primary/25 p-0">
        <div className="flex items-center gap-3 bg-primary px-6 py-5 text-primary-foreground sm:px-7">
          <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-white/15">
            <Send className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary-foreground/80">Option 2</p>
            <p className="font-display text-lg font-extrabold tracking-tight">Work on Live Projects</p>
          </div>
        </div>
        <CardContent className="flex flex-1 flex-col p-7">
          <h3 className="font-display text-2xl font-extrabold tracking-tight">Apply &amp; Get Selected</h3>
          <p className="mt-2 text-[15px] text-muted-foreground">{pricing.trackB.description}</p>

          <div className="mt-5 grid grid-cols-1 gap-2.5 lg:grid-cols-3">
            <OptionTile icon={Send} title="Apply & Get Shortlisted" desc="Apply for real client or startup work." />
            <OptionTile icon={ClipboardCheck} title="Work Allocation" desc="Matched to work based on your skills." />
            <OptionTile icon={IndianRupee} title="Paid / Unpaid" desc="Paid or unpaid — always told upfront." />
          </div>

          <div className="mt-5 grid flex-1 gap-3 border-t border-border pt-5">
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <p className="text-[13.5px] font-semibold">If not selected or not skilled enough yet</p>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                We&apos;ll guide you with a skill-building task instead — complete it and you&apos;re still on
                track for the same certificate.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <p className="text-[13.5px] font-semibold">Certification for all</p>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                Every intern gets a verified certificate after successful completion — paid work or task.
              </p>
            </div>
          </div>

          <Button asChild variant="outline" className="mt-6 w-full border-primary/40 hover:bg-accent">
            <Link href="/internship/dashboard/apply">
              Choose Option 2 <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
