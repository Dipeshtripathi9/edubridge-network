'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Phone, Search, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MotionProvider } from '@/components/motion';
import { GuidanceForm } from '@/components/expert-guidance';

/* Map the pasted design's palette vars onto the app's brand tokens so the
   hand-drawn SVGs render in the violet brand. Longer names first. */
function mapColors(svg: string) {
  return svg
    .replaceAll('var(--primary-soft)', 'hsl(var(--accent))')
    .replaceAll('var(--primary-dark)', 'hsl(var(--primary))')
    .replaceAll('var(--primary)', 'hsl(var(--primary))')
    .replaceAll('var(--accent-soft)', 'hsl(var(--marigold-soft))')
    .replaceAll('var(--accent-ink-2)', '#6B4A05')
    .replaceAll('var(--accent-ink)', '#C77E06')
    .replaceAll('var(--accent)', 'hsl(var(--marigold))')
    .replaceAll('var(--green-soft)', 'hsl(var(--green-soft))')
    .replaceAll('var(--green)', 'hsl(var(--green))')
    .replaceAll('var(--ink-2)', 'hsl(var(--muted-foreground))')
    .replaceAll('var(--ink-3)', 'hsl(var(--muted-foreground))')
    .replaceAll('var(--ink)', 'hsl(var(--foreground))')
    .replaceAll('var(--hill)', 'hsl(var(--secondary))')
    .replaceAll('var(--paper)', 'hsl(var(--background))')
    .replaceAll('var(--white)', '#ffffff');
}

function Illo({ svg, className, label }: { svg: string; className?: string; label: string }) {
  return (
    <div
      className={className}
      role="img"
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: mapColors(svg) }}
    />
  );
}

const BRIDGE = `<svg viewBox="0 0 520 400" fill="none" style="width:100%;height:auto;display:block">
  <circle cx="88" cy="66" r="26" stroke="var(--accent)" stroke-width="5"/>
  <path d="M300 340 C 300 220, 380 160, 470 160 C 512 160, 520 200, 520 250 L 520 340 Z" fill="var(--primary-soft)"/>
  <path d="M0 340 C 10 260, 90 230, 170 236 C 230 240, 250 290, 252 340 Z" fill="var(--hill)"/>
  <line x1="452" y1="160" x2="452" y2="96" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/>
  <path d="M452 96 L 500 110 L 452 124 Z" fill="var(--primary)"/>
  <path d="M96 268 C 190 130, 330 130, 440 190" stroke="var(--accent)" stroke-width="9" stroke-linecap="round"/>
  <circle cx="96" cy="268" r="11" fill="var(--ink)"/>
  <circle cx="258" cy="165" r="8" fill="var(--primary)"/>
  <circle cx="440" cy="190" r="12" fill="var(--paper)" stroke="var(--ink)" stroke-width="6"/>
  <g transform="translate(238 96)">
    <path d="M0 18 L 26 6 L 52 18 L 26 30 Z" fill="var(--ink)"/>
    <path d="M12 24 v 12 c 6 7 22 7 28 0 v -12" stroke="var(--ink)" stroke-width="5" fill="none" stroke-linecap="round"/>
    <line x1="52" y1="18" x2="52" y2="34" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/>
    <circle cx="52" cy="38" r="4" fill="var(--accent)"/>
  </g>
  <path d="M56 336 c 0 -18 -10 -26 -18 -30 M56 336 c 0 -14 10 -22 16 -24" stroke="var(--green)" stroke-width="5" stroke-linecap="round"/>
  <path d="M300 336 c 0 -14 -8 -20 -14 -23 M300 336 c 0 -11 8 -17 13 -19" stroke="var(--green)" stroke-width="5" stroke-linecap="round"/>
  <line x1="16" y1="340" x2="504" y2="340" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/>
</svg>`;

const ILLO_QUIZ = `<svg viewBox="0 0 320 210" fill="none" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%">
  <ellipse cx="160" cy="120" rx="122" ry="76" fill="var(--primary-soft)"/>
  <path d="M52 62 v16 M44 70 h16" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/>
  <path d="M270 148 v12 M264 154 h12" stroke="var(--primary)" stroke-width="4" stroke-linecap="round"/>
  <rect x="114" y="26" width="92" height="158" rx="18" fill="var(--white)" stroke="var(--ink)" stroke-width="6"/>
  <rect x="130" y="46" width="60" height="8" rx="4" fill="var(--hill)"/>
  <rect x="130" y="46" width="38" height="8" rx="4" fill="var(--accent)"/>
  <rect x="130" y="64" width="46" height="7" rx="3.5" fill="var(--ink-3)"/>
  <rect x="130" y="82" width="60" height="18" rx="9" fill="var(--hill)"/>
  <rect x="130" y="106" width="60" height="18" rx="9" fill="var(--primary)"/>
  <path d="M172 115 l5 5 8-9" stroke="var(--white)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="130" y="130" width="60" height="18" rx="9" fill="var(--hill)"/>
  <rect x="130" y="154" width="60" height="18" rx="9" fill="var(--hill)"/>
  <circle cx="232" cy="56" r="24" fill="var(--accent)"/>
  <text x="232" y="66" text-anchor="middle" font-family="'Bricolage Grotesque',sans-serif" font-weight="800" font-size="28" fill="var(--ink)">3</text>
  <circle cx="86" cy="152" r="17" fill="var(--green)"/>
  <path d="M78 152 l6 6 10-11" stroke="var(--white)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const ILLO_CALL = `<svg viewBox="0 0 320 210" fill="none" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%">
  <ellipse cx="160" cy="122" rx="122" ry="74" fill="var(--accent-soft)"/>
  <path d="M104 190 c 0 -42 112 -42 112 0 Z" fill="var(--primary)"/>
  <circle cx="160" cy="116" r="32" fill="var(--white)" stroke="var(--ink)" stroke-width="6"/>
  <path d="M128 112 a 32 32 0 0 1 64 0" stroke="var(--ink)" stroke-width="6" fill="none" stroke-linecap="round"/>
  <rect x="119" y="104" width="12" height="26" rx="6" fill="var(--ink)"/>
  <rect x="189" y="104" width="12" height="26" rx="6" fill="var(--ink)"/>
  <path d="M195 128 q 5 18 -16 22" stroke="var(--ink)" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="177" cy="151" r="5.5" fill="var(--accent)"/>
  <circle cx="196" cy="92" r="9" fill="var(--green)" stroke="var(--white)" stroke-width="4"/>
  <rect x="222" y="52" width="62" height="42" rx="13" fill="var(--white)" stroke="var(--ink)" stroke-width="5"/>
  <path d="M236 94 l-8 14 20 -12" fill="var(--white)" stroke="var(--ink)" stroke-width="5" stroke-linejoin="round"/>
  <path d="M240 73 l7 7 14-15" stroke="var(--green)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="64" cy="68" r="20" fill="var(--white)" stroke="var(--ink)" stroke-width="5"/>
  <text x="64" y="77" text-anchor="middle" font-family="'Bricolage Grotesque',sans-serif" font-weight="800" font-size="24" fill="var(--primary)">?</text>
</svg>`;

const ILLO_CAMPUS = `<svg viewBox="0 0 320 210" fill="none" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%">
  <ellipse cx="164" cy="130" rx="126" ry="70" fill="var(--hill)"/>
  <path d="M96 112 L164 74 L232 112 Z" fill="var(--primary-soft)" stroke="var(--ink)" stroke-width="6" stroke-linejoin="round"/>
  <rect x="104" y="112" width="120" height="78" rx="6" fill="var(--white)" stroke="var(--ink)" stroke-width="6"/>
  <rect x="118" y="128" width="12" height="62" fill="var(--hill)"/>
  <rect x="198" y="128" width="12" height="62" fill="var(--hill)"/>
  <path d="M152 190 v-30 a12 12 0 0 1 24 0 v30 Z" fill="var(--primary)"/>
  <line x1="164" y1="74" x2="164" y2="46" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/>
  <path d="M164 46 l 26 8 -26 8 Z" fill="var(--accent)"/>
  <path d="M42 188 C 88 166, 120 184, 150 178" stroke="var(--accent)" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 14"/>
  <path d="M256 82 l6 12 13 2 -9 9 2 13 -12 -6 -12 6 2 -13 -9 -9 13 -2 Z" fill="var(--accent)"/>
  <g transform="translate(50 52)">
    <path d="M14 0 C 26 9 26 27 14 42 C 2 27 2 9 14 0 Z" fill="var(--primary)" stroke="var(--ink)" stroke-width="4"/>
    <circle cx="14" cy="16" r="5" fill="var(--white)"/>
    <path d="M10 45 q 4 10 8 0" stroke="var(--accent)" stroke-width="4" fill="none" stroke-linecap="round"/>
  </g>
  <line x1="40" y1="190" x2="284" y2="190" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/>
</svg>`;

const ARC = (
  <svg className="absolute -bottom-2 left-0 h-3 w-full text-marigold" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden>
    <path d="M4 16 C 80 2, 220 2, 296 16" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
  </svg>
);

const TRUST = ['Verified students', 'Real college data', 'Free 1:1 human experts'];

const WHY = [
  { num: '70+', body: 'verified colleges across Delhi NCR — a college is listed only when real students inside it verify the data.', cta: 'Explore colleges', href: '/reviews' },
  { num: '200+', body: 'verified students reporting placements, fees, hostel truth and campus life — from inside the campus, not the brochure.', cta: 'How verification works', href: '/verify' },
  { num: '₹12L', body: 'average package data, branch-wise — with the lows and the highs published side by side, never hidden.', cta: 'See real numbers', href: '/reviews' },
];

const POPULAR = [
  { svg: ILLO_QUIZ, title: 'Find your 3 colleges', body: 'A 60-second quiz narrows 70+ colleges down to the 3 that fit your marks, budget and goals.', cta: 'Take the quiz', form: true },
  { svg: ILLO_CALL, title: 'Talk to a real expert', body: 'A free 5-minute call with a human counselor — course, college, scholarships, and one concrete next step.', cta: 'Book free call', form: true },
  { svg: ILLO_CAMPUS, title: 'After-admission support', body: 'Scholarships, internships, communities and startup backing — for the next four years, not just admission day.', cta: 'Explore the network', href: '/communities' },
];

const FRAME_ROWS = [
  { name: 'Bennett University', verified: 47, w: '92%', meta: 'Placement rate 92% · Avg ₹8.2 L' },
  { name: 'Shiv Nadar University', verified: 48, w: '94%', meta: 'Placement rate 94% · Avg ₹11.8 L' },
  { name: 'Galgotias University', verified: 39, w: '88%', meta: 'Placement rate 88% · Avg ₹5.2 L' },
];

const CHECKS = [
  '1:1 expert guidance — call or chat',
  'Verified data on 70+ colleges',
  'Scholarships, internships & communities',
  'Reports you can share with parents',
];

const QUESTIONS = [
  { tone: 'bg-accent text-primary', q: "What is EduBridge's purpose?", a: 'To help students and parents choose colleges with verified information instead of brochures and rumours — and to stay useful long after admission day.' },
  { tone: 'bg-marigold-soft text-amber-600', q: "What's our vision?", a: 'A network where every Delhi NCR student decides with proof: real seniors, real numbers, real human guidance — free at the exact moment of confusion.' },
  { tone: 'bg-green-soft text-green', q: 'Why only 70+ colleges?', a: 'Because a college gets listed only when verified students inside it report the data. No verification, no listing — even if that keeps our number smaller.' },
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
  const [open, setOpen] = useState(false);
  const openForm = () => {
    setOpen(true);
    document.getElementById('get-expert-guidance')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <MotionProvider>
      <div className="space-y-16 sm:space-y-24">
        {/* HERO */}
        <section
          id="get-expert-guidance"
          className="rounded-[28px] border border-border bg-card p-6 shadow-sm sm:p-9 lg:p-12"
        >
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 text-[12.5px] font-bold text-primary">
                <ShieldCheck className="h-3.5 w-3.5" /> 70+ verified colleges · Delhi NCR
              </span>
              <h1 className="font-display text-[clamp(32px,5.4vw,56px)] font-extrabold leading-[1.06] tracking-[-.028em]">
                College choice,<br />
                minus{' '}
                <span className="relative inline-block whitespace-nowrap text-primary">
                  the guesswork.{ARC}
                </span>
              </h1>
              <p className="mt-6 max-w-[520px] text-[17.5px] text-muted-foreground">
                Verified student data, real placement numbers and <b className="font-bold text-foreground">1:1 human experts</b> for 70+ Delhi NCR colleges — free for students and parents.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                {!open && (
                  <Button size="lg" onClick={() => setOpen(true)}>
                    <Phone className="h-4 w-4" /> Get started
                  </Button>
                )}
                <Button asChild size="lg" variant="outline">
                  <Link href="/reviews">Explore colleges</Link>
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                {TRUST.map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                    <CheckCircle2 className="h-[17px] w-[17px] text-green" /> {t}
                  </span>
                ))}
              </div>
              {open && <GuidanceForm onDone={() => setOpen(false)} />}
            </div>
            <div className="rounded-3xl bg-background p-6 sm:p-8">
              <Illo svg={BRIDGE} className="mx-auto w-full max-w-[440px] [&_svg]:h-auto [&_svg]:w-full" label="Illustration of a bridge leading to the right college" />
            </div>
          </div>
        </section>

        {/* ANNOUNCEMENT */}
        <section className="flex flex-wrap items-center gap-6 rounded-[22px] border-l-[5px] border-marigold bg-marigold-soft px-6 py-7 sm:px-8">
          <span className="grid h-14 w-14 flex-none place-items-center rounded-2xl bg-card text-amber-600">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
          </span>
          <div className="min-w-[240px] flex-1">
            <h3 className="font-display text-xl font-extrabold tracking-tight">Find the colleges that fit you</h3>
            <p className="mt-1 text-sm font-medium text-[#6B4A05]">Answer a few questions and preview your top match in 60 seconds — verified by a real counselor on a free call.</p>
          </div>
          <Button className="bg-foreground text-background hover:bg-foreground/90" onClick={openForm}>Start the quiz</Button>
        </section>

        {/* WHY */}
        <section>
          <SectionTitle>Why EduBridge?</SectionTitle>
          <div className="grid gap-6 md:grid-cols-3">
            {WHY.map((c) => (
              <article key={c.num} className="flex flex-col items-start gap-4 rounded-[22px] border border-border bg-card p-8 shadow-sm">
                <span className="font-display text-[clamp(38px,4.6vw,52px)] font-extrabold leading-none tracking-tight text-primary">{c.num}</span>
                <p className="flex-1 text-[15.5px] text-muted-foreground">{c.body}</p>
                <Button asChild variant="outline" size="sm">
                  <Link href={c.href}>{c.cta}</Link>
                </Button>
              </article>
            ))}
          </div>
        </section>

        {/* POPULAR */}
        <section>
          <SectionTitle>Popular on EduBridge</SectionTitle>
          <div className="grid gap-6 md:grid-cols-3">
            {POPULAR.map((c) => (
              <article key={c.title} className="flex flex-col items-start gap-4 rounded-[22px] border border-border bg-card p-6 shadow-sm">
                <Illo svg={c.svg} className="h-[190px] w-full overflow-hidden rounded-2xl bg-background" label={c.title} />
                <h3 className="font-display text-[21px] font-extrabold tracking-tight">{c.title}</h3>
                <p className="flex-1 text-[15px] text-muted-foreground">{c.body}</p>
                {c.form ? (
                  <Button variant="outline" size="sm" onClick={openForm}>{c.cta}</Button>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href={c.href!}>{c.cta}</Link>
                  </Button>
                )}
              </article>
            ))}
          </div>
        </section>

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

        {/* PLANNING */}
        <section className="grid items-center gap-12 rounded-[28px] border border-border bg-card p-6 shadow-sm sm:p-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="font-display text-[clamp(28px,4vw,40px)] font-extrabold leading-[1.14] tracking-[-.024em]">
              Free college planning &amp; guidance for students and parents
            </h2>
            <div className="my-9 flex flex-col gap-5">
              {CHECKS.map((t) => (
                <div key={t} className="flex items-center gap-3.5 text-[17px] font-bold">
                  <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-full bg-green-soft text-green">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  {t}
                </div>
              ))}
            </div>
            <Button size="lg" onClick={openForm}>Get started now</Button>
          </div>

          {/* Insights frame */}
          <div className="mx-auto w-full max-w-[460px] rounded-[30px] border-[9px] border-foreground bg-card p-5 shadow-lg">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-primary">
                <svg className="h-4 w-4" viewBox="0 0 44 44" fill="none" aria-hidden><path d="M9 30 C 15 15, 29 15, 35 30" stroke="hsl(var(--marigold))" strokeWidth="3.4" strokeLinecap="round" fill="none" /><circle cx="9" cy="30" r="3.4" fill="#fff" /><circle cx="35" cy="30" r="3.4" fill="#fff" /></svg>
              </span>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => <i key={i} className="block h-2 w-12 rounded-full bg-secondary" />)}
              </div>
            </div>
            <div className="mb-3.5 flex items-center gap-2 rounded-xl bg-background px-3.5 py-2.5 text-[13px] font-semibold text-muted-foreground">
              <Search className="h-3.5 w-3.5" /> Search 70+ verified colleges…
            </div>
            {FRAME_ROWS.map((r) => (
              <div key={r.name} className="mb-2.5 rounded-2xl bg-card p-4 shadow-[0_1px_3px_rgba(20,30,60,.06),0_8px_20px_-12px_rgba(20,30,60,.15)] last:mb-0">
                <div className="mb-2 flex items-center justify-between">
                  <b className="font-display text-[14.5px] tracking-tight">{r.name}</b>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-soft px-2 py-1 text-[10.5px] font-extrabold text-green">
                    <CheckCircle2 className="h-2.5 w-2.5" /> {r.verified} verified
                  </span>
                </div>
                <div className="h-[7px] overflow-hidden rounded-full bg-secondary">
                  <i className="block h-full rounded-full bg-primary" style={{ width: r.w }} />
                </div>
                <small className="mt-2 block text-[11px] font-semibold text-muted-foreground">{r.meta}</small>
              </div>
            ))}
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
            <nav className="flex flex-wrap gap-x-7 gap-y-2 text-[14.5px] font-semibold text-muted-foreground">
              <Link href="/reviews" className="hover:text-primary">Colleges</Link>
              <Link href="/communities" className="hover:text-primary">Communities</Link>
              <Link href="/opportunities" className="hover:text-primary">Opportunities</Link>
              <Link href="/startups" className="hover:text-primary">Startups</Link>
              <Link href="/about" className="hover:text-primary">About</Link>
            </nav>
          </div>
          <div className="flex flex-wrap justify-between gap-3 pt-6 text-[13.5px] font-semibold text-muted-foreground">
            <span>© 2026 EduBridge Network. All rights reserved.</span>
            <span>Made with ♥ in Delhi NCR</span>
          </div>
        </footer>
      </div>
    </MotionProvider>
  );
}
