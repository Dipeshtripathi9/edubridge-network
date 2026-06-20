import { cn, initials } from '@/lib/utils';

export function Avatar({
  src,
  name,
  className,
}: {
  src?: string | null;
  name?: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary',
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ?? 'avatar'} className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
