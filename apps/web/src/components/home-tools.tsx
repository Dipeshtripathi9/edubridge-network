'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, IndianRupee } from 'lucide-react';

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
  <circle cx="240" cy="230" r="168" fill="#EAE7DC"/>
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
  <circle cx="240" cy="230" r="168" fill="#EAE7DC"/>
  <g transform="translate(240 250) scale(0.66) translate(-240 -250)">
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
  <circle cx="240" cy="230" r="168" fill="#EAE7DC"/>
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
  <circle cx="240" cy="230" r="168" fill="#EAE7DC"/>
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

const POSTER_RESOURCES = `<svg viewBox="0 0 480 600" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="440" height="440" rx="48" fill="#F4F1EA"/>
  <circle cx="240" cy="230" r="168" fill="#EAE7DC"/>
  <g transform="translate(240 250) scale(0.66) translate(-240 -250)">
  <rect x="120" y="200" width="70" height="140" rx="8" fill="#1B1633"/>
  <line x1="135" y1="230" x2="175" y2="230" stroke="#fff" stroke-width="4" opacity="0.5"/>
  <line x1="135" y1="245" x2="165" y2="245" stroke="#fff" stroke-width="4" opacity="0.5"/>
  <path d="M195 165 h90 l25 25 v170 h-115 z" fill="#fff" stroke="#1B1633" stroke-width="6" stroke-linejoin="round"/>
  <path d="M285 165 v25 h25 z" fill="#EAE7DC" stroke="#1B1633" stroke-width="4"/>
  <rect x="212" y="205" width="45" height="14" rx="4" fill="#1B1633"/>
  <line x1="212" y1="235" x2="292" y2="235" stroke="#1B1633" stroke-width="4" opacity="0.3"/>
  <line x1="212" y1="252" x2="292" y2="252" stroke="#1B1633" stroke-width="4" opacity="0.3"/>
  <line x1="212" y1="269" x2="270" y2="269" stroke="#1B1633" stroke-width="4" opacity="0.3"/>
  <circle cx="278" cy="305" r="18" fill="#1B1633"/>
  <path d="M278 297 v14 M271 304 l7 7 l7 -7" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <g transform="translate(295 250)">
    <rect x="0" y="0" width="110" height="72" rx="8" fill="#1B1633"/>
    <rect x="8" y="8" width="94" height="56" rx="4" fill="#F4F1EA"/>
    <circle cx="55" cy="34" r="15" fill="#5B4FE9"/>
    <path d="M50 27 l14 7 l-14 7 z" fill="#fff"/>
    <line x1="20" y1="55" x2="60" y2="55" stroke="#1B1633" stroke-width="3" opacity="0.3"/>
    <rect x="-8" y="72" width="126" height="10" rx="4" fill="#1B1633"/>
  </g>
  <path d="M150 340 q50 -20 90 0 v70 q-45 -18 -90 0 z" fill="#1B1633" stroke="#1B1633" stroke-width="6" stroke-linejoin="round"/>
  <path d="M240 340 q50 -20 90 0 v70 q-45 -18 -90 0 z" fill="#fff" stroke="#1B1633" stroke-width="6" stroke-linejoin="round"/>
  <line x1="170" y1="360" x2="215" y2="352" stroke="#fff" stroke-width="3" opacity="0.5"/>
  <line x1="170" y1="375" x2="215" y2="368" stroke="#fff" stroke-width="3" opacity="0.5"/>
  <line x1="255" y1="352" x2="300" y2="360" stroke="#1B1633" stroke-width="3" opacity="0.3"/>
  <line x1="255" y1="368" x2="300" y2="375" stroke="#1B1633" stroke-width="3" opacity="0.3"/>
  <g transform="translate(340 350)">
    <circle cx="0" cy="0" r="24" fill="none" stroke="#1B1633" stroke-width="6"/>
    <rect x="-10" y="20" width="20" height="14" rx="4" fill="#1B1633"/>
    <line x1="0" y1="-38" x2="0" y2="-28" stroke="#1B1633" stroke-width="4" stroke-linecap="round"/>
    <line x1="26" y1="-26" x2="19" y2="-19" stroke="#1B1633" stroke-width="4" stroke-linecap="round"/>
    <line x1="-26" y1="-26" x2="-19" y2="-19" stroke="#1B1633" stroke-width="4" stroke-linecap="round"/>
  </g>
  </g>
  <text x="240" y="492" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="#1B1633" class="poster-title">Resources</text>
</svg>`;

const POSTER_EXPERT = `<svg viewBox="0 0 480 600" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="440" height="440" rx="48" fill="#F4F1EA"/>
  <circle cx="240" cy="230" r="168" fill="#EAE7DC"/>
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
  { svg: POSTER_INTERNSHIP, action: { type: 'href' as const, href: '/opportunities' } },
  { svg: POSTER_SCHOLARSHIP, action: { type: 'href' as const, href: '/opportunities' } },
  { svg: POSTER_RESOURCES, action: { type: 'href' as const, href: '/communities' } },
  { svg: POSTER_EXPERT, action: { type: 'quiz' as const } },
];
// Doubled so the marquee can scroll -50% and loop seamlessly.
const POSTER_TRACK = [...POSTERS, ...POSTERS];

function PosterStack({ onQuiz }: { onQuiz: () => void }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('started');
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="stack-section -mx-4 sm:-mx-6">
      <div className="stack-outer">
        <div className="stack-track">
          {POSTER_TRACK.map(({ svg, action }, i) => {
            const photo = <span className="s-photo block" dangerouslySetInnerHTML={{ __html: svg }} />;
            const className = `m-item fan-${i % 6}`;
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
      <style>{`
        .stack-section { width: 100%; background: hsl(var(--background)); padding: 8px 0 56px; }
        .stack-outer { width: 100%; overflow: hidden; }
        .stack-track { display: flex; width: max-content; gap: 24px; padding-left: 5vw; }
        .m-item {
          position: relative;
          flex: 0 0 210px;
          width: 210px;
          transform: translateX(var(--fx)) translateY(var(--fy)) rotate(var(--fr));
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
        }
        .m-item:focus-visible { outline: 3px solid hsl(var(--primary)); outline-offset: 4px; border-radius: 18px; }
        .m-item .s-photo { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .m-item:hover .s-photo, .m-item:focus-visible .s-photo {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 16px 32px rgba(27, 22, 51, 0.24);
        }
        .fan-0 { --fx: 212px; --fy: 32px; --fr: -15deg; z-index: 1; }
        .fan-1 { --fx: 127px; --fy: 20px; --fr: -9deg; z-index: 2; }
        .fan-2 { --fx: 42px; --fy: 7px; --fr: -3deg; z-index: 3; }
        .fan-3 { --fx: -42px; --fy: 7px; --fr: 3deg; z-index: 3; }
        .fan-4 { --fx: -127px; --fy: 20px; --fr: 9deg; z-index: 2; }
        .fan-5 { --fx: -212px; --fy: 32px; --fr: 15deg; z-index: 1; }
        .s-photo { width: 100%; height: 263px; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 16px rgba(27, 22, 51, 0.1); }
        .s-photo svg { width: 100%; height: 100%; display: block; }
        .stack-section.started .m-item { animation: settle 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.9s forwards; }
        .stack-section.started .stack-track { animation: scroll-rtl 26s linear 2.5s infinite; }
        .poster-title { opacity: 0; }
        .stack-section.started .poster-title { animation: title-fade 0.6s ease 2s forwards; }
        @keyframes title-fade { to { opacity: 1; } }
        @keyframes settle {
          from { transform: translateX(var(--fx)) translateY(var(--fy)) rotate(var(--fr)); }
          to { transform: translateX(0) translateY(0) rotate(0deg); }
        }
        @keyframes scroll-rtl {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (max-width: 700px) {
          .m-item { flex-basis: 130px; width: 130px; }
          .s-photo { height: 163px; }
          .fan-0 { --fx: 132px; --fy: 20px; }
          .fan-1 { --fx: 79px; --fy: 12px; }
          .fan-2 { --fx: 26px; --fy: 4px; }
          .fan-3 { --fx: -26px; --fy: 4px; }
          .fan-4 { --fx: -79px; --fy: 12px; }
          .fan-5 { --fx: -132px; --fy: 20px; }
        }
      `}</style>
    </div>
  );
}

export function HomeTools({ onQuiz }: { onQuiz: () => void }) {
  return (
    <section aria-label="Tools & scholarships" className="mx-auto w-full max-w-[960px]">
      <h2 className="text-center font-display text-[clamp(24px,3.6vw,34px)] font-extrabold tracking-tight">Networking starts here</h2>

      {/* Fanned poster carousel */}
      <PosterStack onQuiz={onQuiz} />

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
