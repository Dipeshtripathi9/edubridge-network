import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

// Real fields only: any item with no value is silently skipped, both here
// and by the section wrapper below (a section with nothing to show renders
// nothing rather than an empty heading).
export function InfoGrid({ items }: { items: { label: string; value: ReactNode }[] }) {
  const visible = items.filter((i) => i.value !== null && i.value !== undefined && i.value !== '');
  if (visible.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
      {visible.map((i) => (
        <div key={i.label} className="min-w-0">
          <p className="text-xs text-muted-foreground">{i.label}</p>
          <p className="mt-0.5 text-sm font-semibold">{i.value}</p>
        </div>
      ))}
    </div>
  );
}

export function InfoSection({
  icon: Icon,
  title,
  items,
  extra,
  hasExtra,
}: {
  icon: LucideIcon;
  title: string;
  items: { label: string; value: ReactNode }[];
  extra?: ReactNode;
  // extra is often a JSX fragment wrapping conditionals — the fragment
  // itself is always truthy even when every conditional inside renders
  // nothing, so callers pass this explicit flag instead of relying on
  // `!!extra`.
  hasExtra?: boolean;
}) {
  const hasContent = items.some((i) => i.value !== null && i.value !== undefined && i.value !== '') || !!hasExtra;
  if (!hasContent) return null;
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 font-display text-[16px] font-semibold">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h3>
      <div className="border-t border-border pt-4">
        <InfoGrid items={items} />
        {extra}
      </div>
    </div>
  );
}
