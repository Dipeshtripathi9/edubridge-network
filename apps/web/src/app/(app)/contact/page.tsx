import Link from 'next/link';
import { Clock, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LEGAL } from '@/lib/legal-placeholders';

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[2.8px] text-primary">
      <span className="h-0.5 w-[22px] rounded-full bg-marigold" /> {children}
    </span>
  );
}

const CHANNELS = [
  { icon: Mail, tone: 'bg-accent text-primary', title: 'Email', value: LEGAL.supportEmail, href: `mailto:${LEGAL.supportEmail}` },
  { icon: Phone, tone: 'bg-marigold-soft text-amber-600', title: 'Phone', value: LEGAL.supportPhone, href: `tel:${LEGAL.supportPhone}` },
  { icon: MapPin, tone: 'bg-green-soft text-green', title: 'Address', value: LEGAL.registeredAddress, href: undefined },
  { icon: Clock, tone: 'bg-accent text-primary', title: 'Support hours', value: LEGAL.supportHours, href: undefined },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 pb-10">
      <section className="pt-2">
        <Eyebrow>Contact us</Eyebrow>
        <h1 className="mt-3 max-w-[720px] font-display text-[clamp(28px,4.6vw,44px)] font-extrabold leading-[1.08] tracking-[-.024em]">
          We&apos;re here if something&apos;s not working, or you just have a question.
        </h1>
        <p className="mt-4 max-w-[600px] text-[16px] text-muted-foreground">
          Reach out about enrollments, payments, verification, or anything else on the platform — a real person reads every message.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {CHANNELS.map((c) => {
          const Content = (
            <div className="flex gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <span className={cn('grid h-11 w-11 flex-none place-items-center rounded-[14px]', c.tone)}>
                <c.icon className="h-[21px] w-[21px]" />
              </span>
              <div>
                <h3 className="font-display text-[15.5px] font-bold tracking-tight">{c.title}</h3>
                <p className="mt-1 text-[13.5px] text-muted-foreground">{c.value}</p>
              </div>
            </div>
          );
          return c.href ? (
            <a key={c.title} href={c.href} className="block">
              {Content}
            </a>
          ) : (
            <div key={c.title}>{Content}</div>
          );
        })}
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 flex-none place-items-center rounded-[14px] bg-accent text-primary">
            <ShieldCheck className="h-[21px] w-[21px]" />
          </span>
          <div>
            <h3 className="font-display text-[16px] font-bold tracking-tight">Enrolled in a paid track?</h3>
            <p className="mt-1.5 text-[13.5px] text-muted-foreground">
              For payment or refund queries, email {LEGAL.supportEmail} with your registered email and enrollment ID — see our{' '}
              <Link href="/refund-policy" className="font-semibold text-primary hover:underline">
                Refund &amp; Cancellation Policy
              </Link>{' '}
              for how requests are handled.
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[32px] bg-primary px-6 py-12 text-center text-white sm:px-12 sm:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(46% 60% at 88% 0%, rgba(255,255,255,.16), transparent 60%), radial-gradient(40% 55% at 4% 100%, rgba(36,18,99,.5), transparent 62%)' }}
        />
        <div className="relative">
          <h2 className="font-display text-[clamp(22px,3.6vw,32px)] font-extrabold leading-[1.1] tracking-[-.02em]">
            Have a question that&apos;s not urgent?
          </h2>
          <p className="mx-auto mt-2 max-w-[480px] text-[#DCD5F7]">Browse what we offer, or just drop us a line — we reply within {LEGAL.supportHours}.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-card">
              <Link href="/services">
                <MessageCircle className="h-4 w-4" /> Explore services
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90">
              <a href={`mailto:${LEGAL.supportEmail}`}>Email support</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
