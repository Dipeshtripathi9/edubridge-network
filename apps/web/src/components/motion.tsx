'use client';

import { LazyMotion, domAnimation, m } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Loads only framer-motion's DOM-animation feature set (`domAnimation`) instead
 * of the full `motion` bundle — roughly half the JavaScript. Wrap any subtree
 * that renders `m.*` components in <MotionProvider>. Covers entrance/exit
 * animations, keyframes, and hover/tap gestures (no drag or layout animations).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}

// Re-export the lightweight `m` component so callers import both from one place.
export { m };
