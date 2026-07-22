'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

const TAGS = {
  div: motion.div,
  section: motion.section,
  h2: motion.h2,
} as const;

interface FadeUpProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  as?: keyof typeof TAGS;
}

// Fade-in-on-scroll via Framer Motion's whileInView, which this app already
// uses elsewhere for animation — replaces an earlier hand-rolled
// IntersectionObserver + CSS class toggle (lib/hooks/useScrollAnimation.ts)
// that kept triggering a React dev-mode hydration-mismatch false positive
// no matter how long its mutation was deferred after mount. Framer Motion
// avoids the problem structurally: it renders the same "hidden" state
// consistently on server and client, then animates via its own internal
// mechanism post-hydration, rather than a raw className string React's
// hydration diff is comparing against server HTML.
export function FadeUp({ children, delay = 0, className, style, as = 'div' }: FadeUpProps) {
  const reduceMotion = useReducedMotion();
  const MotionTag = TAGS[as];

  return (
    <MotionTag
      className={className}
      style={style}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : delay, ease: 'easeOut' }}
    >
      {children}
    </MotionTag>
  );
}
