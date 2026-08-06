export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-[19px] font-bold tracking-tight">{title}</h2>
      <div className="mt-2 space-y-3 text-[14.5px] leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export function LegalPageHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[2.8px] text-primary">
        <span className="h-0.5 w-[22px] rounded-full bg-marigold" /> {eyebrow}
      </span>
      <h1 className="mt-3 font-display text-[clamp(26px,4.2vw,40px)] font-extrabold tracking-[-.02em]">{title}</h1>
    </div>
  );
}
