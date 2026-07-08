import { cn } from '@/lib/utils';

/**
 * Branded page header used across the app — mono eyebrow with a marigold dash,
 * a Bricolage display title with an optional violet + marigold-arc accent word,
 * and an optional sub. Keeps every inner page consistent with the landing.
 */
export function PageHero({
  eyebrow,
  title,
  accent,
  sub,
  className,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn('pt-1', className)}>
      <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[2.8px] text-primary">
        <span className="h-0.5 w-[22px] rounded-full bg-marigold" /> {eyebrow}
      </span>
      <h1 className="mt-3 font-display text-[clamp(28px,5vw,44px)] font-extrabold leading-[1.06] tracking-[-.026em]">
        {title}{' '}
        {accent && (
          <span className="relative inline-block text-primary">
            {accent}
            <svg className="absolute -bottom-2 left-0 h-3 w-full text-marigold" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden>
              <path d="M4 16 C 80 2, 220 2, 296 16" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
            </svg>
          </span>
        )}
      </h1>
      {sub && <p className="mt-3 max-w-[560px] text-[16px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
