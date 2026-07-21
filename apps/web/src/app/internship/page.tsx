'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Award,
  Briefcase,
  GraduationCap,
  Globe2,
  Network,
  ShieldCheck,
  Star,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrackPicker } from '@/components/internship/track-picker';
import { usePricing } from '@/hooks/use-internships';

const NAV = ['Tracks', 'Why intern', 'FAQ'];

const WHY_INTERN = [
  { icon: Briefcase, title: 'Real-World Experience', desc: 'Work on live projects, not busywork.', tone: 'bg-accent text-primary' },
  { icon: UserCheck, title: 'Expert Guidance', desc: 'Mentor feedback on every task you submit.', tone: 'bg-marigold-soft text-amber-600' },
  { icon: TrendingUp, title: 'Skill Development', desc: 'Structured tasks that build real ability.', tone: 'bg-accent text-primary' },
  { icon: ShieldCheck, title: 'Verified Certification', desc: 'A certificate anyone can verify online.', tone: 'bg-marigold-soft text-amber-600' },
  { icon: Award, title: 'Career Growth', desc: 'A credential that stands out on your profile.', tone: 'bg-accent text-primary' },
  { icon: Network, title: 'Networking Opportunities', desc: 'Connect with mentors, startups & partners.', tone: 'bg-marigold-soft text-amber-600' },
];

const FAQ = [
  {
    q: 'Do I need experience to apply?',
    a: 'No. Track B is open to every skill level — if you’re not ready for paid work yet, you’ll get a task instead, with a clear path to the same certificate.',
  },
  {
    q: 'Is the paid work real?',
    a: 'Yes — Track B paid allocations are real client or startup work with a fixed payout, tracked in your dashboard from allocation to payout.',
  },
  {
    q: 'What do I get for my own project?',
    a: 'A qualified EduBridge team builds and ships a professional website for your idea, with 1 year of maintenance included after launch.',
  },
  {
    q: 'How is my certificate verified?',
    a: 'Every certificate has a unique code anyone can check on our verification page — no login required.',
  },
];

const HERO_TAGS = [
  { label: 'Track A · Learn', href: '#tracks' },
  { label: 'Track B · Apply', href: '#tracks' },
  { label: 'Certification', href: '#why-intern' },
];

export default function InternshipLandingPage() {
  const { data: pricing } = usePricing();

  return (
    <div className="min-h-screen scroll-smooth bg-background">
      {/* Nav — clean minimal white bar */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight">EduBridge Network</p>
              <p className="text-xs font-semibold text-primary">Internship Opportunities</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
            {NAV.map((n) => (
              <a key={n} href={`#${n.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-foreground">
                {n}
              </a>
            ))}
          </nav>
          <Button asChild size="sm" variant="outline">
            <Link href="/internship/dashboard">Sign in</Link>
          </Button>
        </div>
      </header>

      {/* Hero — same typographic system as the homepage: uppercase eyebrow, serif
          uppercase headline, uppercase label, one solid + outline button row. */}
      <section className="relative overflow-hidden bg-background">
        <span
          aria-hidden
          className="pointer-events-none absolute left-6 top-6 hidden grid-cols-4 gap-1.5 text-primary/30 sm:left-10 sm:top-10 lg:grid"
        >
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-current" />
          ))}
        </span>
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:py-20">
          <span className="block text-[13px] font-extrabold uppercase tracking-[.3em] text-primary">
            EduBridge&apos;s Own
          </span>
          <h1 className="mt-2 font-serif text-[clamp(28px,4.6vw,48px)] font-extrabold uppercase leading-[1.1] tracking-[-.02em]">
            Internship Program
          </h1>
          <p className="mx-auto mt-3 max-w-[540px] text-[16px] leading-relaxed text-muted-foreground">
            Two ways in: pay to learn on a live project with a mentor, or apply and let your skills
            earn you real — sometimes paid — work. Both roads lead to a verifiable certificate.
          </p>
          <p className="mt-4 text-[14px] font-semibold uppercase tracking-[.25em]">Choose your path</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Button asChild size="lg" className="gap-2">
              <a href="#tracks">
                Choose your track <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" className="gap-1.5 px-4 text-[13.5px]">
              <Link href="/verify-certificate">
                <ShieldCheck className="h-4 w-4" strokeWidth={1.75} /> Verify a certificate
              </Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {HERO_TAGS.map((t) => (
              <a
                key={t.label}
                href={t.href}
                className="rounded-full border border-primary/40 px-4 py-1.5 text-sm font-semibold text-primary hover:bg-accent"
              >
                {t.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-16 px-4 py-12 [&_section[id]]:scroll-mt-24">
        {/* Tracks */}
        <section id="tracks" className="space-y-8">
          <div className="mx-auto max-w-xl border-t-2 border-border pt-7 text-center">
            <span aria-hidden className="mx-auto block h-[3px] w-10 -translate-y-[calc(50%+1px)] rounded-full bg-marigold" />
            <h2 className="text-balance font-display text-[clamp(22px,3.4vw,34px)] font-extrabold tracking-[-.02em]">
              Two ways to earn your certificate
            </h2>
            <p className="mx-auto mt-3 max-w-[440px] text-[14.5px] leading-relaxed text-muted-foreground sm:text-[15.5px]">
              Pick the one that matches what you have right now: money and time to learn, or skills
              you&apos;re ready to prove.
            </p>
          </div>
          <TrackPicker />
        </section>

        {/* Premium: build your own project */}
        <section className="overflow-hidden rounded-3xl border border-marigold/30 bg-marigold-soft">
          <div className="flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-marigold px-3 py-1 text-xs font-bold text-white">
                <Star className="h-3.5 w-3.5" /> PREMIUM SERVICE
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-6 px-6 pb-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <h3 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
                Build Your Own Project with Your Own Team
              </h3>
              <p className="mt-1.5 max-w-lg text-[15px] text-muted-foreground">
                Want to build your own project with your own team? We&apos;ll build and ship a
                professional website for your idea.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-[13px] font-semibold text-foreground/80">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-marigold" /> Qualified Expert Team
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe2 className="h-4 w-4 text-marigold" /> Best-in-Class Website
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-marigold" /> 1 Year Maintenance
                </span>
              </div>
            </div>
            <div className="flex flex-none flex-col items-start gap-3 sm:items-end">
              {pricing && (
                <div className="rounded-2xl bg-marigold px-4 py-2 text-center text-white">
                  <p className="text-[10px] font-bold uppercase tracking-wide opacity-90">Starting from</p>
                  <p className="font-mono text-lg font-extrabold">
                    ₹{pricing.trackA.OWN_PROJECT.feeAmount.toLocaleString()}
                  </p>
                </div>
              )}
              <Button asChild className="bg-marigold text-white hover:bg-marigold/90">
                <Link href="/internship/dashboard/enroll">
                  Build my project <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why intern */}
        <section id="why-intern" className="space-y-8">
          <div className="mx-auto max-w-xl border-t-2 border-border pt-7 text-center">
            <span aria-hidden className="mx-auto block h-[3px] w-10 -translate-y-[calc(50%+1px)] rounded-full bg-marigold" />
            <h2 className="text-balance font-display text-[clamp(22px,3.4vw,34px)] font-extrabold tracking-[-.02em]">
              Why Intern with EduBridge Network?
            </h2>
            <p className="mx-auto mt-3 max-w-[440px] text-[14.5px] leading-relaxed text-muted-foreground sm:text-[15.5px]">
              Whichever track you take, you leave with a verifiable, shareable certificate.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
            {WHY_INTERN.map((s) => (
              <div
                key={s.title}
                className="flex flex-col items-center gap-4 rounded-[22px] border border-border bg-card p-6 text-center shadow-sm"
              >
                <span className={`grid h-[72px] w-[72px] place-items-center rounded-full ${s.tone}`}>
                  <s.icon className="h-7 w-7" />
                </span>
                <p className="font-display text-lg font-extrabold tracking-tight">{s.title}</p>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA — flat solid, matching the homepage's accent language (no gradients) */}
        <section className="mx-auto max-w-4xl rounded-[2rem] bg-primary px-8 py-16 text-center text-primary-foreground">
          <ShieldCheck className="mx-auto h-9 w-9 opacity-90" />
          <h2 className="mx-auto mt-4 max-w-md font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready to start your internship?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-primary-foreground/85">
            Two tracks, one certificate. Pick the path that fits you and get started today.
          </p>
          <Button asChild size="lg" className="mt-6 bg-white text-primary hover:bg-white/90">
            <a href="#tracks">
              Choose your track <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </section>

        {/* FAQ */}
        <section id="faq" className="space-y-4">
          <h2 className="font-display text-2xl font-extrabold tracking-tight">FAQ</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {FAQ.map((f) => (
              <Card key={f.q}>
                <CardContent className="space-y-1 p-5">
                  <p className="font-semibold">{f.q}</p>
                  <p className="text-sm text-muted-foreground">{f.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-6 text-sm text-muted-foreground">
          <span>EduBridge Network — Internship Opportunities</span>
          <Link href="/" className="text-primary hover:underline">
            ← Back to EduBridge Network
          </Link>
        </footer>
      </main>
    </div>
  );
}
