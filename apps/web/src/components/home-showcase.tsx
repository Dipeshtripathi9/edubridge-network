'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BarChart3,
  Bookmark,
  Code2,
  Headphones,
  Home,
  Info,
  MapPin,
  Phone,
  ShieldCheck,
  Share2,
  Star,
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

/* 5 — Opportunity Hub ----------------------------------------------------- */

const FILTERS = ['All', 'Internships', 'Scholarships', 'Competitions', 'Fellowships', 'Research', 'Certifications'];
const OPPS = [
  { title: 'Young India Fellowship', body: 'A transformative year of liberal-arts education, with scholarships available and global networking.', loc: 'Remote', tag2: 'Opportunity playbook' },
  { title: 'LAMP Fellowship', body: 'Work alongside a Member of Parliament — first-hand experience in policy, research and governance.', loc: 'New Delhi', tag2: 'Policy & governance' },
  { title: 'SBI Youth for India', body: '13 months in rural India — working with NGOs on grassroots development projects.', loc: 'Pan India', tag2: 'Social impact' },
];

function OpportunityHub() {
  const [active, setActive] = useState('All');
  return (
    <section>
      <SectionHead eyebrow="Opportunity Hub" sub="Internships, scholarships, competitions, fellowships & research programs — all in one place, curated for your profile.">
        After admission, <span className="text-primary">the real game</span> begins.
      </SectionHead>
      <div className="mb-6 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={cn(
              'flex-none rounded-full border px-4 py-2.5 text-[13.5px] font-bold transition-colors',
              active === f ? 'border-foreground bg-foreground text-background' : 'border-border bg-card text-muted-foreground hover:border-foreground',
            )}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OPPS.map((o) => (
          <article key={o.title} className="flex flex-col gap-3.5 rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <span className="self-start rounded-full bg-accent px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[1.4px] text-primary">Fellowship</span>
            <h3 className="font-display text-xl font-bold tracking-tight">{o.title}</h3>
            <p className="flex-1 text-[14.5px] text-muted-foreground">{o.body}</p>
            <div className="flex flex-wrap gap-3.5 text-[12.5px] font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="h-[15px] w-[15px]" /> {o.loc}</span>
              <span className="flex items-center gap-1.5"><Star className="h-[15px] w-[15px]" /> {o.tag2}</span>
            </div>
            <div className="flex gap-2.5">
              <Button asChild size="sm" className="flex-1"><Link href="/opportunities">Apply now</Link></Button>
              <button aria-label="Save" className="grid h-11 w-11 flex-none place-items-center rounded-2xl border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"><Bookmark className="h-[18px] w-[18px]" /></button>
              <button aria-label="Share" className="grid h-11 w-11 flex-none place-items-center rounded-2xl border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"><Share2 className="h-[18px] w-[18px]" /></button>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Button asChild variant="outline"><Link href="/opportunities">Browse all opportunities <ArrowRight className="h-4 w-4" /></Link></Button>
      </div>
    </section>
  );
}

/* 6 — Builders (dark) ----------------------------------------------------- */

const BUILDERS = [
  { icon: Code2, flag: 'Step 1 · Build', mint: false, title: '99x Developers', body: (<>EduBridge Network&apos;s in-house studio — web design, development &amp; digital marketing. A guaranteed <b className="text-white">30%+ discount</b> for genuine student ideas.</>), meta: 'For shortlisted ideas only', link: 'Visit 99x Developers', href: '/startups/99x-developers' },
  { icon: Home, flag: 'Backed by EduBridge', mint: true, title: 'EZ-Rentbuddy', body: (<>Our first backed startup — a student housing platform. Find <b className="text-white">PGs, hostels, flats &amp; rooms</b>, or earn cashback by sharing properties.</>), meta: 'Live & serving students', link: 'Visit EZ-Rentbuddy', href: '/startups/ez-rentbuddy' },
];

function Builders() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-violet-deep p-6 sm:p-10">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(52% 60% at 82% 8%, rgba(90,49,244,.55), transparent 62%), radial-gradient(40% 46% at 6% 92%, rgba(242,163,27,.16), transparent 60%)' }} />
      <div className="relative">
        <Eyebrow>EduBridge for builders</Eyebrow>
        <h2 className="mt-4 font-display text-[clamp(24px,4.2vw,38px)] font-extrabold leading-[1.08] tracking-[-.024em] text-white">
          Got a genuine idea?<br /><span className="text-marigold">We&apos;ll get it built.</span>
        </h2>
        <p className="mt-3 max-w-[560px] text-[#C9C1EE]">
          Got a genuine business idea? Our in-house studio builds your website or app — at student pricing.
        </p>
        <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.07] px-4 py-2.5 text-[13.5px] font-semibold text-[#DCD5F7]">
          Just like Zomato built <b className="text-marigold">District</b> — we built <b className="text-marigold">EZ-Rentbuddy</b>.
        </span>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {BUILDERS.map((b) => (
            <article key={b.title} className="flex flex-col gap-3.5 rounded-3xl border border-white/[.13] bg-white/[.055] p-6 backdrop-blur transition-all hover:-translate-y-1 hover:border-white/25 hover:bg-white/[.09]">
              <div className="flex items-center justify-between gap-2.5">
                <span className="grid h-[50px] w-[50px] flex-none place-items-center rounded-2xl border border-white/[.16] bg-white/10 text-marigold"><b.icon className="h-6 w-6" /></span>
                <span className={cn('rounded-full border px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[1.2px]', b.mint ? 'border-[#5eeaa64d] bg-[#5eeaa61f] text-[#7BEDB4]' : 'border-marigold/30 bg-marigold/[.16] text-marigold')}>{b.flag}</span>
              </div>
              <h3 className="font-display text-xl font-bold tracking-tight text-white">{b.title}</h3>
              <p className="flex-1 text-[14.5px] leading-relaxed text-[#C9C1EE]">{b.body}</p>
              <span className="flex items-center gap-2 text-[12.5px] font-semibold text-[#A99EDE]"><Award className="h-[15px] w-[15px]" /> {b.meta}</span>
              <Link href={b.href} className="group inline-flex items-center gap-2 text-[14.5px] font-bold text-marigold">
                {b.link} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </article>
          ))}
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
      <OpportunityHub />
      <Builders />
      <Review />
      <FinalCTA />
    </div>
  );
}
