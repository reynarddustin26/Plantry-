'use client';

import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/motion';

// template.tsx (unlike layout.tsx) remounts on every navigation, so this
// re-triggers the enter animation on each route change automatically.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageTransition}
    >
      {children}
    </motion.div>
  );
}
