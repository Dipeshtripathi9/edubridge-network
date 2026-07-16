'use client';

import Link from 'next/link';
import { ArrowRight, Building2, ChevronRight, ClipboardList, FileText, IndianRupee, MessageCircle, Users } from 'lucide-react';

// Static line-art illustrations (brand hexes baked in). Rendered as raw SVG so
// we don't hand-convert every attribute to JSX.
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

// Static tool cards — icon + title + description + arrow. "quiz" opens the
// lead-gen quiz modal, "href" navigates. Expert Guide reuses the quiz modal
// too: it's the same counselor-callback flow the hero's "College" button starts.
const TOOL_CARDS = [
  { title: 'Resources', description: 'Guides, notes and career resources.', Icon: FileText, action: { type: 'href' as const, href: '/communities' } },
  { title: 'Expert Guide', description: 'Connect with verified students and experts.', Icon: MessageCircle, action: { type: 'quiz' as const } },
  { title: 'College Quiz', description: 'Take a quiz and get personalized matches.', Icon: ClipboardList, action: { type: 'quiz' as const } },
  { title: 'Compare Colleges', description: 'Compare colleges on fees, placements, reviews & more.', Icon: Building2, action: { type: 'href' as const, href: '/reviews' } },
  { title: 'Communities', description: 'Join college communities and get real insights.', Icon: Users, action: { type: 'href' as const, href: '/communities' } },
];

function ToolCards({ onQuiz }: { onQuiz: () => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {TOOL_CARDS.map(({ title, description, Icon, action }) => {
        const className =
          'group relative flex flex-col gap-4 rounded-[22px] border border-border bg-card p-6 pb-14 text-left shadow-sm transition-shadow hover:shadow-md';
        const content = (
          <>
            <span className="grid h-14 w-14 place-items-center rounded-full bg-accent text-primary">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-display text-[17px] font-extrabold tracking-tight">{title}</h3>
              <p className="mt-1.5 text-[14px] leading-snug text-muted-foreground">{description}</p>
            </div>
            <span className="absolute bottom-4 right-4 grid h-8 w-8 place-items-center rounded-full bg-accent text-foreground transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </>
        );
        return action.type === 'quiz' ? (
          <button key={title} type="button" className={className} onClick={onQuiz}>
            {content}
          </button>
        ) : (
          <Link key={title} href={action.href} className={className}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}

export function HomeTools({ onQuiz }: { onQuiz: () => void }) {
  return (
    <section aria-label="Tools & scholarships" className="mx-auto w-full max-w-[960px]">
      {/* Tool cards */}
      <ToolCards onQuiz={onQuiz} />

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
