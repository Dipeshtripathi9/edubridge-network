'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Briefcase, ChevronLeft, ChevronRight, IndianRupee } from 'lucide-react';
import { HomeAdmissionDesk } from '@/components/home-admission-desk';

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
  <circle cx="240" cy="230" r="168" fill="#FBE3B8"/>
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
  <circle cx="240" cy="230" r="168" fill="#E4D9FF"/>
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
  <circle cx="240" cy="230" r="168" fill="#FBE3B8"/>
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
  <circle cx="240" cy="230" r="168" fill="#E4D9FF"/>
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
const POSTER_TITLES = ['College Quiz', 'Compare Colleges', 'Internship', 'Scholarship', 'Expert Guide'];

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

      {/* Direct Admission Desk */}
      <div className="mt-6 border-t border-border pt-8">
        <HomeAdmissionDesk onApply={onQuiz} />
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
            Browse All Scholarships <ChevronRight className="h-4 w-4" />
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
