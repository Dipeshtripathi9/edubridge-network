'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
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
          className="-mx-4 -mt-4 bg-background px-4 py-16 text-center sm:-mx-6 sm:-mt-6 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-[840px]">
            <p className="text-[15px] font-semibold uppercase tracking-[.3em] text-primary">India&rsquo;s Student</p>
            <h1 className="mt-2 font-display text-[clamp(32px,8vw,84px)] font-extrabold uppercase leading-[1.1] tracking-[-.02em]">
              Success Network
            </h1>
            <svg className="mx-auto mb-8 mt-6 h-5 w-[150px]" viewBox="0 0 150 20" fill="none" aria-hidden>
              <path
                d="M2 12 C 14 2, 26 2, 38 12 C 50 22, 62 22, 74 12 C 86 2, 98 2, 110 12 C 118 18, 130 18, 148 8"
                stroke="hsl(var(--marigold))"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <p className="mx-auto max-w-[600px] text-[19px] leading-relaxed text-muted-foreground">
              Find the right college, discover scholarships and internships, and get guidance from verified students and trusted experts.
            </p>
            <p className="mt-10 text-[15px] font-semibold uppercase tracking-[.25em]">Start your search</p>
            <div className="mx-auto mt-4 flex max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4">
              <Button className="w-full sm:w-[150px] md:w-[170px]" onClick={openQuiz}>
                College
              </Button>
              <Button asChild className="w-full sm:w-[150px] md:w-[170px]">
                <Link href="/opportunities">Scholarship</Link>
              </Button>
              <Button asChild className="w-full sm:w-[150px] md:w-[170px]">
                <Link href="/opportunities">Internship</Link>
              </Button>
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
