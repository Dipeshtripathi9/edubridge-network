import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Home,
  Rocket,
  ShieldCheck,
  Share2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const FOUNDERS_HUB = '/communities/founders-hub';

const ARC = (
  <svg className="absolute -bottom-2 left-0 h-3 w-full text-marigold" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden>
    <path d="M4 16 C 80 2, 220 2, 296 16" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
  </svg>
);

function Eyebrow({ children, marigold }: { children: React.ReactNode; marigold?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[2.8px]', marigold ? 'text-marigold' : 'text-primary')}>
      <span className="h-0.5 w-[22px] rounded-full bg-marigold" /> {children}
    </span>
  );
}

const PIPELINE = [
  { n: '01', label: 'Pitch', gold: false, title: 'Post your idea', body: (<>Share it in <b className="text-foreground">Founders Hub</b> — the problem, your solution, and why you&apos;re the one to build it.</>) },
  { n: '02', label: 'Review', gold: false, title: 'Get shortlisted', body: (<>The EduBridge team reviews every pitch. <b className="text-foreground">Genuine ideas</b> — real problem, serious founder — move ahead.</>) },
  { n: '03', label: 'Build', gold: true, title: 'We build it', body: (<><b className="text-foreground">99x Developers</b> builds your website or app at a guaranteed <b className="text-foreground">30%+ student discount</b>.</>) },
  { n: '04', label: 'Launch', gold: false, title: 'Go live here', body: (<>Get listed on this page — your <b className="text-foreground">first users</b> come from the network&apos;s own communities.</>) },
];

const PERKS = [
  { icon: Code2, title: 'Build', body: (<>Your website or app, built by <b className="text-white">99x Developers</b> at a guaranteed <b className="text-white">30%+ student discount</b>.</>) },
  { icon: Rocket, title: 'Launch', body: (<>A spot on this page — in front of <b className="text-white">200+ verified students</b> across 70+ Delhi NCR colleges.</>) },
  { icon: TrendingUp, title: 'Grow', body: (<>Your <b className="text-white">first users, feedback and teammates</b> come from the network&apos;s own communities.</>) },
];

export default function StartupsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-14 sm:space-y-20">
      {/* Hero */}
      <section className="pt-2">
        <Eyebrow>Startups</Eyebrow>
        <h1 className="mt-3 font-display text-[clamp(30px,5.4vw,52px)] font-extrabold leading-[1.06] tracking-[-.026em]">
          <span className="block">Built by students.</span>
          <span className="relative inline-block text-primary">Backed by EduBridge.{ARC}</span>
        </h1>
        <p className="mt-3 max-w-[580px] text-[16.5px] text-muted-foreground">
          Student-led startups on the network — launch your own, join a team, or use their services. Every startup here began as a post in Founders Hub.
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          {[
            { icon: Rocket, tone: 'text-marigold', v: '2', l: 'startups live' },
            { icon: Users, tone: 'text-primary', v: '13', l: 'founders building' },
            { icon: ShieldCheck, tone: 'text-green', v: '30%+', l: 'build discount' },
          ].map((s) => (
            <span key={s.l} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-bold text-muted-foreground shadow-sm">
              <s.icon className={cn('h-[15px] w-[15px]', s.tone)} /> <b className="font-display text-foreground">{s.v}</b> {s.l}
            </span>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section>
        <div className="mb-10 max-w-[640px]">
          <Eyebrow>How backing works</Eyebrow>
          <h2 className="mt-4 font-display text-[clamp(24px,4vw,38px)] font-extrabold leading-[1.08] tracking-[-.024em]">
            From idea to live product — <span className="text-primary">in 4 steps.</span>
          </h2>
          <p className="mt-3 text-muted-foreground">No pitch decks, no gatekeeping. Post your idea where verified students can see it — the genuine ones get built.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE.map((s) => (
            <div key={s.n} className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <span className={cn('grid h-[42px] w-[42px] place-items-center rounded-[14px] font-display text-[15px] font-extrabold', s.gold ? 'bg-marigold text-foreground' : 'bg-primary text-white')}>{s.n}</span>
                <span className="font-mono text-[11px] uppercase tracking-[2px] text-muted-foreground">{s.label}</span>
              </div>
              <h3 className="font-display text-[18.5px] font-bold tracking-tight">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured startups */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-10">
        <div className="mb-9 max-w-[640px]">
          <Eyebrow>On the network</Eyebrow>
          <h2 className="mt-4 font-display text-[clamp(24px,4vw,38px)] font-extrabold leading-[1.08] tracking-[-.024em]">
            Live startups, <span className="text-primary">built here.</span>
          </h2>
          <p className="mt-3 text-muted-foreground">Use their services, join their teams, or study how they did it.</p>
          <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-[13.5px] font-semibold text-muted-foreground">
            Just like Zomato built <b className="text-primary">District</b> — we built <b className="text-primary">EZ-Rentbuddy</b>.
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { icon: Code2, flag: 'In-house studio', mint: false, title: '99x Developers', body: (<>Web design, development &amp; digital marketing — <b className="text-foreground">EduBridge Network&apos;s in-house studio</b>, and the team that builds every backed idea on this page.</>), chips: ['Web design', 'Development', 'Digital marketing'], origin: 'Builds backed startups at 30%+ off', href: '/startups/99x-developers' },
            { icon: Home, flag: 'Backed by EduBridge', mint: true, title: 'EZ-Rentbuddy', body: (<>Student housing — find <b className="text-foreground">PGs, hostels, flats &amp; rooms</b> near your campus, or earn cashback by sharing properties.</>), chips: ['PGs', 'Hostels', 'Flats & rooms', 'Cashback'], origin: 'Founders Hub post → backed → built by 99x', href: '/startups/ez-rentbuddy' },
          ].map((s) => (
            <article key={s.title} className="flex flex-col gap-3.5 rounded-3xl border border-border bg-background p-7 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-between gap-2.5">
                <span className="grid h-[50px] w-[50px] flex-none place-items-center rounded-2xl bg-accent text-primary"><s.icon className="h-[22px] w-[22px]" /></span>
                <span className={cn('rounded-full px-2.5 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[1.2px]', s.mint ? 'bg-green-soft text-green' : 'bg-accent text-primary')}>{s.flag}</span>
              </div>
              <h3 className="font-display text-xl font-bold tracking-tight">{s.title}</h3>
              <p className="text-[14.5px] text-muted-foreground">{s.body}</p>
              <div className="flex flex-wrap gap-2">
                {s.chips.map((c) => (
                  <span key={c} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground">{c}</span>
                ))}
              </div>
              <span className="flex items-center gap-2 pt-1 text-[12.5px] font-bold text-primary">
                <TrendingUp className="h-[15px] w-[15px]" /> {s.origin}
              </span>
              <div className="flex gap-2.5 pt-1">
                <Button asChild variant="outline" size="sm"><Link href={s.href}>Visit <ArrowRight className="h-4 w-4" /></Link></Button>
                <span aria-hidden className="grid h-[42px] w-[42px] place-items-center rounded-[13px] border border-border text-muted-foreground"><Share2 className="h-[18px] w-[18px]" /></span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Perks — dark chapter */}
      <section className="relative overflow-hidden rounded-3xl bg-violet-deep p-6 sm:p-10">
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(52% 60% at 82% 8%, rgba(90,49,244,.55), transparent 62%), radial-gradient(40% 46% at 6% 92%, rgba(242,163,27,.16), transparent 60%)' }} />
        <div className="relative">
          <div className="max-w-[640px]">
            <Eyebrow marigold>What backed founders get</Eyebrow>
            <h2 className="mt-4 font-display text-[clamp(24px,4vw,38px)] font-extrabold leading-[1.08] tracking-[-.024em] text-white">
              We don&apos;t just like your idea.<br /><span className="text-marigold">We ship it.</span>
            </h2>
            <p className="mt-3 text-[#C9C1EE]">Backing means real resources — not a certificate and a handshake.</p>
          </div>
          <div className="mt-11 grid gap-4 md:grid-cols-3">
            {PERKS.map((p) => (
              <article key={p.title} className="flex flex-col gap-3.5 rounded-3xl border border-white/[.13] bg-white/[.055] p-7 backdrop-blur transition-all hover:-translate-y-1 hover:border-white/25 hover:bg-white/[.09]">
                <span className="grid h-[50px] w-[50px] flex-none place-items-center rounded-2xl border border-white/[.16] bg-white/10 text-marigold"><p.icon className="h-[22px] w-[22px]" /></span>
                <h3 className="font-display text-xl font-bold tracking-tight text-white">{p.title}</h3>
                <p className="text-[14.5px] text-[#C9C1EE]">{p.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-10 font-mono text-[11px] uppercase tracking-[2.6px] text-[#A99EDE]">What counts as &ldquo;genuine&rdquo;</p>
          <div className="mt-3.5 flex flex-wrap gap-2.5">
            {['Solves a real student problem', 'A founder serious about executing', 'A scope we can actually ship'].map((c) => (
              <span key={c} className="inline-flex items-center gap-2 rounded-full border border-white/[.14] bg-white/[.06] px-4 py-2.5 text-[13.5px] font-semibold text-[#DCD5F7]">
                <CheckCircle2 className="h-[15px] w-[15px] text-marigold" /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Founders Hub card */}
      <section>
        <div className="mb-8 max-w-[640px]">
          <Eyebrow>Founders Hub</Eyebrow>
          <h2 className="mt-4 font-display text-[clamp(24px,4vw,38px)] font-extrabold leading-[1.08] tracking-[-.024em]">
            The room where <span className="text-primary">it starts.</span>
          </h2>
        </div>
        <Link href={FOUNDERS_HUB} className="flex max-w-[760px] flex-wrap items-center gap-5 rounded-3xl border border-border bg-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
          <span className="grid h-[50px] w-[50px] flex-none place-items-center rounded-2xl bg-accent text-primary"><Rocket className="h-[22px] w-[22px]" /></span>
          <div className="min-w-[220px] flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-[19px] font-bold tracking-tight">Founders Hub</h3>
              <span className="rounded-full border border-border bg-background px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[1.1px] text-muted-foreground">Startup</span>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">For student founders — build, pitch and grow your startup. Feedback, co-founders and backing, all in one community.</p>
            <span className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground"><Users className="h-[15px] w-[15px]" /> 13 members · build, pitch &amp; grow</span>
          </div>
          <span className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-[0_10px_24px_-12px_hsl(var(--primary)/.7)]">Open</span>
        </Link>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden rounded-[32px] bg-primary px-6 py-14 text-center text-white sm:px-12 sm:py-16">
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(46% 60% at 88% 0%, rgba(255,255,255,.16), transparent 60%), radial-gradient(40% 55% at 4% 100%, rgba(36,18,99,.5), transparent 62%)' }} />
        <div className="relative">
          <h2 className="font-display text-[clamp(28px,4.6vw,44px)] font-extrabold leading-[1.08] tracking-[-.025em]">
            Your idea could be next.<br /><span className="text-[#FFD98A]">Pitch it this week.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-[16.5px] text-[#DCD5F7]">
            Post the problem, your solution, and why you&apos;re the one to build it. <b className="text-white">Every pitch gets a human review.</b>
          </p>
          <div className="mt-7 flex justify-center">
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-card"><Link href={FOUNDERS_HUB}><Rocket className="h-4 w-4" /> Pitch in Founders Hub</Link></Button>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-5 text-[13px] font-semibold text-[#DCD5F7]">
            {['Free to pitch', 'Reviewed by humans', '30%+ build discount'].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[#FFD98A]" /> {t}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
