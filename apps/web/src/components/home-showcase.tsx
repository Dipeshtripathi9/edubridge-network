'use client';

import Link from 'next/link';
import {
  BarChart3,
  Headphones,
  Info,
  Phone,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* Shared bits ------------------------------------------------------------- */

function Eyebrow({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[2.8px] text-primary',
        center && 'justify-center',
      )}
    >
      <span className="h-0.5 w-[22px] rounded-full bg-marigold" />
      {children}
    </span>
  );
}

function SectionHead({
  eyebrow,
  children,
  sub,
}: {
  eyebrow: string;
  children: React.ReactNode;
  sub: string;
}) {
  return (
    <div className="mb-10 max-w-[640px]">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 font-display text-[clamp(24px,4.2vw,38px)] font-extrabold leading-[1.08] tracking-[-.024em]">
        {children}
      </h2>
      <p className="mt-3 text-[16px] text-muted-foreground">{sub}</p>
    </div>
  );
}

/* 1 — Marquee ------------------------------------------------------------- */

const COLLEGES = [
  'BENNETT UNIVERSITY', 'SHIV NADAR UNIVERSITY', 'AMITY NOIDA', 'GALGOTIAS UNIVERSITY',
  'SHARDA UNIVERSITY', 'JIIT NOIDA', 'MANAV RACHNA', 'BML MUNJAL',
];

function Marquee() {
  const Row = ({ hidden }: { hidden?: boolean }) => (
    <div className="flex items-center gap-8 pr-8 font-mono text-xs font-medium tracking-[2.6px]" aria-hidden={hidden}>
      {COLLEGES.map((c) => (
        <span key={c} className="flex items-center gap-8 whitespace-nowrap">
          {c}
          <span className="text-[9px] text-marigold">◆</span>
        </span>
      ))}
      <span className="whitespace-nowrap text-marigold">+ 60 MORE VERIFIED COLLEGES</span>
      <span className="text-[9px] text-marigold">◆</span>
    </div>
  );
  return (
    <div className="group overflow-hidden rounded-2xl border border-foreground bg-foreground py-4 text-background">
      <div className="flex w-max animate-eb-marquee group-hover:[animation-play-state:paused]">
        <Row />
        <Row hidden />
      </div>
    </div>
  );
}

/* 2 — Stats strip --------------------------------------------------------- */

const STATS = [
  { n: '70', suf: '+', label: 'Verified colleges' },
  { n: '₹12', suf: 'L', label: 'Avg package data' },
  { n: '1:1', suf: '', label: 'Human experts only' },
  { n: '0', suf: '', label: 'AI predictions' },
];

function StatsStrip() {
  return (
    <div className="grid grid-cols-2 divide-x divide-y divide-border border-y border-border sm:grid-cols-4 sm:divide-y-0">
      {STATS.map((s) => (
        <div key={s.label} className="px-4 py-7 text-center">
          <b className="block font-display text-[clamp(26px,3.4vw,34px)] font-extrabold tracking-[-.02em]">
            <span className="text-primary">{s.n}</span>
            {s.suf}
          </b>
          <span className="text-[13px] font-semibold text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* 3 — How it works -------------------------------------------------------- */

const STEPS = [
  {
    icon: Headphones, num: 'STEP 01', tone: 'bg-accent text-primary', title: '1:1 expert guidance',
    body: (<>Talk to verified education experts over <b className="text-foreground">call or live chat</b> — course, college, career path, admission, scholarships and future planning, all personalised.</>),
  },
  {
    icon: BarChart3, num: 'STEP 02', tone: 'bg-marigold-soft text-amber-600', title: 'Data-driven insights',
    body: (<>Verified insights from real student data: <b className="text-foreground">placement stats, avg &amp; highest package, fees, ROI</b>, internships, satisfaction, hostel ratings &amp; faculty — in clean visualisations.</>),
  },
  {
    icon: Target, num: 'STEP 03', tone: 'bg-green-soft text-green', title: 'Personalized match',
    body: (<>Based on your <b className="text-foreground">course interest, location, marks, budget &amp; category</b>, our experts suggest only the colleges that genuinely fit your profile.</>),
  },
];

function HowItWorks() {
  return (
    <section>
      <SectionHead eyebrow="How it works" sub="Experts with years of experience, real student data, and guidance built around your profile. No guesswork, anywhere.">
        From confusion to <span className="text-primary">conviction</span> — in 3 steps.
      </SectionHead>
      <div className="grid gap-4 md:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.title} className="rounded-3xl border border-border bg-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <span className={cn('grid h-[50px] w-[50px] place-items-center rounded-2xl', s.tone)}>
                <s.icon className="h-6 w-6" />
              </span>
              <span className="font-mono text-xs tracking-[2px] text-muted-foreground">{s.num}</span>
            </div>
            <h3 className="mt-4 font-display text-xl font-bold tracking-tight">{s.title}</h3>
            <p className="mt-2 text-[15px] text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* 4 — Data section -------------------------------------------------------- */

const DATA_POINTS = [
  (<><b className="text-foreground">Placement &amp; packages</b> — average, highest and median, branch-wise.</>),
  (<><b className="text-foreground">Fees &amp; ROI</b> — total cost vs realistic returns, laid out clearly.</>),
  (<><b className="text-foreground">Campus life</b> — hostel ratings, infrastructure, faculty &amp; student satisfaction.</>),
];
const IBARS = [
  { label: 'Avg package', value: '₹11.8 L', w: '72%' },
  { label: 'Fees / year', value: '₹4.3 L', w: '46%', gold: true },
  { label: 'Placement rate', value: '94%', w: '94%' },
];

function DataSection() {
  return (
    <section className="grid items-center gap-10 rounded-3xl border border-border bg-card p-6 sm:p-10 lg:grid-cols-2">
      <div>
        <Eyebrow>Real college data</Eyebrow>
        <h2 className="mt-4 font-display text-[clamp(24px,4.2vw,38px)] font-extrabold leading-[1.08] tracking-[-.024em]">
          No guesswork.<br /><span className="text-primary">Real numbers.</span>
        </h2>
        <p className="mt-3 max-w-[440px] text-muted-foreground">
          Every college looks great in its brochure. We show you what verified students studying there actually say.
        </p>
        <div className="mt-7 flex flex-col gap-4">
          {DATA_POINTS.map((p, i) => (
            <div key={i} className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-green" />
              <p className="text-[15px] text-muted-foreground">{p}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-background p-6 shadow-lg sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="leading-tight">
            <b className="block font-display text-[18px] font-bold tracking-tight">Shiv Nadar University</b>
            <span className="text-[13px] font-semibold text-muted-foreground">B.Tech CSE · Insight report</span>
          </div>
          <span className="inline-flex flex-none items-center gap-1.5 rounded-full bg-green-soft px-3 py-1.5 text-[11.5px] font-bold text-green">
            <ShieldCheck className="h-3.5 w-3.5" /> 48 verified students
          </span>
        </div>
        <div className="flex flex-col gap-4">
          {IBARS.map((b) => (
            <div key={b.label} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>{b.label}</span>
                <b className="font-mono text-xs text-foreground">{b.value}</b>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <span
                  className={cn('block h-full rounded-full', b.gold ? 'bg-gradient-to-r from-marigold to-amber-300' : 'bg-gradient-to-r from-primary to-violet-400')}
                  style={{ width: b.w }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {[['4.2★', 'Hostel rating', true], ['4.5★', 'Faculty'], ['86%', 'Satisfaction']].map(([v, l, gold]) => (
            <div key={l as string} className="rounded-2xl border border-border bg-card p-3 text-center">
              <b className={cn('block font-display text-lg font-extrabold', gold && 'text-amber-600')}>{v}</b>
              <span className="text-[11px] font-semibold text-muted-foreground">{l}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-start gap-2 border-t border-dashed border-border pt-4 text-[12.5px] text-muted-foreground">
          <Info className="mt-0.5 h-[15px] w-[15px] flex-none text-marigold" />
          Sample report. Every number comes from actual verified-student data — no AI estimates.
        </div>
      </div>
    </section>
  );
}

/* 7 — Review -------------------------------------------------------------- */

function Review() {
  return (
    <section className="mx-auto max-w-[760px] rounded-3xl border border-border bg-card p-8 text-center shadow-lg sm:p-12">
      <div className="text-[21px] tracking-[5px] text-marigold" aria-label="5 out of 5 stars">★★★★★</div>
      <p className="mx-auto mt-5 max-w-[640px] font-display text-[clamp(18px,3vw,24px)] font-semibold leading-[1.42] tracking-[-.015em]">
        &ldquo;The brochures confused me. My EduBridge counselor compared{' '}
        <span className="bg-[linear-gradient(transparent_62%,hsl(var(--marigold-soft))_62%)]">real placement data across 3 colleges</span>. Today I&apos;m at Bennett — zero regrets.&rdquo;
      </p>
      <div className="mt-6 inline-flex items-center gap-3 text-left">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-primary font-display text-base font-bold text-white">AS</span>
        <div>
          <b className="block text-[15px]">Aarav S.</b>
          <span className="flex items-center gap-1.5 text-[12.5px] font-bold text-green"><ShieldCheck className="h-3.5 w-3.5" /> Verified student · Bennett University</span>
        </div>
      </div>
    </section>
  );
}

/* 8 — Final CTA ----------------------------------------------------------- */

function FinalCTA() {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-primary px-6 py-14 text-center sm:px-12 sm:py-16 text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(46% 60% at 88% 0%, rgba(255,255,255,.16), transparent 60%), radial-gradient(40% 55% at 4% 100%, rgba(36,18,99,.5), transparent 62%)' }} />
      <div className="relative">
        <h2 className="font-display text-[clamp(28px,5vw,44px)] font-extrabold leading-[1.08] tracking-[-.025em]">
          Still confused?<br /><span className="text-[#FFD98A]">It happens. Let&apos;s talk.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-[520px] text-[17px] text-[#DCD5F7]">
          A free 5-minute call — <b className="text-white">with a real expert</b>, not an AI. Your profile, your budget, your dreams — and the college that fits them.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="bg-background text-foreground hover:bg-card"><Link href="#get-expert-guidance"><Phone className="h-4 w-4" /> Book free expert call</Link></Button>
          <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90"><Link href="/messages">Start live chat</Link></Button>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-5 text-[13px] font-semibold text-[#DCD5F7]">
          {['100% free', 'No spam calls', 'Human experts only'].map((t) => (
            <span key={t} className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[#FFD98A]" /> {t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Composed showcase ------------------------------------------------------- */

export function HomeShowcase() {
  return (
    <div className="space-y-14 sm:space-y-20">
      <Marquee />
      <StatsStrip />
      <HowItWorks />
      <DataSection />
      <Review />
      <FinalCTA />
    </div>
  );
}
