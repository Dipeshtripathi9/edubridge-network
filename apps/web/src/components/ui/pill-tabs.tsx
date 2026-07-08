'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

/**
 * Canonical brand tab bar — a pill "segmented control": rounded-full card track
 * with an ink-filled active pill. Same Radix API as ui/tabs so it's a drop-in.
 */
const PillTabs = TabsPrimitive.Root;

const PillTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex min-h-[2.75rem] flex-wrap items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm',
      className,
    )}
    {...props}
  />
));
PillTabsList.displayName = TabsPrimitive.List.displayName;

const PillTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-[13.5px] font-bold text-muted-foreground ring-offset-background transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm',
      className,
    )}
    {...props}
  />
));
PillTabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const PillTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn('mt-5 focus-visible:outline-none', className)} {...props} />
));
PillTabsContent.displayName = TabsPrimitive.Content.displayName;

export { PillTabs, PillTabsList, PillTabsTrigger, PillTabsContent };
