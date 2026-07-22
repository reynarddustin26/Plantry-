'use client';

import { useScrollAnimation } from '@/lib/hooks/useScrollAnimation';

// Mounted once in the root layout. Renders nothing — just wires up the
// fade-up-on-scroll behavior globally, page by page.
export function ScrollAnimationProvider() {
  useScrollAnimation();
  return null;
}
