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
  Sparkles,
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
  { icon: Briefcase, title: 'Real-World Experience', desc: 'Work on live projects, not busywork.' },
  { icon: UserCheck, title: 'Expert Guidance', desc: 'Mentor feedback on every task you submit.' },
  { icon: TrendingUp, title: 'Skill Development', desc: 'Structured tasks that build real ability.' },
  { icon: ShieldCheck, title: 'Verified Certification', desc: 'A certificate anyone can verify online.' },
  { icon: Award, title: 'Career Growth', desc: 'A credential that stands out on your profile.' },
  { icon: Network, title: 'Networking Opportunities', desc: 'Connect with mentors, startups & partners.' },
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
    <div className="min-h-screen scroll-smooth bg-gradient-to-b from-background to-accent/20">
      {/* Nav */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight text-white">EduBridge Network</p>
              <p className="text-xs font-semibold text-white/75">Internship Opportunities</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-white/80 md:flex">
            {NAV.map((n) => (
              <a key={n} href={`#${n.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-white">
                {n}
              </a>
            ))}
          </nav>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          >
            <Link href="/internship/dashboard">Sign in</Link>
          </Button>
        </div>
      </header>

      {/* Hero — full-bleed tan panel, bold serif headline, outlined tag pills */}
      <section className="w-screen bg-marigold-soft" style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-marigold">
            <Sparkles className="h-3.5 w-3.5" /> EduBridge&apos;s own internship program
          </p>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
            Every path from student to <span className="text-primary">certified</span>, ends here.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Two ways in: pay to learn on a live project with a mentor, or apply and let your skills
            earn you real — sometimes paid — work. Both roads lead to a verifiable certificate.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {HERO_TAGS.map((t) => (
              <a
                key={t.label}
                href={t.href}
                className="rounded-full border border-primary/50 px-4 py-1.5 text-sm font-semibold text-primary hover:bg-primary/10"
              >
                {t.label}
              </a>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <a href="#tracks">
                Choose your track <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/verify-certificate">Verify a certificate</Link>
            </Button>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-16 px-4 py-12 [&_section[id]]:scroll-mt-24">
        {/* Tracks */}
        <section id="tracks" className="space-y-4">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-primary">Choose your track</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">Two ways to earn your certificate</h2>
            <p className="mt-2 text-muted-foreground">
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
        <section
          id="why-intern"
          className="space-y-6 rounded-3xl border border-border bg-card px-6 py-12 sm:px-10"
        >
          <div className="mx-auto max-w-xl text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-primary">Why intern with us</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
              Why Intern with EduBridge Network?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Whichever track you take, you leave with a verifiable, shareable certificate.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-3">
            {WHY_INTERN.map((s) => (
              <div key={s.title} className="rounded-2xl border border-border bg-background p-5 text-center">
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary">
                  <s.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 font-semibold">{s.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission statement */}
        <section className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 text-center sm:justify-center">
          <ShieldCheck className="h-5 w-5 flex-none text-primary" />
          <p className="text-[14.5px] font-medium text-foreground/90">
            At EduBridge Network, our mission is to give every student real skills, hands-on
            experience, and the right guidance for their future.
          </p>
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
