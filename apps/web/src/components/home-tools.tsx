'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bookmark, Briefcase, ChevronLeft, ChevronRight, Compass, GraduationCap, Heart, IndianRupee } from 'lucide-react';
import { HomeAdmissionDesk } from '@/components/home-admission-desk';
import { Button } from '@/components/ui/button';
import { useBlogPosts, type BlogCategory, type BlogListItem } from '@/hooks/use-blog';
import { useCollege } from '@/hooks/use-colleges';
import { useCollegeShortlist } from '@/hooks/use-college-shortlist';
import { useCollegeApplied } from '@/hooks/use-college-applied';

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

// "College Guidance & Resources" — a horizontal strip of real published blog
// posts (falls back to a couple of generic entries before any posts exist),
// mirroring the Scholarships/Internships teaser strips above it.
const RESOURCE_CATEGORY_STYLE: Record<BlogCategory, { label: string; bg: string; text: string }> = {
  CAREER: { label: 'Career', bg: 'bg-[#FBEAD9]', text: 'text-[#A85F35]' },
  COLLEGE: { label: 'College', bg: 'bg-[#E3EBF5]', text: 'text-[#3A5A8C]' },
  JOB: { label: 'Job', bg: 'bg-[#DCEDE2]', text: 'text-[#2E6B4F]' },
};

const FALLBACK_RESOURCES: BlogListItem[] = [
  { slug: '', title: 'The ultimate college application timeline', category: 'COLLEGE', readMinutes: 6, author: null },
  { slug: '', title: 'What a startup internship actually looks like', category: 'JOB', readMinutes: 5, author: null },
];

function ResourceCard({ post }: { post: BlogListItem }) {
  const tag = RESOURCE_CATEGORY_STYLE[post.category];
  return (
    <Link
      href={post.slug ? `/blog/${post.slug}` : '/blog'}
      className="group flex w-[240px] flex-none snap-start flex-col"
    >
      <span className={`relative mb-3 flex h-[140px] items-center justify-center rounded-[10px] border border-border ${tag.bg}`}>
        <span className={`rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${tag.text}`}>
          {tag.label}
        </span>
      </span>
      <p className="line-clamp-2 text-[16px] font-semibold leading-snug">{post.title}</p>
      <p className="mt-1.5 text-[13px] text-muted-foreground">{post.readMinutes} min read</p>
    </Link>
  );
}

function ResourcesStrip() {
  const { data, isLoading } = useBlogPosts(8);
  const posts = data?.data && data.data.length > 0 ? data.data : FALLBACK_RESOURCES;

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden pb-1.5">
        <div className="h-[192px] w-[240px] flex-none animate-pulse rounded-[10px] bg-secondary" />
        <div className="h-[192px] w-[240px] flex-none animate-pulse rounded-[10px] bg-secondary" />
      </div>
    );
  }

  return (
    <div className="flex snap-x gap-4 overflow-x-auto pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {posts.map((p, i) => (
        <ResourceCard key={p.slug || i} post={p} />
      ))}
    </div>
  );
}

// "My Shortlist" — colleges the student has already saved, shown between the
// Admission Desk and Scholarships so it reads as "here's what you've already
// picked" before the browse-more sections. Hidden entirely when empty.
function MyShortlistCard({ slug }: { slug: string }) {
  const { data: college, isLoading } = useCollege(slug);
  const { toggle } = useCollegeShortlist();
  const { isApplied, markApplied } = useCollegeApplied();

  if (isLoading) return <div className="h-[236px] w-full animate-pulse rounded-[20px] bg-secondary" />;
  if (!college) return null;
  const applied = isApplied(college.slug);

  return (
    <div className="overflow-hidden rounded-[20px] border border-border bg-card">
      <div className="relative h-[140px] w-full bg-secondary">
        {college.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={college.coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <GraduationCap className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        <button
          type="button"
          onClick={() => toggle(college.slug)}
          aria-label={`Remove ${college.name} from shortlist`}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#1C4736] shadow-sm transition-transform hover:scale-105"
        >
          <Heart className="h-4 w-4 fill-current" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="m-0 mb-1 truncate font-fraunces text-[17px] font-semibold leading-tight">
          <Link href={`/colleges/${college.slug}`} className="hover:underline">
            {college.name}
          </Link>
        </h3>
        {(college.city || college.state) && (
          <p className="m-0 mb-3 text-[13px] text-muted-foreground">
            {[college.city, college.state].filter(Boolean).join(', ')}
          </p>
        )}
        <div className="border-t border-border pt-3">
          <p className="m-0 mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70">Up next</p>
          <button
            type="button"
            disabled={applied}
            onClick={() => markApplied(college.slug)}
            className={`flex items-center gap-1 bg-transparent p-0 font-sans text-[15px] font-bold ${
              applied ? 'cursor-default text-[#1C4736]' : 'cursor-pointer text-foreground'
            }`}
          >
            {applied ? (
              '✓ Applied'
            ) : (
              <>
                Apply <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function MyShortlist() {
  const { slugs } = useCollegeShortlist();
  if (slugs.length === 0) return null;

  return (
    <div className="mt-6 border-t border-border pt-8">
      <div className="mb-2 flex items-center gap-2.5">
        <Bookmark className="h-6 w-6" />
        <h2 className="font-display text-[25px] font-extrabold tracking-[-.02em]">My Shortlist</h2>
      </div>
      <p className="mb-5 max-w-[520px] text-[15.5px] font-medium text-muted-foreground">
        Colleges you&apos;ve saved to track and compare.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slugs.slice(0, 3).map((slug) => (
          <MyShortlistCard key={slug} slug={slug} />
        ))}
      </div>
      <div className="mt-6 text-center">
        <Button
          variant="outline"
          className="gap-1.5 rounded-full border-[#1C4736] px-6 text-[#1C4736] hover:bg-[#E7F1EB] hover:text-[#1C4736]"
          asChild
        >
          <Link href="/colleges/recommended?tab=shortlist">
            See more recommendations <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

const SCHOLARSHIPS = [
  { svg: ILL_SCH1, amount: '₹2,00,000', name: 'Reliance Foundation UG Scholarship' },
  { svg: ILL_SCH2, amount: '₹12,000', name: 'Central Sector Scholarship: Govt of India' },
];

const ILL_INTERN1 = `<svg viewBox="0 0 120 100" fill="none" aria-hidden="true" style="width:120px;height:100px">
  <rect x="30" y="42" width="60" height="38" rx="4" stroke="#1A1433" stroke-width="2.6"/>
  <rect x="38" y="50" width="44" height="22" fill="#EFEAFF"/>
  <path d="M60 20 L82 30 L60 40 L38 30 Z" fill="#1A1433"/>
  <path d="M38 30 v10" stroke="#1A1433" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="38" cy="42" r="2.6" fill="#F2A31B"/>
  <line x1="40" y1="88" x2="80" y2="88" stroke="#1A1433" stroke-width="2.6" stroke-linecap="round"/>
  <line x1="60" y1="80" x2="60" y2="88" stroke="#1A1433" stroke-width="2.6" stroke-linecap="round"/>
</svg>`;

const ILL_INTERN2 = `<svg viewBox="0 0 120 100" fill="none" aria-hidden="true" style="width:120px;height:100px">
  <rect x="28" y="42" width="64" height="40" rx="6" stroke="#1A1433" stroke-width="2.6"/>
  <path d="M46 42 v-8 a6 6 0 0 1 6 -6 h16 a6 6 0 0 1 6 6 v8" stroke="#1A1433" stroke-width="2.6"/>
  <line x1="28" y1="58" x2="92" y2="58" stroke="#1A1433" stroke-width="2.2"/>
  <circle cx="94" cy="34" r="12" fill="#F2A31B"/>
  <path d="M89 34 l3.5 3.5 L99 30" stroke="#1A1433" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const INTERNSHIPS = [
  { svg: ILL_INTERN1, hook: '₹2,999', name: 'Track A: Learn & Build with a mentor' },
  { svg: ILL_INTERN2, hook: 'Free to apply', name: 'Track B: Apply & Get Selected' },
];

// Fanned poster carousel — each poster is a card (background + icon image +
// title baked in as SVG text). The icon area is a real photo/illustration
// asset (image href) rather than hand-drawn vector art, so swapping the icon
// is just swapping the referenced file — the card chrome, circle-crop math
// PosterRow relies on (cx=240,cy=230,r=168), and baked title stay identical.
const POSTER_QUIZ = `<svg viewBox="0 0 480 600" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="440" height="440" rx="48" fill="#F4F1EA"/>
  <defs><clipPath id="clip-quiz"><circle cx="240" cy="230" r="168"/></clipPath></defs>
  <image href="/poster-quiz.jpg" x="72" y="62" width="336" height="336" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-quiz)"/>
  <text x="240" y="492" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="#1B1633" class="poster-title">College Quiz</text>
</svg>`;

const POSTER_COMPARE = `<svg viewBox="0 0 480 600" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="440" height="440" rx="48" fill="#F4F1EA"/>
  <defs><clipPath id="clip-compare"><circle cx="240" cy="230" r="168"/></clipPath></defs>
  <image href="/poster-compare.jpg" x="72" y="62" width="336" height="336" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-compare)"/>
  <text x="240" y="492" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="800" fill="#1B1633" class="poster-title">Compare Colleges</text>
</svg>`;

const POSTER_INTERNSHIP = `<svg viewBox="0 0 480 600" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="440" height="440" rx="48" fill="#F4F1EA"/>
  <defs><clipPath id="clip-internship"><circle cx="240" cy="230" r="168"/></clipPath></defs>
  <image href="/poster-internship.jpg" x="72" y="62" width="336" height="336" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-internship)"/>
  <text x="240" y="492" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="#1B1633" class="poster-title">Internship</text>
</svg>`;

const POSTER_SCHOLARSHIP = `<svg viewBox="0 0 480 600" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="440" height="440" rx="48" fill="#F4F1EA"/>
  <defs><clipPath id="clip-scholarship"><circle cx="240" cy="230" r="168"/></clipPath></defs>
  <image href="/poster-scholarship.jpg" x="72" y="62" width="336" height="336" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-scholarship)"/>
  <text x="240" y="492" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="800" fill="#1B1633" class="poster-title">Scholarship</text>
</svg>`;

const POSTER_EXPERT = `<svg viewBox="0 0 480 600" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="440" height="440" rx="48" fill="#F4F1EA"/>
  <defs><clipPath id="clip-expert"><circle cx="240" cy="230" r="168"/></clipPath></defs>
  <image href="/poster-expert-guide.jpg" x="72" y="62" width="336" height="336" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-expert)"/>
  <text x="240" y="492" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="800" fill="#1B1633" class="poster-title">Reviews</text>
</svg>`;

// Each poster is a clickable card — "quiz" opens the lead-gen quiz modal,
// "href" navigates. Expert Guide reuses the quiz modal too: it's the same
// counselor-callback flow the hero's "College" button starts.
const POSTERS = [
  { svg: POSTER_QUIZ, action: { type: 'quiz' as const } },
  { svg: POSTER_COMPARE, action: { type: 'href' as const, href: '/reviews' } },
  { svg: POSTER_INTERNSHIP, action: { type: 'href' as const, href: '/internship' } },
  { svg: POSTER_SCHOLARSHIP, action: { type: 'href' as const, href: '/scholarships' } },
  { svg: POSTER_EXPERT, action: { type: 'quiz' as const } },
];
const POSTER_TRACK = POSTERS;
const POSTER_TITLES = ['College Quiz', 'Compare Colleges', 'Internship', 'Scholarship', 'Reviews'];

// Swipeable stacked-card deck: one poster up front, the next two fanned
// behind it (peek + rotate), matching a card-deck interaction rather than a
// flat scroll strip. Advance via the chevrons, the dots, arrow keys, or a
// left/right swipe on the deck itself; the front card is still the real
// link/button so clicking it behaves exactly like before.
function PosterStack({ onQuiz }: { onQuiz: () => void }) {
  const total = POSTER_TRACK.length;
  const [index, setIndex] = useState(0);
  const dragStartX = useRef<number | null>(null);

  const advance = (dir: number) => setIndex((i) => (i + dir + total) % total);

  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current == null) return;
    const delta = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(delta) > 32) advance(delta < 0 ? 1 : -1);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') advance(1);
    else if (e.key === 'ArrowLeft') advance(-1);
  };

  return (
    <div className="stack-section">
      <div className="deck-row">
        <button type="button" className="deck-nav" aria-label="Previous" onClick={() => advance(-1)}>
          <ChevronLeft className="h-[18px] w-[18px]" />
        </button>

        <div
          className="deck"
          role="group"
          aria-label="Explore our tools — swipe or use the arrows to browse"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {POSTER_TRACK.map(({ svg, action }, i) => {
            const dist = (i - index + total) % total;
            if (dist > 2) return null;
            const photo = <span className="s-photo block" dangerouslySetInnerHTML={{ __html: svg }} />;
            if (dist !== 0) {
              return (
                <div key={i} aria-hidden className={`deck-card peek-${dist}`}>
                  {photo}
                </div>
              );
            }
            const label = `Open ${POSTER_TITLES[i]}`;
            return action.type === 'quiz' ? (
              <button key={i} type="button" className="deck-card front" aria-label={label} onClick={onQuiz}>
                {photo}
              </button>
            ) : (
              <Link key={i} href={action.href} className="deck-card front" aria-label={label}>
                {photo}
              </Link>
            );
          })}
        </div>

        <button type="button" className="deck-nav" aria-label="Next" onClick={() => advance(1)}>
          <ChevronRight className="h-[18px] w-[18px]" />
        </button>
      </div>

      <div className="mt-5 flex justify-center gap-2">
        {POSTER_TRACK.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show ${POSTER_TITLES[i]}`}
            aria-current={i === index}
            className={`dot ${i === index ? 'active' : ''}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>

      <style>{`
        .stack-section {
          width: 100%;
          padding: 8px 0 0;
        }
        .deck-row { display: flex; align-items: center; justify-content: center; gap: 14px; }
        .deck-nav {
          flex: none;
          width: 38px; height: 38px;
          border-radius: 999px;
          border: 1.5px solid hsl(var(--border));
          background: hsl(var(--card));
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .deck-nav:hover { background: hsl(var(--secondary)); border-color: hsl(var(--primary) / 0.4); }
        .deck-nav:focus-visible { outline: 3px solid hsl(var(--primary)); outline-offset: 2px; }
        .deck {
          position: relative;
          width: 210px;
          height: 303px;
          flex: none;
          touch-action: pan-y;
        }
        .deck:focus-visible { outline: 3px solid hsl(var(--primary)); outline-offset: 6px; border-radius: 22px; }
        .deck-card {
          position: absolute;
          left: 50%; top: 50%;
          width: 210px;
          display: block;
          border: 0; padding: 0; margin: 0;
          background: none;
          font: inherit;
          text-align: left;
          text-decoration: none;
          color: inherit;
          appearance: none;
          transition: transform 0.35s cubic-bezier(.2,.8,.2,1), opacity 0.35s ease;
        }
        .deck-card.front { cursor: pointer; z-index: 5; transform: translate(-50%, -50%); }
        .deck-card.front:hover .s-photo, .deck-card.front:focus-visible .s-photo {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 16px 32px rgba(27, 22, 51, 0.24);
        }
        .deck-card.front:focus-visible { outline: none; }
        .deck-card.peek-1 { z-index: 4; pointer-events: none; transform: translate(-50%, -58%) rotate(4deg) scale(0.94); opacity: 0.9; }
        .deck-card.peek-2 { z-index: 3; pointer-events: none; transform: translate(-50%, -63%) rotate(-6deg) scale(0.88); opacity: 0.75; }
        .s-photo { display: block; width: 100%; height: 263px; border-radius: 22px; overflow: hidden; border: 1.5px solid hsl(var(--border)); box-shadow: 0 4px 16px rgba(27, 22, 51, 0.1); transition: transform 0.25s ease, box-shadow 0.25s ease; background: hsl(var(--card)); }
        .s-photo svg { width: 100%; height: 100%; display: block; }
        .dot { width: 7px; height: 7px; border-radius: 999px; border: 0; padding: 0; background: hsl(var(--foreground) / 0.2); cursor: pointer; transition: background 0.2s ease, transform 0.2s ease; }
        .dot.active { background: hsl(var(--primary)); transform: scale(1.3); }
        @media (max-width: 700px) {
          .deck, .deck-card { width: 150px; }
          .deck { height: 223px; }
          .s-photo { height: 183px; }
          .deck-nav { width: 32px; height: 32px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .deck-card { transition: none; }
        }
      `}</style>
    </div>
  );
}

// Laptop/tablet layout: all 5 tools visible at once as a static row, no
// swipe/arrows/dots — those only make sense once space is tight on mobile.
// Each icon reuses the same illustrated poster art as the mobile deck
// (all 5 posters share the same circle at cx=240,cy=230,r=168 in their
// 480x600 viewBox), cropped to a small circle via scale + negative offset
// so the poster's own outer card/title never show through.
function PosterRow({ onQuiz }: { onQuiz: () => void }) {
  const cardClass =
    'flex flex-col items-center gap-3.5 rounded-[20px] border border-border bg-card px-3 py-7 text-inherit no-underline transition-transform hover:-translate-y-1 hover:shadow-lg';
  return (
    <div className="grid grid-cols-5 gap-4">
      {POSTER_TRACK.map(({ svg, action }, i) => {
        const inner = (
          <>
            <span className="relative block h-16 w-16 overflow-hidden rounded-full">
              <span
                aria-hidden
                className="absolute left-[-13.7px] top-[-11.7px] block h-[600px] w-[480px] origin-top-left"
                style={{ transform: 'scale(0.19)' }}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </span>
            <span className="text-center font-display text-[15px] font-extrabold tracking-tight">{POSTER_TITLES[i]}</span>
          </>
        );
        return action.type === 'quiz' ? (
          <button key={i} type="button" onClick={onQuiz} className={cardClass}>
            {inner}
          </button>
        ) : (
          <Link key={i} href={action.href} className={cardClass}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}

export function HomeTools({ onQuiz }: { onQuiz: () => void }) {
  return (
    <section aria-label="Tools & scholarships" className="!mt-0 mx-auto w-full max-w-[960px]">
      <div className="mb-8 border-t-2 border-border pt-7 text-center sm:pt-10 [@media(max-height:700px)]:mb-4 [@media(max-height:700px)]:pt-4">
        <span aria-hidden className="mx-auto block h-[3px] w-10 -translate-y-[calc(50%+1px)] rounded-full bg-marigold" />
        <h2 className="text-balance font-display text-[clamp(24px,3.6vw,36px)] font-semibold">Everything You Need to Succeed</h2>
        <p className="mx-auto mt-3 max-w-[440px] text-[14.5px] leading-relaxed text-muted-foreground sm:max-w-[560px] sm:text-[15.5px] [@media(max-height:700px)]:mt-1.5">
          Explore tools that help you choose the right college, discover opportunities, and make confident career decisions.
        </p>
      </div>

      {/* Mobile: swipeable fanned carousel. Laptop/tablet: static row of all 5. */}
      <div className="md:hidden">
        <PosterStack onQuiz={onQuiz} />
      </div>
      <div className="hidden md:block">
        <PosterRow onQuiz={onQuiz} />
      </div>

      {/* Direct Admission Desk */}
      <div className="mt-6 border-t border-border pt-8">
        <HomeAdmissionDesk onApply={onQuiz} />
      </div>

      <MyShortlist />

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
            <Link key={s.name} href="/scholarships" className="group flex w-[240px] flex-none snap-start flex-col">
              <span className="relative mb-3 flex h-[140px] items-center justify-center rounded-[10px] border border-border bg-card">
                <span className="absolute right-3 top-3 rounded-full bg-marigold-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                  Example
                </span>
                <Ill svg={s.svg} />
              </span>
              <p className="text-[16px] font-semibold leading-snug">
                <b className="font-extrabold">{s.amount}</b> {s.name}
              </p>
              <span className="mt-2.5 inline-flex w-fit items-center gap-1.5 rounded-full border border-foreground/15 bg-secondary px-3 py-1 text-[13px] font-bold transition-colors group-hover:bg-secondary/70">
                Apply Now <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}

          <Link
            href="/scholarships"
            className="flex w-[240px] flex-none snap-start items-center gap-3 rounded-xl border-[1.6px] border-foreground bg-card px-5 py-5"
          >
            <b className="flex-1 font-display text-[19px] font-extrabold leading-snug tracking-tight">See All Your Scholarship Matches</b>
            <ChevronRight className="h-[18px] w-[18px] flex-none" />
          </Link>
        </div>

        <div className="flex justify-center pt-6">
          <Link
            href="/scholarships"
            className="inline-flex items-center gap-2.5 rounded-full border-[1.6px] border-foreground bg-card px-7 py-3.5 text-[16px] font-extrabold transition-colors hover:bg-secondary"
          >
            Browse All Scholarships <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* College Guidance & Resources */}
      <div className="mt-6 border-t border-border pt-8">
        <div className="mb-2 flex items-center gap-2.5">
          <Compass className="h-6 w-6" />
          <h2 className="font-display text-[25px] font-extrabold tracking-[-.02em]">College Guidance &amp; Resources</h2>
        </div>
        <p className="mb-5 max-w-[520px] text-[15.5px] font-medium text-muted-foreground">
          You&apos;ve got a lot to keep track of. Stay on the right path with guidance and resources from real students.
        </p>

        <ResourcesStrip />

        <div className="flex justify-center pt-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2.5 rounded-full border-[1.6px] border-foreground bg-card px-7 py-3.5 text-[16px] font-extrabold transition-colors hover:bg-secondary"
          >
            Browse All Resources <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Internships */}
      <div className="mt-6 border-t border-border pt-8">
        <div className="mb-2 flex items-center gap-2.5">
          <Briefcase className="h-6 w-6" />
          <h2 className="font-display text-[25px] font-extrabold tracking-[-.02em]">Internships</h2>
        </div>
        <p className="mb-5 max-w-[520px] text-[15.5px] font-medium text-muted-foreground">
          Search verified internships, or get matched to the ones you&apos;re actually eligible for.
        </p>

        <div className="flex snap-x gap-4 overflow-x-auto pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {INTERNSHIPS.map((s) => (
            <Link key={s.name} href="/internship" className="group flex w-[240px] flex-none snap-start flex-col">
              <span className="relative mb-3 flex h-[140px] items-center justify-center rounded-[10px] border border-border bg-card">
                <span className="absolute right-3 top-3 rounded-full bg-marigold-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                  Example
                </span>
                <Ill svg={s.svg} />
              </span>
              <p className="text-[16px] font-semibold leading-snug">
                <b className="font-extrabold">{s.hook}</b> {s.name}
              </p>
              <span className="mt-2.5 inline-flex w-fit items-center gap-1.5 rounded-full border border-foreground/15 bg-secondary px-3 py-1 text-[13px] font-bold transition-colors group-hover:bg-secondary/70">
                Apply Now <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}

          <Link
            href="/internship"
            className="flex w-[240px] flex-none snap-start items-center gap-3 rounded-xl border-[1.6px] border-foreground bg-card px-5 py-5"
          >
            <b className="flex-1 font-display text-[19px] font-extrabold leading-snug tracking-tight">See All Your Internship Matches</b>
            <ChevronRight className="h-[18px] w-[18px] flex-none" />
          </Link>
        </div>

        <div className="flex justify-center pt-6">
          <Link
            href="/internship"
            className="inline-flex items-center gap-2.5 rounded-full border-[1.6px] border-foreground bg-card px-7 py-3.5 text-[16px] font-extrabold transition-colors hover:bg-secondary"
          >
            Browse All Internships <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
