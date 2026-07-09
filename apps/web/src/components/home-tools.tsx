'use client';

import Link from 'next/link';
import { ArrowRight, ChevronRight, IndianRupee } from 'lucide-react';

// Static line-art illustrations (brand hexes baked in). Rendered as raw SVG so
// we don't hand-convert every attribute to JSX.
const ILL_QUIZ = `<svg viewBox="0 0 100 84" fill="none" aria-hidden="true" style="width:92px;height:76px">
  <path d="M28 12 h44 a4 4 0 0 1 4 4 v52 a4 4 0 0 1 -4 4 h-44 a4 4 0 0 1 -4 -4 v-52 a4 4 0 0 1 4 -4 z" stroke="#1A1433" stroke-width="2.6"/>
  <path d="M24 22 c-4 1-6 4-5 8" stroke="#1A1433" stroke-width="2.2" stroke-linecap="round"/>
  <text x="36" y="34" font-family="'Hanken Grotesk',sans-serif" font-weight="700" font-size="11" fill="#1A1433">A  B</text>
  <text x="36" y="52" font-family="'Hanken Grotesk',sans-serif" font-weight="700" font-size="11" fill="#1A1433">C  D</text>
  <ellipse cx="40" cy="48.5" rx="8" ry="7.5" stroke="#5A31F4" stroke-width="2.4"/>
  <path d="M34 62 h30" stroke="#1A1433" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M78 20 v6 M75 23 h6" stroke="#5A31F4" stroke-width="2" stroke-linecap="round"/>
</svg>`;

const ILL_COMPARE = `<svg viewBox="0 0 100 84" fill="none" aria-hidden="true" style="width:92px;height:76px">
  <g transform="rotate(-8 38 44)"><rect x="20" y="18" width="34" height="48" rx="5" stroke="#1A1433" stroke-width="2.4" fill="#F6F4EE"/></g>
  <rect x="44" y="16" width="36" height="50" rx="5" stroke="#1A1433" stroke-width="2.6" fill="#FFFFFF"/>
  <path d="M52 32 l10 -7 10 7" stroke="#1A1433" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="59" y="34" width="6" height="8" fill="#5A31F4"/>
  <path d="M52 50 h20 M52 57 h14" stroke="#1A1433" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="80" cy="18" r="8" fill="#5A31F4"/>
  <path d="M76.5 18 l2.5 2.5 4.5-5" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16 70 h10 M20 74 h6" stroke="#1A1433" stroke-width="2" stroke-linecap="round"/>
</svg>`;

const ILL_SCH1 = `<svg viewBox="0 0 120 100" fill="none" aria-hidden="true" style="width:120px;height:100px">
  <rect x="24" y="38" width="72" height="42" rx="3" stroke="#1A1433" stroke-width="2.6"/>
  <path d="M24 38 L60 20 L96 38" stroke="#1A1433" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="60" cy="33" r="5" stroke="#1A1433" stroke-width="2.2"/>
  <path d="M60 30.5 v2.5 l1.8 1.5" stroke="#1A1433" stroke-width="1.8" stroke-linecap="round"/>
  <rect x="33" y="48" width="9" height="9" fill="#EFEAFF" stroke="#1A1433" stroke-width="1.8"/>
  <rect x="55" y="48" width="9" height="9" fill="#EFEAFF" stroke="#1A1433" stroke-width="1.8"/>
  <rect x="77" y="48" width="9" height="9" fill="#EFEAFF" stroke="#1A1433" stroke-width="1.8"/>
  <path d="M55 80 v-12 a5 5 0 0 1 10 0 v12" stroke="#1A1433" stroke-width="2.2"/>
  <line x1="96" y1="38" x2="96" y2="24" stroke="#1A1433" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M96 24 l10 3 -10 3 Z" fill="#F2A31B"/>
  <path d="M16 30 v6 M13 33 h6 M104 66 v6 M101 69 h6" stroke="#1A1433" stroke-width="1.8" stroke-linecap="round"/>
</svg>`;

const ILL_SCH2 = `<svg viewBox="0 0 120 100" fill="none" aria-hidden="true" style="width:120px;height:100px">
  <path d="M30 80 v-30 a30 30 0 0 1 60 0 v30" stroke="#1A1433" stroke-width="2.6"/>
  <path d="M42 80 v-24 a18 18 0 0 1 36 0 v24" fill="#FDF1DA" stroke="#1A1433" stroke-width="2.2"/>
  <path d="M48 80 v-18 a12 12 0 0 1 24 0 v18" fill="#F2A31B" fill-opacity=".55" stroke="#1A1433" stroke-width="2"/>
  <line x1="22" y1="80" x2="98" y2="80" stroke="#1A1433" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M60 14 v-4 M52 17 l-3-3 M68 17 l3-3" stroke="#5A31F4" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

function Ill({ svg, className }: { svg: string; className?: string }) {
  return <span className={className} aria-hidden dangerouslySetInnerHTML={{ __html: svg }} />;
}

const SCHOLARSHIPS = [
  { svg: ILL_SCH1, amount: '₹2,00,000', name: 'Reliance Foundation UG Scholarship' },
  { svg: ILL_SCH2, amount: '₹12,000', name: 'Central Sector Scholarship — Govt of India' },
];

export function HomeTools({ onQuiz }: { onQuiz: () => void }) {
  return (
    <section aria-label="Tools & scholarships" className="mx-auto w-full max-w-[960px]">
      {/* Tool cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-5">
        <button
          onClick={onQuiz}
          className="flex flex-col items-center gap-3 rounded-2xl bg-card px-3.5 py-5 text-center shadow-[0_1px_3px_rgba(26,20,51,.06),0_6px_16px_-8px_rgba(26,20,51,.1)] transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <Ill svg={ILL_QUIZ} />
          <b className="text-[16px] font-bold leading-tight">College Quiz</b>
        </button>
        <Link
          href="/reviews"
          className="flex flex-col items-center gap-3 rounded-2xl bg-card px-3.5 py-5 text-center shadow-[0_1px_3px_rgba(26,20,51,.06),0_6px_16px_-8px_rgba(26,20,51,.1)] transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <Ill svg={ILL_COMPARE} />
          <b className="text-[16px] font-bold leading-tight">Compare Colleges</b>
        </Link>
      </div>

      {/* Scholarships */}
      <div className="mt-6 border-t border-border pt-8">
        <div className="mb-2 flex items-center gap-2.5">
          <IndianRupee className="h-6 w-6" />
          <h2 className="font-display text-[25px] font-extrabold tracking-[-.02em]">Scholarships</h2>
        </div>
        <p className="mb-5 max-w-[520px] text-[15.5px] font-medium text-muted-foreground">
          Search verified scholarships, or get matched to the ones you&apos;re actually eligible for.
        </p>

        <div className="flex snap-x gap-4 overflow-x-auto pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SCHOLARSHIPS.map((s) => (
            <Link key={s.name} href="/opportunities" className="group flex w-[240px] flex-none snap-start flex-col">
              <span className="mb-3 flex h-[140px] items-center justify-center rounded-[10px] border border-border bg-card">
                <Ill svg={s.svg} />
              </span>
              <p className="text-[16px] font-semibold leading-snug">
                <b className="font-extrabold">{s.amount}</b> {s.name}
              </p>
              <span className="mt-2 inline-flex items-center gap-2 text-[15px] font-extrabold">
                Apply Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}

          <Link
            href="/opportunities"
            className="flex w-[240px] flex-none snap-start items-center gap-3 rounded-xl border-[1.6px] border-foreground bg-card px-5 py-5"
          >
            <b className="flex-1 font-display text-[19px] font-extrabold leading-snug tracking-tight">See All Your Scholarship Matches</b>
            <ChevronRight className="h-[18px] w-[18px] flex-none" />
          </Link>
        </div>

        <div className="flex justify-center pt-6">
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2.5 rounded-full border-[1.6px] border-foreground bg-card px-7 py-3.5 text-[16px] font-extrabold transition-colors hover:bg-secondary"
          >
            See All Scholarships <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Brand line (text only, no logo) */}
      <div className="mt-7 border-t border-border pb-2 pt-9 text-center">
        <p className="mx-auto max-w-[520px] font-display text-[18px] leading-relaxed tracking-tight text-foreground">
          <span className="text-[1.2em] font-extrabold">EduBridge Network</span>
          <span className="font-bold">
            {' '}— helping thousands of students find{' '}
            <span className="relative inline-block whitespace-nowrap">
              their fit.
              <svg className="absolute -bottom-1 left-0 h-2 w-full text-marigold" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden>
                <path d="M4 16 C 80 2, 220 2, 296 16" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
              </svg>
            </span>
          </span>
        </p>
      </div>
    </section>
  );
}
