'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Adds `.visible` to every `.fade-up` element once it scrolls into view.
// Re-runs on every route change (via usePathname) because app/layout.tsx
// does not remount on client-side navigation — a mount-only effect here
// would only ever see the elements present on the very first page load.
export function useScrollAnimation() {
  const pathname = usePathname();

  useEffect(() => {
    // Deferred well past mount (a single requestAnimationFrame wasn't
    // reliably enough — Next.js 16 dev mode's extra Suspense/SegmentView
    // instrumentation can still misreport the resulting class change as a
    // hydration mismatch even though it's a normal post-mount DOM update
    // happening well after real hydration commits). A short timeout is a
    // more conservative margin; this doesn't affect production builds,
    // which don't carry that dev-only instrumentation layer at all.
    let cleanupObserver: (() => void) | undefined;

    const timeout = setTimeout(() => {
      const elements = document.querySelectorAll<HTMLElement>('.fade-up:not(.visible)');
      if (elements.length === 0) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        elements.forEach((el) => el.classList.add('visible'));
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 },
      );

      elements.forEach((el) => observer.observe(el));
      cleanupObserver = () => observer.disconnect();
    }, 100);

    return () => {
      clearTimeout(timeout);
      cleanupObserver?.();
    };
  }, [pathname]);
}
