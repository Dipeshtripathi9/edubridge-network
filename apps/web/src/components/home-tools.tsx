'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Columns3, Heart, IndianRupee, Landmark, MessageCircleQuestion } from 'lucide-react';

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

// Fanned poster carousel — each poster is a full illustrated SVG card (background +
// icon scene + title baked in). Raw markup, same reasoning as the Ill SVGs above.
const POSTER_QUIZ = `<svg viewBox="0 0 480 600" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="440" height="440" rx="48" fill="#F4F1EA"/>
  <circle cx="240" cy="230" r="168" fill="#E4D9FF"/>
  <g transform="translate(240 250) scale(0.66) translate(-240 -250)">
  <rect x="170" y="150" width="150" height="230" rx="18" fill="#1B1633" opacity="0.06"/>
  <path d="M160 150 h150 v230 l-20 20 h-130 z" fill="#fff" stroke="#1B1633" stroke-width="6" stroke-linejoin="round"/>
  <g>
    <path d="M155 140 L240 105 L325 140 L240 175 Z" fill="#1B1633"/>
    <path d="M195 128 L280 152" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.5"/>
    <path d="M195 145 h90 v30 a45 25 0 0 1 -90 0 z" fill="#1B1633"/>
    <line x1="300" y1="142" x2="300" y2="200" stroke="#1B1633" stroke-width="4"/>
    <circle cx="300" cy="207" r="8" fill="#1B1633"/>
  </g>
  <text x="235" y="220" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="800" fill="#1B1633" letter-spacing="2">QUIZ</text>
  <rect x="195" y="240" width="26" height="26" rx="6" fill="none" stroke="#1B1633" stroke-width="4"/>
  <path d="M200 253 l6 6 l12 -12" stroke="#5B4FE9" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="235" y1="253" x2="300" y2="253" stroke="#1B1633" stroke-width="4" stroke-linecap="round"/>
  <rect x="195" y="288" width="26" height="26" rx="6" fill="none" stroke="#1B1633" stroke-width="4"/>
  <line x1="235" y1="301" x2="300" y2="301" stroke="#1B1633" stroke-width="4" stroke-linecap="round"/>
  <rect x="195" y="336" width="26" height="26" rx="6" fill="none" stroke="#1B1633" stroke-width="4"/>
  <line x1="235" y1="349" x2="290" y2="349" stroke="#1B1633" stroke-width="4" stroke-linecap="round"/>
  <g>
    <rect x="0" y="0" width="26" height="120" rx="6" fill="#F4F1EA" stroke="#1B1633" stroke-width="4" transform="translate(300 300) rotate(35)"/>
    <path d="M0 0 h26 l-13 22 z" fill="#1B1633" stroke-linejoin="round" transform="translate(300 300) rotate(35)"/>
  </g>
  </g>
  <text x="240" y="492" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="#1B1633" class="poster-title">College Quiz</text>
</svg>`;

const POSTER_COMPARE = `<svg viewBox="0 0 480 600" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="440" height="440" rx="48" fill="#F4F1EA"/>
  <circle cx="240" cy="230" r="168" fill="#DFDACB"/>
  <g transform="translate(240 250) scale(0.74) translate(-240 -250)">
  <g>
    <rect x="115" y="160" width="150" height="230" rx="18" fill="#1B1633" opacity="0.06" transform="rotate(-4 190 275)"/>
    <rect x="115" y="160" width="150" height="230" rx="18" fill="#fff" stroke="#1B1633" stroke-width="6" transform="rotate(-4 190 275)"/>
  </g>
  <g>
    <rect x="215" y="150" width="150" height="230" rx="18" fill="#1B1633" opacity="0.06" transform="rotate(3 290 265)"/>
    <rect x="215" y="150" width="150" height="230" rx="18" fill="#fff" stroke="#1B1633" stroke-width="6" transform="rotate(3 290 265)"/>
  </g>
  <g transform="translate(140 190)">
    <rect x="0" y="30" width="70" height="10" fill="#1B1633"/>
    <rect x="6" y="10" width="58" height="20" fill="#1B1633"/>
    <rect x="30" y="0" width="10" height="10" fill="#1B1633"/>
    <rect x="14" y="14" width="8" height="16" fill="#fff"/>
    <rect x="31" y="14" width="8" height="16" fill="#fff"/>
    <rect x="48" y="14" width="8" height="16" fill="#fff"/>
  </g>
  <line x1="140" y1="240" x2="225" y2="240" stroke="#1B1633" stroke-width="4" opacity="0.3" stroke-linecap="round"/>
  <line x1="140" y1="255" x2="215" y2="255" stroke="#1B1633" stroke-width="4" opacity="0.3" stroke-linecap="round"/>
  <g fill="#1B1633">
    <path d="M148 285 l3 6 l6 1 l-4 4 l1 6 l-6 -3 l-6 3 l1 -6 l-4 -4 l6 -1 z"/>
    <path d="M170 285 l3 6 l6 1 l-4 4 l1 6 l-6 -3 l-6 3 l1 -6 l-4 -4 l6 -1 z"/>
    <path d="M192 285 l3 6 l6 1 l-4 4 l1 6 l-6 -3 l-6 3 l1 -6 l-4 -4 l6 -1 z"/>
  </g>
  <g fill="#D6D2C4">
    <path d="M214 285 l3 6 l6 1 l-4 4 l1 6 l-6 -3 l-6 3 l1 -6 l-4 -4 l6 -1 z"/>
  </g>
  <g transform="translate(250 185)">
    <rect x="0" y="30" width="70" height="10" fill="#1B1633"/>
    <rect x="6" y="10" width="58" height="20" fill="#1B1633"/>
    <circle cx="35" cy="2" r="9" fill="#1B1633"/>
    <rect x="14" y="14" width="8" height="16" fill="#fff"/>
    <rect x="31" y="14" width="8" height="16" fill="#fff"/>
    <rect x="48" y="14" width="8" height="16" fill="#fff"/>
  </g>
  <g fill="#1B1633">
    <path d="M258 288 l3 6 l6 1 l-4 4 l1 6 l-6 -3 l-6 3 l1 -6 l-4 -4 l6 -1 z"/>
    <path d="M280 288 l3 6 l6 1 l-4 4 l1 6 l-6 -3 l-6 3 l1 -6 l-4 -4 l6 -1 z"/>
    <path d="M302 288 l3 6 l6 1 l-4 4 l1 6 l-6 -3 l-6 3 l1 -6 l-4 -4 l6 -1 z"/>
  </g>
  <g fill="#D6D2C4">
    <path d="M324 288 l3 6 l6 1 l-4 4 l1 6 l-6 -3 l-6 3 l1 -6 l-4 -4 l6 -1 z"/>
  </g>
  <circle cx="240" cy="255" r="24" fill="#1B1633"/>
  <text x="240" y="263" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="#fff">VS</text>
  <g transform="translate(300 320)">
    <circle cx="0" cy="0" r="34" fill="#F4F1EA" stroke="#5B4FE9" stroke-width="8"/>
    <line x1="24" y1="24" x2="55" y2="55" stroke="#5B4FE9" stroke-width="12" stroke-linecap="round"/>
  </g>
  </g>
  <text x="240" y="492" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="800" fill="#1B1633" class="poster-title">Compare Colleges</text>
</svg>`;

const POSTER_INTERNSHIP = `<svg viewBox="0 0 480 600" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="440" height="440" rx="48" fill="#F4F1EA"/>
  <circle cx="240" cy="230" r="168" fill="#FBE3B8"/>
  <g transform="translate(240 250) scale(0.66) translate(-240 -250)">
  <g transform="translate(105 260)">
    <rect x="0" y="30" width="110" height="90" rx="10" fill="#1B1633"/>
    <rect x="35" y="10" width="40" height="25" rx="6" fill="none" stroke="#1B1633" stroke-width="7"/>
    <rect x="45" y="65" width="20" height="20" rx="4" fill="#F4F1EA"/>
  </g>
  <g>
    <path d="M235 130 q0 40 -25 40" fill="none" stroke="#1B1633" stroke-width="8" stroke-linecap="round"/>
    <path d="M255 130 q0 40 25 40" fill="none" stroke="#1B1633" stroke-width="8" stroke-linecap="round"/>
    <rect x="222" y="165" width="26" height="16" rx="4" fill="#1B1633"/>
    <rect x="188" y="180" width="104" height="180" rx="16" fill="#fff" stroke="#1B1633" stroke-width="6"/>
    <rect x="205" y="200" width="70" height="55" rx="8" fill="#EAE7DC"/>
    <circle cx="240" cy="218" r="12" fill="#1B1633"/>
    <path d="M220 250 a20 16 0 0 1 40 0 z" fill="#1B1633"/>
    <line x1="205" y1="270" x2="275" y2="270" stroke="#1B1633" stroke-width="4" opacity="0.3"/>
    <line x1="205" y1="282" x2="265" y2="282" stroke="#1B1633" stroke-width="4" opacity="0.3"/>
    <rect x="205" y="320" width="70" height="24" rx="6" fill="#1B1633"/>
    <text x="240" y="337" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="800" fill="#fff">INTERN</text>
  </g>
  <g>
    <rect x="292" y="195" width="110" height="150" rx="14" fill="#fff" stroke="#1B1633" stroke-width="6"/>
    <text x="347" y="222" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="800" fill="#1B1633">INTERNSHIP</text>
    <circle cx="308" cy="245" r="8" fill="#1B1633"/>
    <path d="M304 245 l3 3 l6 -6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>
    <line x1="322" y1="245" x2="390" y2="245" stroke="#1B1633" stroke-width="3" opacity="0.3"/>
    <circle cx="308" cy="268" r="8" fill="#1B1633"/>
    <path d="M304 268 l3 3 l6 -6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>
    <line x1="322" y1="268" x2="385" y2="268" stroke="#1B1633" stroke-width="3" opacity="0.3"/>
    <circle cx="308" cy="291" r="8" fill="#1B1633"/>
    <path d="M304 291 l3 3 l6 -6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>
    <line x1="322" y1="291" x2="380" y2="291" stroke="#1B1633" stroke-width="3" opacity="0.3"/>
  </g>
  <circle cx="355" cy="360" r="34" fill="#5B4FE9"/>
  <path d="M340 361 l10 10 l20 -22" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="240" y="492" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="#1B1633" class="poster-title">Internship</text>
</svg>`;

const POSTER_SCHOLARSHIP = `<svg viewBox="0 0 480 600" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="440" height="440" rx="48" fill="#F4F1EA"/>
  <circle cx="240" cy="230" r="168" fill="#E4D9FF"/>
  <g transform="translate(240 250) scale(0.66) translate(-240 -250)">
  <rect x="145" y="150" width="150" height="220" rx="16" fill="#fff" stroke="#1B1633" stroke-width="6"/>
  <text x="220" y="185" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" font-weight="800" fill="#1B1633" letter-spacing="1">SCHOLARSHIP</text>
  <line x1="165" y1="205" x2="275" y2="205" stroke="#1B1633" stroke-width="4" opacity="0.3" stroke-linecap="round"/>
  <line x1="165" y1="222" x2="275" y2="222" stroke="#1B1633" stroke-width="4" opacity="0.3" stroke-linecap="round"/>
  <line x1="165" y1="239" x2="255" y2="239" stroke="#1B1633" stroke-width="4" opacity="0.3" stroke-linecap="round"/>
  <path d="M165 290 q20 -10 40 0 t40 0" stroke="#1B1633" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.5"/>
  <circle cx="185" cy="330" r="24" fill="#1B1633"/>
  <path d="M185 314 l5 12 l13 2 l-9 9 l2 13 l-11 -6 l-11 6 l2 -13 l-9 -9 l13 -2 z" fill="#fff" transform="translate(-8 8) scale(0.9)"/>
  <path d="M170 350 l-6 30 l16 -10 z" fill="#1B1633"/>
  <path d="M200 350 l6 30 l-16 -10 z" fill="#1B1633"/>
  <g transform="translate(230 110)">
    <path d="M0 20 L70 0 L140 20 L70 40 Z" fill="#1B1633"/>
    <path d="M28 12 L100 30" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.5"/>
    <path d="M35 26 h70 v22 a35 20 0 0 1 -70 0 z" fill="#1B1633"/>
    <line x1="118" y1="22" x2="118" y2="65" stroke="#1B1633" stroke-width="4"/>
    <circle cx="118" cy="71" r="7" fill="#1B1633"/>
  </g>
  <rect x="300" y="330" width="90" height="20" rx="4" fill="#1B1633"/>
  <rect x="300" y="352" width="90" height="20" rx="4" fill="#1B1633"/>
  <rect x="330" y="356" width="14" height="16" fill="#F4F1EA"/>
  <circle cx="355" cy="290" r="26" fill="#5B4FE9"/>
  <text x="355" y="300" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="800" fill="#fff">₹</text>
  </g>
  <text x="240" y="492" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="800" fill="#1B1633" class="poster-title">Scholarship</text>
</svg>`;

const POSTER_EXPERT = `<svg viewBox="0 0 480 600" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="440" height="440" rx="48" fill="#F4F1EA"/>
  <circle cx="240" cy="230" r="168" fill="#FBE3B8"/>
  <g transform="translate(240 250) scale(0.66) translate(-240 -250)">
  <g transform="translate(110 220)">
    <rect x="0" y="0" width="100" height="150" rx="12" fill="#fff" stroke="#1B1633" stroke-width="6"/>
    <rect x="30" y="-14" width="40" height="24" rx="6" fill="#1B1633"/>
    <circle cx="22" cy="30" r="10" fill="#1B1633"/>
    <path d="M17 30 l4 4 l7 -7" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
    <line x1="40" y1="30" x2="82" y2="30" stroke="#1B1633" stroke-width="4" opacity="0.3"/>
    <circle cx="22" cy="58" r="10" fill="#1B1633"/>
    <path d="M17 58 l4 4 l7 -7" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
    <line x1="40" y1="58" x2="82" y2="58" stroke="#1B1633" stroke-width="4" opacity="0.3"/>
    <circle cx="22" cy="86" r="10" fill="#1B1633"/>
    <path d="M17 86 l4 4 l7 -7" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
    <line x1="40" y1="86" x2="76" y2="86" stroke="#1B1633" stroke-width="4" opacity="0.3"/>
  </g>
  <rect x="110" y="378" width="80" height="16" rx="4" fill="#1B1633"/>
  <rect x="110" y="396" width="80" height="16" rx="4" fill="#1B1633" opacity="0.6"/>
  <g transform="translate(280 210)">
    <path d="M-55 90 q55 -55 110 0 v10 h-110 z" fill="#1B1633"/>
    <path d="M-14 55 l14 20 l14 -20 v18 l-14 10 l-14 -10 z" fill="#fff"/>
    <circle cx="0" cy="0" r="38" fill="#F4F1EA" stroke="#1B1633" stroke-width="6"/>
    <path d="M-32 -12 q32 -34 64 0" fill="none" stroke="#1B1633" stroke-width="6"/>
    <rect x="-19" y="-15" width="15" height="11" rx="2" fill="none" stroke="#1B1633" stroke-width="3"/>
    <rect x="4" y="-15" width="15" height="11" rx="2" fill="none" stroke="#1B1633" stroke-width="3"/>
    <line x1="-4" y1="-9" x2="4" y2="-9" stroke="#1B1633" stroke-width="3"/>
    <path d="M-10 16 q10 8 20 0" stroke="#1B1633" stroke-width="4" fill="none" stroke-linecap="round"/>
  </g>
  <g transform="translate(215 330)">
    <rect x="0" y="0" width="130" height="80" rx="8" fill="#1B1633"/>
    <rect x="8" y="8" width="114" height="64" rx="4" fill="#F4F1EA"/>
    <circle cx="65" cy="40" r="16" fill="#1B1633" opacity="0.5"/>
    <rect x="-8" y="80" width="146" height="10" rx="4" fill="#1B1633"/>
  </g>
  <g transform="translate(330 150)">
    <path d="M0 0 h75 a12 12 0 0 1 12 12 v32 a12 12 0 0 1 -12 12 h-42 l-16 16 v-16 h-17 a12 12 0 0 1 -12 -12 v-32 a12 12 0 0 1 12 -12 z" fill="#fff" stroke="#1B1633" stroke-width="5"/>
    <circle cx="22" cy="28" r="4.5" fill="#1B1633"/>
    <circle cx="38" cy="28" r="4.5" fill="#1B1633"/>
    <circle cx="54" cy="28" r="4.5" fill="#1B1633"/>
  </g>
  <circle cx="368" cy="330" r="30" fill="#5B4FE9"/>
  <circle cx="368" cy="322" r="8" fill="#fff"/>
  <path d="M356 342 q12 -14 24 0" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g>
  <text x="240" y="492" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="800" fill="#1B1633" class="poster-title">Expert Guide</text>
</svg>`;

// Each poster is a clickable card — "quiz" opens the lead-gen quiz modal,
// "href" navigates. Expert Guide reuses the quiz modal too: it's the same
// counselor-callback flow the hero's "College" button starts.
const POSTERS = [
  { svg: POSTER_QUIZ, action: { type: 'quiz' as const } },
  { svg: POSTER_COMPARE, action: { type: 'href' as const, href: '/reviews' } },
  { svg: POSTER_INTERNSHIP, action: { type: 'href' as const, href: '/internship' } },
  { svg: POSTER_SCHOLARSHIP, action: { type: 'href' as const, href: '/internship' } },
  { svg: POSTER_EXPERT, action: { type: 'quiz' as const } },
];
const POSTER_TRACK = POSTERS;

function PosterStack({ onQuiz }: { onQuiz: () => void }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [gutter, setGutter] = useState(16);

  useLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el?.parentElement) return;
    const update = () => setGutter(el.parentElement!.getBoundingClientRect().left);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div ref={sectionRef} className="stack-section">
      <div className="stack-outer" style={{ scrollPaddingLeft: gutter }}>
        <div className="stack-track" style={{ paddingLeft: gutter, paddingRight: gutter }}>
          {POSTER_TRACK.map(({ svg, action }, i) => {
            const photo = <span className="s-photo block" dangerouslySetInnerHTML={{ __html: svg }} />;
            const className = 'm-item';
            return action.type === 'quiz' ? (
              <button key={i} type="button" className={className} onClick={onQuiz}>
                {photo}
              </button>
            ) : (
              <Link key={i} href={action.href} className={className}>
                {photo}
              </Link>
            );
          })}
        </div>
      </div>
      <div aria-hidden className="mt-4 flex justify-center gap-1.5">
        {POSTERS.map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
        ))}
      </div>
      <style>{`
        .stack-section {
          width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          background: hsl(var(--background));
          padding: 0 0 56px;
        }
        .stack-outer {
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scroll-snap-type: x proximity;
          scrollbar-width: none;
          mask-image: linear-gradient(to right, black 0%, black 94%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, black 0%, black 94%, transparent 100%);
        }
        .stack-outer::-webkit-scrollbar { display: none; }
        .stack-track { display: flex; width: max-content; gap: 24px; }
        .m-item {
          position: relative;
          flex: 0 0 210px;
          width: 210px;
          display: block;
          border: 0;
          padding: 0;
          margin: 0;
          background: none;
          font: inherit;
          text-align: left;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
          appearance: none;
          scroll-snap-align: start;
        }
        .m-item:focus-visible { outline: 3px solid hsl(var(--primary)); outline-offset: 4px; border-radius: 18px; }
        .m-item .s-photo { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .m-item:hover .s-photo, .m-item:focus-visible .s-photo {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 16px 32px rgba(27, 22, 51, 0.24);
        }
        .s-photo { width: 100%; height: 263px; border-radius: 22px; overflow: hidden; border: 1.5px solid hsl(var(--border)); box-shadow: 0 4px 16px rgba(27, 22, 51, 0.1); }
        .s-photo svg { width: 100%; height: 100%; display: block; }
        @media (max-width: 700px) {
          .m-item { flex-basis: 130px; width: 130px; }
          .s-photo { height: 163px; }
        }
      `}</style>
    </div>
  );
}

const DISCOVER_CARDS = [
  {
    href: '/ask',
    icon: MessageCircleQuestion,
    tone: 'bg-accent text-primary',
    title: 'Ask verified students',
    desc: 'Get honest answers on curriculum, placements, and campus life — no charges, ever.',
  },
  {
    href: '/colleges',
    icon: Heart,
    tone: 'bg-marigold-soft text-amber-600',
    title: 'Shortlist colleges',
    desc: 'Browse by rank, rating, and location, and save the ones worth a closer look.',
  },
  {
    href: '/compare',
    icon: Columns3,
    tone: 'bg-accent text-primary',
    title: 'Compare side by side',
    desc: 'Put your shortlist head to head on rating, placements, and rank.',
  },
  {
    href: '/ask',
    icon: Landmark,
    tone: 'bg-marigold-soft text-amber-600',
    title: 'Direct Admission Desk',
    desc: "Don't pay just to ask — one free form for fees, scholarships, seats & loans.",
  },
] as const;

export function HomeTools({ onQuiz }: { onQuiz: () => void }) {
  return (
    <section aria-label="Tools & scholarships" className="!mt-0 mx-auto w-full max-w-[960px]">
      <div className="mb-8 border-t-2 border-border pt-7 text-center sm:pt-10 [@media(max-height:700px)]:mb-4 [@media(max-height:700px)]:pt-4">
        <span aria-hidden className="mx-auto block h-[3px] w-10 -translate-y-[calc(50%+1px)] rounded-full bg-marigold" />
        <h2 className="text-balance font-display text-[clamp(22px,3.4vw,34px)] font-extrabold tracking-[-.02em]">Everything You Need to Succeed</h2>
        <p className="mx-auto mt-3 max-w-[440px] text-[14.5px] leading-relaxed text-muted-foreground sm:max-w-[560px] sm:text-[15.5px] [@media(max-height:700px)]:mt-1.5">
          Explore tools that help you choose the right college, discover opportunities, and make confident career decisions.
        </p>
      </div>

      {/* Fanned poster carousel */}
      <PosterStack onQuiz={onQuiz} />

      {/* Choose with confidence */}
      <div className="mb-8 border-t-2 border-border pt-7 text-center sm:pt-10">
        <span aria-hidden className="mx-auto block h-[3px] w-10 -translate-y-[calc(50%+1px)] rounded-full bg-marigold" />
        <h2 className="text-balance font-display text-[clamp(22px,3.4vw,34px)] font-extrabold tracking-[-.02em]">Choose with Confidence</h2>
        <p className="mx-auto mt-3 max-w-[440px] text-[14.5px] leading-relaxed text-muted-foreground sm:max-w-[560px] sm:text-[15.5px]">
          Real students, real answers — before you commit to four years and a lot of money.
        </p>
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DISCOVER_CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="flex flex-col items-start gap-3 rounded-[22px] border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/30"
          >
            <span className={`grid h-[64px] w-[64px] place-items-center rounded-full ${c.tone}`}>
              <c.icon className="h-6 w-6" />
            </span>
            <h3 className="font-display text-[18px] font-extrabold tracking-tight">{c.title}</h3>
            <p className="text-[14px] text-muted-foreground">{c.desc}</p>
          </Link>
        ))}
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
            <Link key={s.name} href="/internship" className="group flex w-[240px] flex-none snap-start flex-col">
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
            href="/internship"
            className="flex w-[240px] flex-none snap-start items-center gap-3 rounded-xl border-[1.6px] border-foreground bg-card px-5 py-5"
          >
            <b className="flex-1 font-display text-[19px] font-extrabold leading-snug tracking-tight">See All Your Scholarship Matches</b>
            <ChevronRight className="h-[18px] w-[18px] flex-none" />
          </Link>
        </div>

        <div className="flex justify-center pt-6">
          <Link
            href="/internship"
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
