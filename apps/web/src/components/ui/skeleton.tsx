import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  // Shimmer sweep reads as "loading fast" — important on slow connections where a
  // static block would feel frozen.
  return <div className={cn('shimmer rounded-md bg-muted/70', className)} {...props} />;
}
