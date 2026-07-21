import type { Variants, Transition } from 'framer-motion';

// Timing/easing sourced from the ui-ux-pro-max motion.csv conventions
// ("Stagger List, Subtle" and "Hover Micro-interaction, Standard" rows),
// translated from GSAP to Framer Motion.

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.02 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export const cardHoverTransition: Transition = { duration: 0.25, ease: 'easeOut' };

export const cardHover = {
  y: -4,
  scale: 1.02,
  boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
};

export const cardTap = { scale: 0.98 };

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeInOut' },
  },
};
