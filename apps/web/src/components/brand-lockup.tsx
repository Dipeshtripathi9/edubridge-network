'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

// EduBridge Network lockup: a violet graduation-cap disc + the "EDUBRIDGE"
// wordmark with "NETWORK" spaced beneath its tail. Doubles as the Home button.
export function BrandLockup({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      href="/home"
      aria-label="EduBridge Network — home"
      onClick={onClick}
      className={cn('inline-flex items-center gap-2.5', className)}
    >
      <svg viewBox="0 0 64 64" className="h-8 w-8 flex-none" aria-hidden>
        <circle cx="32" cy="32" r="28" fill="#5A31F4" />
        <path d="M13 26 L32 17 L51 26 L32 35 Z" stroke="#F6F4EE" strokeWidth="3.2" strokeLinejoin="round" fill="none" />
        <path d="M22 31.5 v6.5 c 5 4.2 15 4.2 20 0 v-6.5" stroke="#F6F4EE" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      </svg>
      <span className="relative inline-block pb-[0.5em] leading-none">
        <span
          className="block font-display text-[16px] font-bold uppercase tracking-[0.34em] text-foreground sm:text-[18px]"
          style={{ marginRight: '-0.34em' }}
        >
          EduBridge
        </span>
        <span className="absolute right-0 top-full -mt-[3px] flex w-[45%] justify-between font-display text-[6.5px] font-bold uppercase text-foreground sm:text-[7px]">
          {['N', 'E', 'T', 'W', 'O', 'R', 'K'].map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </span>
      </span>
    </Link>
  );
}
