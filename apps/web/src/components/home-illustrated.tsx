'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Briefcase, Building2, CheckCircle2, GraduationCap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CollegeQuiz } from '@/components/college-quiz';
import { HomeExplainer } from '@/components/home-explainer';
import { HomeAdmissionDesk } from '@/components/home-admission-desk';
import { HomeTools } from '@/components/home-tools';

const QUESTIONS = [
  { tone: 'bg-accent text-primary', q: "What is EduBridge's purpose?", a: 'To help students and parents choose colleges with verified information instead of brochures and rumours — and to stay useful long after admission day.' },
  { tone: 'bg-marigold-soft text-amber-600', q: "What's our vision?", a: 'A network where every Delhi NCR student decides with proof: real seniors, real numbers, real human guidance — free at the exact moment of confusion.' },
];

const TESTIMONIALS = [
  { q: "The brochures confused me. My counselor compared real placement data across 3 colleges. Today I'm at Bennett — zero regrets.", by: 'Aarav S.', ok: 'Verified student, Bennett University' },
  { q: 'He compared fees and placements honestly — and told us which college NOT to pick. That honesty decided it for our family.', by: 'Rekha S. · Parent, Shiv Nadar admit ’25' },
  { q: 'I was set on a “famous” college until a senior’s review showed me the placement math. I switched — best decision I’ve made.', by: '', ok: 'Verified student, Galgotias University' },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-12 text-center font-display text-[clamp(28px,4.2vw,42px)] font-extrabold leading-[1.1] tracking-[-.024em] sm:mb-14">
      {children}
    </h2>
  );
}

export function HomeIllustrated() {
  const [quizOpen, setQuizOpen] = useState(false);
  const openQuiz = () => setQuizOpen(true);

  return (
    <>
      <CollegeQuiz open={quizOpen} onClose={() => setQuizOpen(false)} />
      <div className="space-y-12 sm:space-y-16">
        {/* HERO */}
        <section
          id="get-expert-guidance"
          className="-mx-4 -mt-4 bg-background px-4 pb-6 pt-10 sm:-mx-6 sm:-mt-6 sm:px-8 sm:pt-14"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Photo */}
            <div className="relative order-1 mx-auto w-full max-w-[520px]">
              <span aria-hidden className="pointer-events-none absolute -left-3 -top-3 grid grid-cols-4 gap-1.5 text-primary/30">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-current" />
                ))}
              </span>
              <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-accent to-marigold-soft px-6 pt-8 sm:px-10">
                <img
                  src="/hero-students-group.webp"
                  alt="Four students collaborating on a laptop"
                  className="mx-auto w-full max-w-[460px] object-contain"
                />
              </div>
            </div>

            {/* Text */}
            <div className="order-2 text-center lg:text-left">
              <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-[13px] font-bold uppercase tracking-[.25em] text-primary">
                India&rsquo;s Student
              </span>
              <h1 className="mt-4 font-display text-[clamp(32px,6vw,64px)] font-extrabold uppercase leading-[1.1] tracking-[-.02em]">
                Success Network
              </h1>
              <p className="mx-auto mt-5 max-w-[520px] text-[17px] leading-relaxed text-muted-foreground lg:mx-0">
                Find the right college, discover scholarships and internships, and get guidance from verified students and trusted experts.
              </p>
              <p className="mt-8 text-[14px] font-semibold uppercase tracking-[.25em]">Start your search</p>
              <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
                <Button className="w-[70vw] max-w-[220px] gap-2 sm:w-auto" onClick={openQuiz}>
                  <Building2 className="h-4 w-4" /> Find College
                </Button>
                <Button asChild className="w-[70vw] max-w-[220px] gap-2 sm:w-auto">
                  <Link href="/opportunities">
                    <GraduationCap className="h-4 w-4" /> Explore Scholarship
                  </Link>
                </Button>
                <Button asChild className="w-[70vw] max-w-[220px] gap-2 sm:w-auto">
                  <Link href="/opportunities">
                    <Briefcase className="h-4 w-4" /> Find Internship
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* TOOLS + SCHOLARSHIPS */}
        <HomeTools onQuiz={openQuiz} />

        {/* EXPLAINER */}
        <HomeExplainer />

        {/* DIRECT ADMISSION DESK */}
        <HomeAdmissionDesk onApply={openQuiz} />

        {/* STUDENTS FIRST */}
        <section>
          <SectionTitle>Students first. Always.</SectionTitle>
          <div className="grid gap-6 md:grid-cols-3">
            {QUESTIONS.map((c) => (
              <article key={c.q} className="flex flex-col items-start gap-4 rounded-[22px] border border-border bg-card p-8 shadow-sm">
                <span className={`grid h-[84px] w-[84px] self-center place-items-center rounded-full ${c.tone}`}>
                  <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                </span>
                <h3 className="font-display text-[22px] font-extrabold tracking-tight">{c.q}</h3>
                <p className="text-[15.5px] text-muted-foreground">{c.a}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Button asChild size="lg">
              <Link href="/communities">Join the community</Link>
            </Button>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section>
          <SectionTitle>Loved by students and parents</SectionTitle>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <article key={i} className="flex flex-col gap-5 rounded-[22px] border border-border bg-card p-8 shadow-sm">
                <span aria-hidden className="font-display text-5xl font-extrabold leading-[.5] text-primary">“</span>
                <p className="flex-1 text-[17px] font-medium leading-relaxed text-foreground">{t.q}</p>
                <div className="text-sm font-bold text-muted-foreground">
                  {t.by && <>— {t.by} · </>}
                  {t.ok && (
                    <span className="inline-flex items-center gap-1.5 text-green">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {t.ok}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="rounded-[28px] border border-border bg-background p-8 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-6 border-b border-border pb-7">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="font-display text-lg font-extrabold tracking-tight">EduBridge Network</span>
            </div>
            <nav className="flex flex-nowrap items-center gap-x-5 overflow-x-auto whitespace-nowrap text-[14px] font-semibold text-muted-foreground [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <Link href="/reviews" className="hover:text-primary">Colleges</Link>
              <Link href="/communities" className="hover:text-primary">Communities</Link>
              <Link href="/opportunities" className="hover:text-primary">Opportunities</Link>
              <Link href="/about" className="hover:text-primary">About</Link>
            </nav>
          </div>
          <div className="flex flex-wrap justify-between gap-3 pt-6 text-[13.5px] font-semibold text-muted-foreground">
            <span>© 2026 EduBridge Network. All rights reserved.</span>
            <span>Made in India</span>
          </div>
        </footer>
      </div>
    </>
  );
}
