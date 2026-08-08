'use client';

import Link from 'next/link';
import { Check, Rocket, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { usePricing } from '@/hooks/use-internships';

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[2.8px] text-primary">
      <span className="h-0.5 w-[22px] rounded-full bg-marigold" /> {children}
    </span>
  );
}

function PriceCard({
  icon: Icon,
  tone,
  title,
  blurb,
  price,
  priceLabel,
  features,
  href,
  cta,
  highlight,
}: {
  icon: typeof Zap;
  tone: string;
  title: string;
  blurb: string;
  price: string;
  priceLabel?: string;
  features: string[];
  href: string;
  cta: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-3xl border p-6 shadow-sm sm:p-7',
        highlight ? 'border-primary bg-accent/30' : 'border-border bg-card',
      )}
    >
      <span className={cn('grid h-11 w-11 flex-none place-items-center rounded-[14px]', tone)}>
        <Icon className="h-[21px] w-[21px]" />
      </span>
      <div>
        <h3 className="font-display text-[17px] font-bold tracking-tight">{title}</h3>
        <p className="mt-1 text-[13.5px] text-muted-foreground">{blurb}</p>
      </div>
      <div>
        <span className="font-display text-2xl font-extrabold text-primary">{price}</span>
        {priceLabel && <span className="ml-1.5 text-[13px] text-muted-foreground">{priceLabel}</span>}
      </div>
      <ul className="space-y-1.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[13.5px] text-muted-foreground">
            <Check className="mt-0.5 h-3.5 w-3.5 flex-none text-green" /> {f}
          </li>
        ))}
      </ul>
      <Button asChild className="mt-auto">
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  );
}

export default function PricingPage() {
  const { data: pricing, isLoading } = usePricing();

  return (
    <div className="mx-auto max-w-6xl space-y-14 pb-10">
      <section className="pt-2">
        <Eyebrow>Pricing</Eyebrow>
        <h1 className="mt-3 max-w-[720px] font-display text-[clamp(28px,4.8vw,46px)] font-extrabold leading-[1.08] tracking-[-.024em]">
          Transparent, upfront pricing for every paid track.
        </h1>
        <p className="mt-4 max-w-[600px] text-[16px] text-muted-foreground">
          Everything else on EduBridge Network — colleges, reviews, scholarships, and the opportunities catalog — is free. Paid tracks are
          settled manually via UPI; see our{' '}
          <Link href="/refund-policy" className="font-semibold text-primary hover:underline">
            Refund &amp; Cancellation Policy
          </Link>
          .
        </p>
      </section>

      <section>
        <h2 className="mb-5 font-display text-xl font-bold tracking-tight">Internship Program</h2>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <PriceCard
              icon={Sparkles}
              tone="bg-green-soft text-green"
              title={pricing?.trackA.GUIDED_LEARNING.label ?? 'Guided Learning'}
              blurb={pricing?.trackA.GUIDED_LEARNING.description ?? ''}
              price={`₹${(pricing?.trackA.GUIDED_LEARNING.feeAmount ?? 0).toLocaleString()}`}
              features={['Mentor-guided milestone tasks', 'Certificate on completion']}
              href="/internship"
              cta="View Internship Program"
            />
            <PriceCard
              icon={Rocket}
              tone="bg-accent text-primary"
              title={pricing?.trackA.OWN_PROJECT.label ?? 'Own Project'}
              blurb={pricing?.trackA.OWN_PROJECT.description ?? ''}
              price={`₹${(pricing?.trackA.OWN_PROJECT.feeAmount ?? 0).toLocaleString()}`}
              features={["EduBridge's team builds your idea", 'Certificate on completion']}
              href="/internship"
              cta="View Internship Program"
            />
          </div>
        )}
        <p className="mt-4 text-[13.5px] text-muted-foreground">
          {pricing?.trackB.label ?? 'Track B'} — {pricing?.trackB.description}
        </p>
      </section>
    </div>
  );
}
