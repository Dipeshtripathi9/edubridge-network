'use client';

import Link from 'next/link';
import { ArrowRight, Award, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrackPicker } from '@/components/internship/track-picker';

const NAV = ['Tracks', 'How it works', 'FAQ'];

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

export default function InternshipLandingPage() {
  return (
    <div className="min-h-screen scroll-smooth bg-gradient-to-b from-background to-accent/20">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
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

      <main className="mx-auto max-w-6xl space-y-16 px-4 py-12 [&_section[id]]:scroll-mt-24">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-marigold/10 px-6 py-14 text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> EduBridge&apos;s own internship program
          </p>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Every path from student to{' '}
            <span className="bg-gradient-to-r from-primary to-marigold bg-clip-text text-transparent">certified</span>,
            ends here.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Two ways in: pay to learn on a live project with a mentor, or apply and let your skills
            earn you real — sometimes paid — work. Both roads lead to a verifiable certificate.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <a href="#tracks">
                Choose your track <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/verify-certificate">Verify a certificate</Link>
            </Button>
          </div>
        </section>

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

        {/* How it works */}
        <section
          id="how-it-works"
          className="space-y-6 rounded-3xl border border-border bg-card px-6 py-12 sm:px-10"
        >
          <div className="mx-auto max-w-xl text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-primary">How it works</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">Same destination, either way</h2>
            <p className="mt-2 text-muted-foreground">
              Whichever track you take, you leave with a verifiable, shareable certificate.
            </p>
          </div>
          <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-3">
            {[
              { icon: GraduationCap, title: 'Pick a track', desc: 'Enroll in Track A or apply for Track B — both need just a signed-in account.' },
              { icon: ShieldCheck, title: 'Do the work', desc: 'Complete milestone tasks with a mentor, or the work/task we allocate you.' },
              { icon: Award, title: 'Get certified', desc: 'A real, verifiable certificate is issued the moment you’re approved.' },
            ].map((s) => (
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
